import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config/api';
import { 
  Camera, 
  AlertCircle, 
  Video, 
  VideoOff, 
  RefreshCw, 
  Upload, 
  Scan, 
  Box, 
  CircleDot, 
  Layers,
  CheckCircle2,
  Sparkles,
  Hand
} from 'lucide-react';

const SHAPE_SCHEMAS = {
  box: [
    { id: 'front', label: '1. FRONT (Brand & Logo)' },
    { id: 'top', label: '2. TOP FLAP (MRP & Batch)' },
    { id: 'back', label: '3. BACK (Statutory Declarations)' },
    { id: 'left', label: '4. LEFT SIDE (Net Qty / USP)' },
    { id: 'right', label: '5. RIGHT SIDE (Consumer Care)' },
    { id: 'bottom', label: '6. BASE SEAL' }
  ],
  cylinder: [
    { id: 'front', label: '1. FRONT BODY (Brand Title)' },
    { id: 'back', label: '2. BACK BODY (Statutory & MRP)' },
    { id: 'top', label: '3. TOP CAP / RIM' },
    { id: 'bottom', label: '4. BASE SEAL' }
  ],
  pouch: [
    { id: 'front', label: '1. FRONT (Brand & Net Qty)' },
    { id: 'back', label: '2. BACK (MRP & Mfg Details)' },
    { id: 'top', label: '3. TOP SEAL' },
    { id: 'bottom', label: '4. BOTTOM GUSSET' }
  ]
};

export default function TurntableScanner({ onComplete, email }) {
  const { user } = useAuth();
  const [selectedShape, setSelectedShape] = useState('box');
  const [panelIdx, setPanelIdx] = useState(0);
  const [captured, setCaptured] = useState({});
  const [cameraActive, setCameraActive] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [isSnappingAnimation, setIsSnappingAnimation] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [highlightSnapPrompt, setHighlightSnapPrompt] = useState(false);

  // Centered square tracker state in container percentages [0-100]
  const [trackedCenter, setTrackedCenter] = useState({ x: 50, y: 50 });
  const [isObjectDetected, setIsObjectDetected] = useState(false);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);
  const trackerCanvasRef = useRef(null);
  const animFrameIdRef = useRef(null);
  const trackedCenterRef = useRef({ x: 50, y: 50 });
  const snapTimerRef = useRef(null);

  const panels = SHAPE_SCHEMAS[selectedShape] || SHAPE_SCHEMAS.box;
  const currentPanel = panels[panelIdx] || panels[0];

  const resetSnapHighlightTimer = useCallback(() => {
    setHighlightSnapPrompt(false);
    if (snapTimerRef.current) clearTimeout(snapTimerRef.current);
    if (cameraActive) {
      snapTimerRef.current = setTimeout(() => {
        setHighlightSnapPrompt(true);
      }, 4500);
    }
  }, [cameraActive]);

  // Object Center-Of-Mass Tracking Loop (Maintains clean square aspect)
  const trackObject = useCallback(() => {
    if (!videoRef.current || !cameraActive || isSnappingAnimation) {
      animFrameIdRef.current = requestAnimationFrame(trackObject);
      return;
    }

    const video = videoRef.current;
    if (video.readyState < 2) {
      animFrameIdRef.current = requestAnimationFrame(trackObject);
      return;
    }

    if (!trackerCanvasRef.current) {
      trackerCanvasRef.current = document.createElement('canvas');
      trackerCanvasRef.current.width = 100;
      trackerCanvasRef.current.height = 100;
    }

    const tCanvas = trackerCanvasRef.current;
    const tCtx = tCanvas.getContext('2d', { willReadFrequently: true });
    tCtx.drawImage(video, 0, 0, tCanvas.width, tCanvas.height);

    const frameData = tCtx.getImageData(0, 0, tCanvas.width, tCanvas.height).data;
    let sumX = 0;
    let sumY = 0;
    let edgeCount = 0;

    for (let y = 5; y < tCanvas.height - 5; y += 3) {
      for (let x = 5; x < tCanvas.width - 5; x += 3) {
        const idx = (y * tCanvas.width + x) * 4;
        const rightIdx = (y * tCanvas.width + (x + 1)) * 4;
        const downIdx = ((y + 1) * tCanvas.width + x) * 4;

        const gray = 0.299 * frameData[idx] + 0.587 * frameData[idx + 1] + 0.114 * frameData[idx + 2];
        const grayRight = 0.299 * frameData[rightIdx] + 0.587 * frameData[rightIdx + 1] + 0.114 * frameData[rightIdx + 2];
        const grayDown = 0.299 * frameData[downIdx] + 0.587 * frameData[downIdx + 1] + 0.114 * frameData[downIdx + 2];

        const grad = Math.abs(gray - grayRight) + Math.abs(gray - grayDown);
        if (grad > 28) {
          sumX += x;
          sumY += y;
          edgeCount++;
        }
      }
    }

    if (edgeCount > 25) {
      const rawCenterX = (sumX / edgeCount / tCanvas.width) * 100;
      const rawCenterY = (sumY / edgeCount / tCanvas.height) * 100;

      // Constrain center so the square frame never clips outside view
      const targetX = Math.max(40, Math.min(60, rawCenterX));
      const targetY = Math.max(40, Math.min(60, rawCenterY));

      const cur = trackedCenterRef.current;
      const lerp = (a, b, f) => a + (b - a) * f;
      const smoothCenter = {
        x: lerp(cur.x, targetX, 0.12),
        y: lerp(cur.y, targetY, 0.12)
      };

      trackedCenterRef.current = smoothCenter;
      setTrackedCenter(smoothCenter);
      setIsObjectDetected(true);
    } else {
      setIsObjectDetected(false);
    }

    animFrameIdRef.current = requestAnimationFrame(trackObject);
  }, [cameraActive, isSnappingAnimation]);

  useEffect(() => {
    if (cameraActive) {
      resetSnapHighlightTimer();
      animFrameIdRef.current = requestAnimationFrame(trackObject);
    }
    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      if (snapTimerRef.current) clearTimeout(snapTimerRef.current);
    };
  }, [cameraActive, trackObject, resetSnapHighlightTimer]);

  const startCamera = async () => {
    setErrorMessage('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 1920, min: 1280 }, 
          height: { ideal: 1080, min: 720 }, 
          facingMode: { ideal: 'environment' } 
        },
        audio: false
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraActive(true);
      resetSnapHighlightTimer();
    } catch (err) {
      setErrorMessage('Camera access denied. Please upload files directly.');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    if (snapTimerRef.current) clearTimeout(snapTimerRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraActive(false);
    setIsSnappingAnimation(false);
    setHighlightSnapPrompt(false);
  };

  useEffect(() => () => stopCamera(), []);

  // Optical Square Snap Execution (Extracts Clean 1:1 High-Res Object Crop)
  const snapWithTracking = () => {
    if (!videoRef.current || isSnappingAnimation) return;

    setIsSnappingAnimation(true);
    setHighlightSnapPrompt(false);
    if (snapTimerRef.current) clearTimeout(snapTimerRef.current);

    setTimeout(() => {
      const video = videoRef.current;
      if (!video) {
        setIsSnappingAnimation(false);
        return;
      }

      const vw = video.videoWidth || 1920;
      const vh = video.videoHeight || 1080;

      // Extract largest possible 1:1 square centered on the video feed
      const squareSize = Math.floor(Math.min(vw, vh) * 0.85);
      const cropX = Math.floor((vw - squareSize) / 2);
      const cropY = Math.floor((vh - squareSize) / 2);

      const canvas = document.createElement('canvas');
      canvas.width = squareSize;
      canvas.height = squareSize;
      const ctx = canvas.getContext('2d');

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(video, cropX, cropY, squareSize, squareSize, 0, 0, squareSize, squareSize);

      canvas.toBlob((blob) => {
        if (!blob) {
          setIsSnappingAnimation(false);
          return;
        }
        const file = new File([blob], `${currentPanel.id}.jpg`, { type: 'image/jpeg' });
        const url = URL.createObjectURL(blob);
        savePanel(file, url);
        setIsSnappingAnimation(false);
      }, 'image/jpeg', 0.98);
    }, 700);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const img = new Image();
    const tempUrl = URL.createObjectURL(file);
    img.onload = () => {
      const minDim = Math.min(img.width, img.height);
      const startX = (img.width - minDim) / 2;
      const startY = (img.height - minDim) / 2;

      const canvas = document.createElement('canvas');
      canvas.width = minDim;
      canvas.height = minDim;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, startX, startY, minDim, minDim, 0, 0, minDim, minDim);

      canvas.toBlob((blob) => {
        const normalizedFile = new File([blob], `${currentPanel.id}.jpg`, { type: 'image/jpeg' });
        const cleanUrl = URL.createObjectURL(blob);
        savePanel(normalizedFile, cleanUrl);
      }, 'image/jpeg', 0.98);
    };
    img.src = tempUrl;
  };

  const savePanel = (file, url) => {
    const currentId = currentPanel.id;
    const updated = { ...captured, [currentId]: { file, url } };
    setCaptured(updated);
    if (cameraActive) stopCamera();
  };

  const executeBatchInspection = async (allPanels = captured) => {
    const panelKeys = Object.keys(allPanels);
    if (panelKeys.length === 0) {
      setErrorMessage('Please capture or upload at least one panel before scanning.');
      return;
    }

    setScanning(true);
    setErrorMessage('');

    const fd = new FormData();
    const panelIds = [];

    panelKeys.forEach((id) => {
      if (allPanels[id]?.file) {
        fd.append('files', allPanels[id].file);
        panelIds.push(id);
      }
    });

    fd.append('panel_ids', panelIds.join(','));

    const submitterEmail = email || user?.email || localStorage.getItem('user_email') || 'anonymous';
    fd.append('email', submitterEmail);
    fd.append('username', submitterEmail);

    try {
      const res = await fetch(`${API_BASE_URL}/api/scan/analyze`, {
        method: 'POST',
        body: fd
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Audit rejected by statutory inspection engine');
      }

      let glbUrl = null;
      const primaryFile = allPanels.front?.file || allPanels[panelKeys[0]]?.file;
      if (primaryFile) {
        const glbFd = new FormData();
        glbFd.append('file', primaryFile);
        const glbRes = await fetch(`${API_BASE_URL}/api/scan/generate-digital-twin`, {
          method: 'POST',
          body: glbFd
        });
        if (glbRes.ok) {
          const glbBlob = await glbRes.blob();
          glbUrl = URL.createObjectURL(glbBlob);
        }
      }

      const cleanMap = data.clean_textures || data.textures || {};
      const fallbackClean = cleanMap.front || Object.values(cleanMap)[0] || allPanels.front?.url;

      const resolvedTextures = {
        front: cleanMap.front || fallbackClean,
        top: cleanMap.top || fallbackClean,
        back: cleanMap.back || fallbackClean,
        left: cleanMap.left || fallbackClean,
        right: cleanMap.right || fallbackClean,
        bottom: cleanMap.bottom || fallbackClean
      };

      if (onComplete) {
        onComplete({ 
          ...data, 
          glbUrl,
          textures: resolvedTextures, 
          clean_textures: resolvedTextures,
          geometry: selectedShape, 
          raw_captures: allPanels 
        });
      }
      stopCamera();
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setScanning(false);
    }
  };

  const capturedCount = Object.keys(captured).length;
  const currentCapture = captured[currentPanel.id];

  return (
    <div className="w-full max-w-xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-2xl space-y-4 text-slate-100 box-border">
      
      {/* Top Bar */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scan className="w-5 h-5 text-indigo-400 shrink-0" />
            <div>
              <h3 className="font-bold text-sm text-white">6-Axis Commodity Scanner</h3>
              <p className="text-[11px] text-slate-400">High-Precision Square Optical Capture</p>
            </div>
          </div>
          {cameraActive && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-950 border border-slate-800 text-[10px]">
              <span className={`w-2 h-2 rounded-full ${isObjectDetected ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
              <span className="text-slate-300 font-mono">{isObjectDetected ? 'LOCKED' : 'ALIGNING'}</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          {[
            { id: 'box', label: 'Box', icon: Box },
            { id: 'cylinder', label: 'Cylinder', icon: CircleDot },
            { id: 'pouch', label: 'Pouch', icon: Layers }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => { setSelectedShape(id); setPanelIdx(0); setCaptured({}); }}
              className={`py-1.5 px-2 rounded-lg font-medium flex items-center justify-center gap-1.5 transition text-xs ${
                selectedShape === id ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="p-3 bg-rose-950/60 border border-rose-800 rounded-xl text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Viewport (Square 1:1 Aspect Frame) */}
      <div className="w-full aspect-square max-w-[380px] mx-auto bg-slate-950 border border-slate-800 rounded-2xl relative overflow-hidden flex items-center justify-center shadow-inner">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`absolute inset-0 w-full h-full object-cover ${cameraActive ? 'block' : 'hidden'}`}
        />

        {cameraActive && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-6 z-10">
            {/* Square Bounding Target Reticle */}
            <div
              style={{
                transform: `translate(${(trackedCenter.x - 50) * 0.4}px, ${(trackedCenter.y - 50) * 0.4}px)`
              }}
              className={`w-[85%] aspect-square border-2 rounded-2xl flex flex-col justify-between p-3 transition-all duration-200 relative ${
                isSnappingAnimation 
                  ? 'border-cyan-400 shadow-[0_0_35px_rgba(34,211,238,0.9)] bg-cyan-500/10' 
                  : isObjectDetected 
                  ? 'border-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.35)]' 
                  : 'border-indigo-400 shadow-[0_0_0_9999px_rgba(0,0,0,0.55)]'
              }`}
            >
              {/* Corner Accents */}
              <div className="absolute -top-2 -left-2 w-4 h-4 border-t-3 border-l-3 border-white rounded-tl-sm" />
              <div className="absolute -top-2 -right-2 w-4 h-4 border-t-3 border-r-3 border-white rounded-tr-sm" />
              <div className="absolute -bottom-2 -left-2 w-4 h-4 border-b-3 border-l-3 border-white rounded-bl-sm" />
              <div className="absolute -bottom-2 -right-2 w-4 h-4 border-b-3 border-r-3 border-white rounded-br-sm" />

              {/* Status Badge */}
              <div className="flex items-center justify-between">
                <div className={`text-white font-mono text-[10px] px-2.5 py-0.5 rounded-full uppercase font-bold flex items-center gap-1 shadow ${
                  isSnappingAnimation ? 'bg-cyan-600' : isObjectDetected ? 'bg-emerald-600' : 'bg-indigo-600'
                }`}>
                  <Sparkles className="w-3 h-3" />
                  <span>{currentPanel.id} : {isSnappingAnimation ? 'SCANNING' : isObjectDetected ? 'LOCKED' : 'ALIGN'}</span>
                </div>
              </div>

              {/* Laser Scanning Line Animation */}
              {isSnappingAnimation && (
                <div 
                  className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-300 to-transparent shadow-[0_0_15px_#38bdf8] animate-pulse top-0"
                  style={{
                    animation: 'scanLaser 0.7s cubic-bezier(0.4, 0, 0.2, 1) infinite'
                  }}
                />
              )}

              <div className="text-center text-[11px] font-semibold text-slate-100 bg-black/80 py-1 px-2 rounded-lg backdrop-blur-md border border-white/10">
                {isSnappingAnimation ? 'Capturing High-Res Square...' : 'Fit object inside square frame'}
              </div>
            </div>
          </div>
        )}

        {/* Clean Square Preview */}
        {!cameraActive && currentCapture && (
          <div className="relative w-full h-full flex flex-col items-center justify-center p-3 z-10 bg-slate-950">
            <img
              src={currentCapture.url}
              alt="Captured panel"
              className="w-full h-full object-cover rounded-xl border border-slate-800 shadow-lg"
            />
            <div className="absolute bottom-4 left-4 right-4 bg-emerald-950/90 border border-emerald-600/80 backdrop-blur-md py-1.5 px-3 rounded-lg text-xs text-emerald-300 flex items-center justify-center gap-1.5 font-medium shadow-xl">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{currentPanel.label} saved</span>
            </div>
          </div>
        )}

        {!cameraActive && !currentCapture && (
          <div className="w-full px-4 text-center flex flex-col items-center justify-center space-y-2 z-10">
            <div className="p-3.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Camera className="w-7 h-7" />
            </div>
            <p className="text-xs font-semibold text-slate-200 text-center">{currentPanel.label}</p>
            <p className="text-[11px] text-slate-500 text-center">Open camera to capture square panel</p>
          </div>
        )}
      </div>

      {/* Panel Selectors */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center text-[11px] text-slate-400 px-1">
          <span>Panels</span>
          <span className="font-semibold text-slate-200">{capturedCount} / {panels.length}</span>
        </div>

        <div className={`grid gap-1.5 ${panels.length === 6 ? 'grid-cols-3 sm:grid-cols-6' : 'grid-cols-2 sm:grid-cols-4'}`}>
          {panels.map((p, i) => {
            const hasData = !!captured[p.id];
            const active = i === panelIdx;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => { setPanelIdx(i); resetSnapHighlightTimer(); }}
                className={`py-2 px-2 rounded-lg border text-[11px] font-bold uppercase transition flex items-center justify-center gap-1 ${
                  hasData
                    ? 'bg-emerald-950/50 border-emerald-500/80 text-emerald-300'
                    : active
                    ? 'bg-indigo-600/30 border-indigo-500 text-indigo-200'
                    : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300'
                }`}
              >
                <span>{p.id}</span>
                {hasData && <span className="text-emerald-400 text-xs">✓</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
        {!cameraActive ? (
          <button
            type="button"
            onClick={startCamera}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 rounded-xl font-medium text-xs flex items-center justify-center gap-1.5 transition shadow-md shadow-indigo-600/20"
          >
            <Video className="w-4 h-4" /> Start Square Camera
          </button>
        ) : (
          <div className="flex gap-1.5 relative">
            <button
              type="button"
              onClick={snapWithTracking}
              disabled={isSnappingAnimation}
              className={`flex-1 text-white py-2.5 rounded-xl font-medium text-xs flex items-center justify-center gap-1.5 transition relative ${
                isSnappingAnimation 
                  ? 'bg-cyan-600 cursor-wait' 
                  : highlightSnapPrompt
                  ? 'bg-emerald-500 ring-4 ring-emerald-400/60 animate-bounce shadow-xl shadow-emerald-500/40'
                  : 'bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/20'
              }`}
            >
              {highlightSnapPrompt && (
                <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-emerald-500 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-lg flex items-center gap-1 whitespace-nowrap animate-pulse">
                  <Hand className="w-3 h-3" /> Tap to Snap
                </span>
              )}
              <Camera className="w-4 h-4" />
              <span>
                {isSnappingAnimation 
                  ? 'Scanning Square Face...' 
                  : `Snap ${currentPanel.id.toUpperCase()}`}
              </span>
            </button>
            <button
              type="button"
              onClick={stopCamera}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 rounded-xl transition flex items-center justify-center"
            >
              <VideoOff className="w-4 h-4" />
            </button>
          </div>
        )}

        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleFileUpload}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current.click()}
          className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 py-2.5 rounded-xl font-medium text-xs flex items-center justify-center gap-1.5 transition"
        >
          <Upload className="w-4 h-4 text-slate-400" /> Upload Square File
        </button>
      </div>

      {/* Batch Submit Inspection */}
      {capturedCount > 0 && (
        <div className="pt-1">
          <button
            type="button"
            onClick={() => executeBatchInspection()}
            disabled={scanning}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:pointer-events-none text-white py-2.5 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${scanning ? 'animate-spin' : ''}`} />
            {scanning ? 'Auditing & Reconstructing Twin...' : `Scan & Audit ${capturedCount} Captured Faces`}
          </button>
        </div>
      )}
    </div>
  );
}
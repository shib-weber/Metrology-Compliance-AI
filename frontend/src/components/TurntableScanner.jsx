import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
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
  CheckCircle2
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
  const [errorMessage, setErrorMessage] = useState('');

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);

  const panels = SHAPE_SCHEMAS[selectedShape] || SHAPE_SCHEMAS.box;
  const currentPanel = panels[panelIdx] || panels[0];

  useEffect(() => {
    if (cameraActive && streamRef.current && videoRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(() => {});
    }
  }, [cameraActive]);

  const startCamera = async () => {
    setErrorMessage('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1920 }, height: { ideal: 1080 }, facingMode: 'environment' },
        audio: false
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err) {
      setErrorMessage('Camera access denied. Please upload files directly.');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraActive(false);
  };

  useEffect(() => () => stopCamera(), []);

  const snapCurrentView = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const vw = video.videoWidth || 1280;
    const vh = video.videoHeight || 720;

    const cw = Math.floor(vw * 0.55);
    const ch = Math.floor(vh * 0.80);
    const cx = Math.floor((vw - cw) / 2);
    const cy = Math.floor((vh - ch) / 2);

    const canvas = document.createElement('canvas');
    canvas.width = cw;
    canvas.height = ch;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, cx, cy, cw, ch, 0, 0, cw, ch);

    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], `${currentPanel.id}.jpg`, { type: 'image/jpeg' });
      const url = URL.createObjectURL(blob);
      savePanel(file, url);
    }, 'image/jpeg', 0.98);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const img = new Image();
    const tempUrl = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
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

    // Authenticated submitter email attached for personal audit logs
    const submitterEmail = email || user?.email || localStorage.getItem('user_email') || 'anonymous';
    fd.append('email', submitterEmail);
    fd.append('username', submitterEmail);

    try {
      // 1. Audit Analysis
      const res = await fetch('http://localhost:8000/api/scan/analyze', {
        method: 'POST',
        body: fd
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Audit rejected by statutory inspection engine');
      }

      // 2. Fetch True 3D Digital Twin Mesh (.glb)
      let glbUrl = null;
      const primaryFile = allPanels.front?.file || allPanels[panelKeys[0]]?.file;
      if (primaryFile) {
        const glbFd = new FormData();
        glbFd.append('file', primaryFile);
        const glbRes = await fetch('http://localhost:8000/api/scan/generate-digital-twin', {
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
      
      {/* Header & Shape Options */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Scan className="w-5 h-5 text-indigo-400 shrink-0" />
          <div>
            <h3 className="font-bold text-sm text-white">6-Axis Commodity Scanner</h3>
            <p className="text-[11px] text-slate-400">Capture standard surface panels</p>
          </div>
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

      {/* Main Viewport */}
      <div className="w-full aspect-[4/3] bg-slate-950 border border-slate-800 rounded-xl relative overflow-hidden flex items-center justify-center">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`absolute inset-0 w-full h-full object-cover ${cameraActive ? 'block' : 'hidden'}`}
        />

        {cameraActive && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-4 z-10">
            <div className="w-[65%] h-[85%] border-2 border-dashed border-emerald-400 rounded-xl shadow-[0_0_0_9999px_rgba(0,0,0,0.55)] flex flex-col justify-between p-2.5">
              <div className="bg-emerald-600 text-white font-mono text-[9px] px-2 py-0.5 rounded uppercase font-bold w-fit">
                ALIGN: {currentPanel.id}
              </div>
              <div className="text-center text-[10px] font-semibold text-slate-200 bg-black/70 py-1 rounded backdrop-blur-sm">
                Keep panel inside guide
              </div>
            </div>
          </div>
        )}

        {!cameraActive && currentCapture && (
          <div className="relative w-full h-full flex flex-col items-center justify-center p-2 z-10 bg-slate-950">
            <img
              src={currentCapture.url}
              alt="Captured panel"
              className="max-h-full max-w-full object-contain rounded-lg border border-slate-800"
            />
            <div className="absolute bottom-2 left-2 right-2 bg-emerald-950/80 border border-emerald-700/60 backdrop-blur-sm py-1 px-2 rounded text-[11px] text-emerald-300 flex items-center justify-center gap-1.5 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{currentPanel.label} saved</span>
            </div>
          </div>
        )}

        {!cameraActive && !currentCapture && (
          <div className="w-full px-4 text-center flex flex-col items-center justify-center space-y-2 z-10">
            <div className="p-3 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Camera className="w-6 h-6" />
            </div>
            <p className="text-xs font-semibold text-slate-200 text-center">{currentPanel.label}</p>
            <p className="text-[11px] text-slate-500 text-center">Capture or upload this face</p>
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
                onClick={() => setPanelIdx(i)}
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
            <Video className="w-4 h-4" /> Start Camera
          </button>
        ) : (
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={snapCurrentView}
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 rounded-xl font-medium text-xs flex items-center justify-center gap-1.5 transition shadow-md shadow-emerald-600/20"
            >
              <Camera className="w-4 h-4" /> Snap {currentPanel.id.toUpperCase()}
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
          <Upload className="w-4 h-4 text-slate-400" /> Upload File
        </button>
      </div>

      {/* Batch Submit Button */}
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
import React, { useState, useRef, useEffect } from 'react';
import { Camera, AlertCircle, Video, VideoOff, RefreshCw, Upload, Scan, Box, CircleDot, Layers } from 'lucide-react';

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

export default function TurntableScanner({ onComplete }) {
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
      const file = new File([blob], `${panels[panelIdx].id}.jpg`, { type: 'image/jpeg' });
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
        const normalizedFile = new File([blob], `${panels[panelIdx].id}.jpg`, { type: 'image/jpeg' });
        const cleanUrl = URL.createObjectURL(blob);
        savePanel(normalizedFile, cleanUrl);
      }, 'image/jpeg', 0.98);
    };
    img.src = tempUrl;
  };

  const savePanel = (file, url) => {
    const currentId = panels[panelIdx].id;
    const updated = { ...captured, [currentId]: { file, url } };
    setCaptured(updated);

    if (panelIdx < panels.length - 1) {
      setPanelIdx(panelIdx + 1);
    }
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

    try {
      const res = await fetch('http://localhost:8000/api/scan/analyze', {
        method: 'POST',
        body: fd
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Audit rejected by statutory inspection engine');
      }

      print(data.clean_textures)
      const cleanMap = data.clean_textures || {};
      const fallbackClean = cleanMap.front || Object.values(cleanMap)[0] || allPanels.front?.url;

      const resolvedTextures = {
        front: { url: cleanMap.front || fallbackClean },
        top: { url: cleanMap.top || fallbackClean },
        back: { url: cleanMap.back || fallbackClean },
        left: { url: cleanMap.left || fallbackClean },
        right: { url: cleanMap.right || fallbackClean },
        bottom: { url: cleanMap.bottom || fallbackClean }
      };

      onComplete({ ...data, textures: resolvedTextures, geometry: selectedShape, raw_captures: allPanels });
      stopCamera();
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-white text-sm flex items-center gap-2">
          <Scan className="w-4 h-4 text-indigo-400" />
          6-Axis Commodity Scanner
        </h3>
        <div className="flex gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
          <button
            type="button"
            onClick={() => { setSelectedShape('box'); setPanelIdx(0); setCaptured({}); }}
            className={`px-2 py-0.5 rounded font-medium flex items-center gap-1 transition ${selectedShape === 'box' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
          >
            <Box className="w-3 h-3" /> Box
          </button>
          <button
            type="button"
            onClick={() => { setSelectedShape('cylinder'); setPanelIdx(0); setCaptured({}); }}
            className={`px-2 py-0.5 rounded font-medium flex items-center gap-1 transition ${selectedShape === 'cylinder' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
          >
            <CircleDot className="w-3 h-3" /> Cylinder
          </button>
          <button
            type="button"
            onClick={() => { setSelectedShape('pouch'); setPanelIdx(0); setCaptured({}); }}
            className={`px-2 py-0.5 rounded font-medium flex items-center gap-1 transition ${selectedShape === 'pouch' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
          >
            <Layers className="w-3 h-3" /> Pouch
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="p-3 bg-rose-950/50 border border-rose-900 rounded-xl text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Viewport Frame */}
      <div className="aspect-[4/3] bg-slate-950 border-2 border-slate-800 rounded-2xl relative overflow-hidden flex items-center justify-center">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover ${cameraActive ? 'block' : 'hidden'}`}
        />

        {cameraActive && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="w-[55%] h-[80%] border-2 border-dashed border-emerald-400 rounded-xl shadow-[0_0_0_9999px_rgba(0,0,0,0.55)] flex flex-col justify-between p-3">
              <div className="bg-emerald-600 text-white font-mono text-[10px] px-2 py-0.5 rounded w-fit uppercase font-bold">
                ALIGN: {panels[panelIdx].label}
              </div>
              <div className="text-center text-[11px] font-semibold text-slate-200 bg-black/70 py-1 rounded backdrop-blur-sm">
                Position face inside the green boundary & snap
              </div>
            </div>
          </div>
        )}

        {!cameraActive && captured[panels[panelIdx].id] && (
          <img
            src={captured[panels[panelIdx].id].url}
            alt="Captured face preview"
            className="w-full h-full object-contain p-2"
          />
        )}

        {!cameraActive && !captured[panels[panelIdx].id] && (
          <div className="text-center p-6 space-y-2">
            <Camera className="w-10 h-10 text-indigo-400 mx-auto animate-bounce" />
            <p className="text-xs font-bold text-slate-200">{panels[panelIdx].label}</p>
            <p className="text-[11px] text-slate-500">Capture or upload photo of this face</p>
          </div>
        )}
      </div>

      {/* Face Indicators */}
      <div className={`grid gap-1 ${panels.length === 6 ? 'grid-cols-6' : 'grid-cols-4'}`}>
        {panels.map((p, i) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setPanelIdx(i)}
            className={`py-1.5 rounded-lg border text-[10px] font-bold uppercase transition flex flex-col items-center justify-center ${
              captured[p.id]
                ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300'
                : i === panelIdx
                ? 'bg-indigo-900/60 border-indigo-400 text-indigo-200'
                : 'bg-slate-950 border-slate-800 text-slate-500'
            }`}
          >
            <span>{p.id.slice(0, 3)}</span>
            {captured[p.id] && <span className="text-[9px] text-emerald-400">✓</span>}
          </button>
        ))}
      </div>

      {/* Controls */}
      <div className="grid grid-cols-2 gap-2">
        {!cameraActive ? (
          <button
            type="button"
            onClick={startCamera}
            className="bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition"
          >
            <Video className="w-3.5 h-3.5" /> Start Camera
          </button>
        ) : (
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={snapCurrentView}
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition"
            >
              <Camera className="w-3.5 h-3.5" /> Snap {panels[panelIdx].id.toUpperCase()}
            </button>
            <button
              type="button"
              onClick={stopCamera}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 rounded-xl text-xs transition"
            >
              <VideoOff className="w-3.5 h-3.5" />
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
          className="bg-slate-800 hover:bg-slate-700 text-slate-200 py-2.5 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition"
        >
          <Upload className="w-3.5 h-3.5" /> Upload File
        </button>
      </div>

      {Object.keys(captured).length > 0 && (
        <button
          type="button"
          onClick={() => executeBatchInspection()}
          disabled={scanning}
          className="w-full bg-indigo-600/30 hover:bg-indigo-600 border border-indigo-500/50 text-indigo-200 hover:text-white py-2.5 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-2"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${scanning ? 'animate-spin' : ''}`} />
          {scanning ? 'Extracting Text Face-by-Face...' : `Scan & Audit ${Object.keys(captured).length} Captured Faces`}
        </button>
      )}
    </div>
  );
}
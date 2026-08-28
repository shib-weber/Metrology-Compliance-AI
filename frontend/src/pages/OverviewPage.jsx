import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  Cpu, 
  Layers, 
  ShieldCheck, 
  Sparkles, 
  ArrowLeft, 
  CheckCircle2, 
  Database, 
  Scan, 
  Scale, 
  TrendingUp, 
  Server, 
  Smartphone, 
  Zap, 
  Eye, 
  Target, 
  Boxes, 
  Code2, 
  GitBranch, 
  Workflow, 
  Radio, 
  Download, 
  Shield, 
  FileCheck2, 
  Compass, 
  Box,
  CpuIcon
} from 'lucide-react';

const HERO_VIDEO_URL = '/hero.mp4';

const QUICK_ANCHORS = [
  { href: '#pipeline', label: '1. Pipeline' },
  { href: '#dataflow', label: '2. Dataflow Matrix' },
  { href: '#wireframes', label: '3. Scanner & 3D HUD' },
  { href: '#techstack', label: '4. Tech Stack' },
  { href: '#ai-engine', label: '5. AI & OCR' },
  { href: '#governance', label: '6. Governance & Scale' },
];

export default function OverviewPage() {
  const [selectedHudFace, setSelectedHudFace] = useState('Front');
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {});
    }
  }, []);

  return (
    <div className="relative min-h-screen w-full bg-[#07090e] text-slate-100 selection:bg-indigo-500 selection:text-white pb-32 font-sans scroll-smooth">
      
      {/* Background Video Layer */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none" aria-hidden="true">
        <video
          ref={videoRef}
          src={HERO_VIDEO_URL}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="w-full h-full object-cover opacity-40 brightness-75 contrast-125"
        />
        {/* Soft Contrast & Grid Vignette */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#07090e]/80 via-[#07090e]/60 to-[#07090e]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.15)_0%,transparent_70%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,#000_80%,transparent_100%)]" />
      </div>

      {/* Main Content Flow */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-16">
        
        {/* Top Meta Bar */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <Link
            to="/inspector"
            className="group inline-flex items-center gap-2.5 text-xs font-semibold text-slate-200 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-white/15 hover:border-indigo-400/50 px-4 py-2.5 rounded-xl transition-all shadow-lg backdrop-blur-md"
          >
            <ArrowLeft className="w-4 h-4 text-indigo-400 group-hover:-translate-x-1 transition-transform" />
            <span>Return to Workstation</span>
          </Link>
          
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-slate-900/80 border border-indigo-400/30 text-xs font-semibold text-indigo-200 shadow-md backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono text-[11px] uppercase tracking-wider text-slate-300">Spec v2.6.4</span>
            <span className="text-white/20">•</span>
            <span>Legal Metrology &amp; FSSAI Standard</span>
          </div>
        </header>

        {/* Hero Section */}
        <section className="w-full flex flex-col items-center justify-center text-center space-y-6 pt-4 pb-4">
          <div className="inline-flex p-3.5 rounded-2xl bg-indigo-500/15 border border-indigo-400/30 text-indigo-300 shadow-xl shadow-indigo-950/50">
            <Workflow className="w-8 h-8" />
          </div>
          
          <div className="space-y-4 max-w-4xl mx-auto flex flex-col items-center">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight text-center">
              Metronox <span className="bg-gradient-to-r from-indigo-300 via-indigo-100 to-indigo-400 bg-clip-text text-transparent">System Blueprint</span>
            </h1>
            
            <p className="text-sm sm:text-base text-slate-300 font-normal leading-relaxed max-w-3xl text-center">
              Autonomous 6-Axis AI Computer Vision, Real-Time Legal Metrology Enforcement, and 3D Photogrammetric Mesh Generation for Pre-Packaged Commodities.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1 text-xs font-mono text-slate-300">
            <span className="px-3.5 py-1.5 bg-slate-900/80 border border-white/10 rounded-lg">Rule 6 &amp; 7 Enforced</span>
            <span className="px-3.5 py-1.5 bg-slate-900/80 border border-white/10 rounded-lg">ZeroGPU Inference</span>
            <span className="px-3.5 py-1.5 bg-slate-900/80 border border-white/10 rounded-lg">Form V Automation</span>
          </div>

          {/* Quick Anchor Navigation */}
          <div className="pt-3 flex flex-wrap items-center justify-center gap-2.5 w-full max-w-5xl">
            {QUICK_ANCHORS.map((anchor) => (
              <a
                key={anchor.href}
                href={anchor.href}
                className="px-3.5 py-2 bg-slate-900/85 hover:bg-indigo-600 border border-white/10 hover:border-indigo-400/50 rounded-xl text-xs font-semibold text-slate-200 hover:text-white transition-all shadow-md backdrop-blur-md"
              >
                {anchor.label}
              </a>
            ))}
          </div>
        </section>

        {/* SECTION 1: STATUTORY FLOWCHART */}
        <section id="pipeline" className="space-y-6 pt-4">
          <div className="bg-slate-900/75 border border-white/15 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4 pb-5 border-b border-white/10">
              <div>
                <span className="font-mono text-[11px] font-bold text-indigo-300 tracking-wider uppercase bg-indigo-950 px-3 py-1 rounded-md border border-indigo-500/30">
                  Section 01
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5 mt-2.5">
                  <Workflow className="w-5 h-5 text-indigo-400" />
                  Complete Statutory Inspection Flowchart
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 mt-1">
                  Deterministic optical and metrological dataflow from camera sensor to statutory dossier
                </p>
              </div>
              <div className="flex items-center gap-2.5 px-3.5 py-2 bg-emerald-950/80 rounded-xl border border-emerald-500/40">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-xs font-mono font-medium text-emerald-300">
                  Execution Latency: &lt; 1.8s
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="bg-slate-950/90 border border-indigo-500/30 rounded-2xl p-5 flex flex-col justify-between space-y-3 shadow-lg">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-[10px] font-bold text-indigo-300 bg-indigo-950 px-2 py-0.5 rounded border border-indigo-500/30">NODE 01</span>
                    <Scan className="w-4 h-4 text-indigo-400" />
                  </div>
                  <h3 className="font-bold text-sm text-white">6-Axis Spatial Capture</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Captures 6 orthogonal faces with real-time boundary tracking locked at high-res 1:1 aspect ratio.
                  </p>
                </div>
                <div className="text-[11px] font-mono text-indigo-300 border-t border-white/10 pt-2.5 flex justify-between">
                  <span>React Canvas</span>
                  <span>MediaStream</span>
                </div>
              </div>

              <div className="bg-slate-950/90 border border-emerald-500/30 rounded-2xl p-5 flex flex-col justify-between space-y-3 shadow-lg">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-[10px] font-bold text-emerald-300 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/30">NODE 02</span>
                    <Eye className="w-4 h-4 text-emerald-400" />
                  </div>
                  <h3 className="font-bold text-sm text-white">CLAHE &amp; Normalization</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Eliminates perspective distortion, isolates Principal Display Area, and balances luminance.
                  </p>
                </div>
                <div className="text-[11px] font-mono text-emerald-300 border-t border-white/10 pt-2.5 flex justify-between">
                  <span>OpenCV Core</span>
                  <span>U2Net</span>
                </div>
              </div>

              <div className="bg-slate-950/90 border border-cyan-500/30 rounded-2xl p-5 flex flex-col justify-between space-y-3 shadow-lg">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-[10px] font-bold text-cyan-300 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-500/30">NODE 03</span>
                    <Cpu className="w-4 h-4 text-cyan-400" />
                  </div>
                  <h3 className="font-bold text-sm text-white">Multi-Pass OCR</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Multi-angle passes (0°, 90°, 180°, 270°) extracting MRP, Mfg/Exp dates, Batch, and Net Qty.
                  </p>
                </div>
                <div className="text-[11px] font-mono text-cyan-300 border-t border-white/10 pt-2.5 flex justify-between">
                  <span>ZeroGPU</span>
                  <span>PyTorch</span>
                </div>
              </div>

              <div className="bg-slate-950/90 border border-amber-500/30 rounded-2xl p-5 flex flex-col justify-between space-y-3 shadow-lg">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-[10px] font-bold text-amber-300 bg-amber-950 px-2 py-0.5 rounded border border-amber-500/30">NODE 04</span>
                    <Scale className="w-4 h-4 text-amber-400" />
                  </div>
                  <h3 className="font-bold text-sm text-white">Statutory Rule Check</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Cross-checks Rule 6, Rule 7 (Font Table 1), and FSSAI 2020 to flag compliance discrepancies.
                  </p>
                </div>
                <div className="text-[11px] font-mono text-amber-300 border-t border-white/10 pt-2.5 flex justify-between">
                  <span>PCR Rules</span>
                  <span>Codex 2011</span>
                </div>
              </div>

              <div className="bg-slate-950/90 border border-rose-500/30 rounded-2xl p-5 flex flex-col justify-between space-y-3 shadow-lg">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-[10px] font-bold text-rose-300 bg-rose-950 px-2 py-0.5 rounded border border-rose-500/30">NODE 05</span>
                    <Boxes className="w-4 h-4 text-rose-400" />
                  </div>
                  <h3 className="font-bold text-sm text-white">Twin &amp; Notice Export</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Generates a 3D .GLB digital twin model and exports Form V Compound Notices with citations.
                  </p>
                </div>
                <div className="text-[11px] font-mono text-rose-300 border-t border-white/10 pt-2.5 flex justify-between">
                  <span>Three.js</span>
                  <span>ReportLab</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: DATAFLOW MATRIX */}
        <section id="dataflow" className="space-y-6">
          <div className="bg-slate-900/75 border border-white/15 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="border-b border-white/10 pb-4">
              <span className="font-mono text-[11px] font-bold text-cyan-300 tracking-wider uppercase bg-cyan-950 px-3 py-1 rounded-md border border-cyan-500/30">
                Section 02
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5 mt-2.5">
                <GitBranch className="w-5 h-5 text-cyan-400" />
                Dataflow Matrix &amp; Network Topology
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                End-to-end client, serverless compute, and database architecture
              </p>
            </div>

            <div className="overflow-x-auto">
              <div className="min-w-[760px] bg-slate-950/95 p-6 rounded-2xl border border-white/10 space-y-4 font-mono text-xs">
                <div className="flex items-center justify-between gap-4 p-4 bg-slate-900/60 rounded-xl border border-white/5">
                  <div className="w-64 p-3.5 bg-indigo-950/60 border border-indigo-500/40 rounded-xl text-center">
                    <p className="font-bold text-indigo-200 text-sm">Client Web App</p>
                    <p className="text-xs text-slate-300 mt-0.5">Vite • React 19 • Tailwind CSS</p>
                  </div>
                  <div className="flex-1 text-center text-xs text-indigo-300 flex items-center justify-center gap-2">
                    <span className="h-[1px] flex-1 bg-indigo-500/40" />
                    <span>HTTPS / MultipartFormData ──▶</span>
                    <span className="h-[1px] flex-1 bg-indigo-500/40" />
                  </div>
                  <div className="w-64 p-3.5 bg-cyan-950/60 border border-cyan-500/40 rounded-xl text-center">
                    <p className="font-bold text-cyan-200 text-sm">FastAPI Gateway</p>
                    <p className="text-xs text-slate-300 mt-0.5">Port 7860 • Asynchronous REST</p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4 p-4 bg-slate-900/60 rounded-xl border border-white/5">
                  <div className="w-64 p-3.5 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-center">
                    <p className="font-bold text-emerald-200 text-sm">OpenCV Vision Core</p>
                    <p className="text-xs text-slate-300 mt-0.5">CLAHE • Multi-Rotation</p>
                  </div>
                  <div className="flex-1 text-center text-xs text-emerald-300 flex items-center justify-center gap-2">
                    <span className="h-[1px] flex-1 bg-emerald-500/40" />
                    <span>◀── Memory Tensor Buffers ──▶</span>
                    <span className="h-[1px] flex-1 bg-emerald-500/40" />
                  </div>
                  <div className="w-64 p-3.5 bg-amber-950/60 border border-amber-500/40 rounded-xl text-center">
                    <p className="font-bold text-amber-200 text-sm">ZeroGPU Inference</p>
                    <p className="text-xs text-slate-300 mt-0.5">PyTorch Statutory OCR Engine</p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4 p-4 bg-slate-900/60 rounded-xl border border-white/5">
                  <div className="w-64 p-3.5 bg-rose-950/60 border border-rose-500/40 rounded-xl text-center">
                    <p className="font-bold text-rose-200 text-sm">3D Mesh Synthesizer</p>
                    <p className="text-xs text-slate-300 mt-0.5">Trimesh • Binary .GLB Generation</p>
                  </div>
                  <div className="flex-1 text-center text-xs text-purple-300 flex items-center justify-center gap-2">
                    <span className="h-[1px] flex-1 bg-purple-500/40" />
                    <span>◀── Encrypted Audit Records ──▶</span>
                    <span className="h-[1px] flex-1 bg-purple-500/40" />
                  </div>
                  <div className="w-64 p-3.5 bg-purple-950/60 border border-purple-500/40 rounded-xl text-center">
                    <p className="font-bold text-purple-200 text-sm">Supabase PostgreSQL</p>
                    <p className="text-xs text-slate-300 mt-0.5">Row-Level Security • Citations</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3: SCANNER & 3D HUD */}
        <section id="wireframes" className="space-y-6">
          <div className="border-b border-white/10 pb-4">
            <span className="font-mono text-[11px] font-bold text-emerald-300 tracking-wider uppercase bg-emerald-950 px-3 py-1 rounded-md border border-emerald-500/30">
              Section 03
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5 mt-2.5">
              <Smartphone className="w-5 h-5 text-emerald-400" />
              Interactive UI Wireframes &amp; Spatial Viewports
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Live simulations of the mobile capture reticle and inspector 3D workstation
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-slate-900/75 border border-white/15 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Scan className="w-4 h-4 text-indigo-400" />
                  Mobile 6-Axis Scanner Reticle HUD
                </h3>
                <span className="text-xs font-mono text-emerald-300 bg-emerald-950 px-2.5 py-1 rounded-full border border-emerald-500/40">
                  RATIO 1:1 LOCK
                </span>
              </div>

              <div className="w-full max-w-[360px] mx-auto bg-slate-950 border border-indigo-500/30 rounded-2xl p-5 flex flex-col justify-between font-mono text-xs shadow-2xl space-y-4">
                <div className="flex justify-between items-center text-xs border-b border-white/10 pb-2.5">
                  <span className="text-slate-300 flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" /> 1080P_60FPS
                  </span>
                  <span className="text-indigo-200 bg-indigo-950 px-2.5 py-0.5 rounded-full border border-indigo-500/40">
                    FACET: {selectedHudFace.toUpperCase()} (1/6)
                  </span>
                </div>

                <div className="w-60 h-60 mx-auto border border-cyan-400/60 rounded-xl relative flex flex-col justify-between p-3 bg-cyan-950/20">
                  <div className="flex justify-between text-[10px] text-cyan-300 font-mono">
                    <span>[ALIGN_SPECIMEN]</span>
                    <span>FOV: 78.4°</span>
                  </div>

                  <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan-400" />
                  <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyan-400" />
                  <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyan-400" />
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyan-400" />
                  
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-9 h-9 border border-indigo-400/50 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-indigo-400 rounded-full" />
                    </div>
                  </div>

                  <div className="text-center text-[10px] text-slate-200 bg-black/80 py-1 rounded border border-white/10">
                    CENTER MASS LOCKED • CLAHE READY
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-white/10">
                  <div className="grid grid-cols-6 gap-1 text-[10px] text-center font-bold">
                    {['Front', 'Top', 'Back', 'Left', 'Right', 'Bottom'].map((face, index) => (
                      <button
                        key={face}
                        type="button"
                        onClick={() => setSelectedHudFace(face)}
                        className={`py-1.5 rounded transition-colors ${
                          selectedHudFace === face
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : index === 0
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                            : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        {face.slice(0, 3)}
                      </button>
                    ))}
                  </div>

                  <button 
                    type="button"
                    className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-center py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg"
                  >
                    CAPTURE ORTHOGONAL FRAME
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-slate-900/75 border border-white/15 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Boxes className="w-4 h-4 text-cyan-400" />
                  Inspector Workstation &amp; 3D Mesh
                </h3>
                <span className="text-xs font-mono text-cyan-300 bg-cyan-950 px-2.5 py-1 rounded-full border border-cyan-500/40">
                  WEBGL_VIEWER
                </span>
              </div>

              <div className="w-full max-w-[360px] mx-auto bg-slate-950 border border-cyan-500/30 rounded-2xl p-5 flex flex-col justify-between font-mono text-xs shadow-2xl space-y-4">
                <div className="flex justify-between items-center text-xs border-b border-white/10 pb-2.5">
                  <span className="text-white font-bold">DOSSIER #2026-0819</span>
                  <span className="text-emerald-300 bg-emerald-950 px-2.5 py-0.5 rounded border border-emerald-500/30">
                    PASS: 100/100
                  </span>
                </div>

                <div className="w-full h-40 bg-slate-900/90 border border-white/10 rounded-xl flex items-center justify-center text-center p-3 relative overflow-hidden">
                  <div className="w-24 h-24 border border-indigo-400/80 rounded-lg transform rotate-12 flex items-center justify-center text-xs text-indigo-200 bg-indigo-950/50 shadow-2xl">
                    <Box className="w-10 h-10 text-indigo-400 animate-pulse" />
                  </div>
                  <span className="absolute bottom-2.5 right-2.5 text-[9px] text-slate-300 bg-black/70 px-2 py-0.5 rounded">
                    ORBIT_ACTIVE
                  </span>
                </div>

                <div className="space-y-2 text-xs text-slate-300 bg-slate-900/70 p-3 rounded-xl border border-white/5">
                  <div className="flex justify-between">
                    <span className="text-slate-400">RULE 6(1)(e) MRP:</span>
                    <span className="text-emerald-400 font-semibold">₹ 120.79 (OK)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">RULE 7 TABLE 1 FONT:</span>
                    <span className="text-emerald-400 font-semibold">1.4mm &gt;= 1.0mm</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">FSSAI / BATCH NO:</span>
                    <span className="text-indigo-300 font-semibold">PX250820 (PASS)</span>
                  </div>
                </div>

                <button 
                  type="button"
                  className="w-full inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-center py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg"
                >
                  <Download className="w-4 h-4" />
                  <span>EXPORT FORM V CITATION (PDF)</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 4: TECH STACK */}
        <section id="techstack" className="space-y-6">
          <div className="border-b border-white/10 pb-4">
            <span className="font-mono text-[11px] font-bold text-indigo-300 tracking-wider uppercase bg-indigo-950 px-3 py-1 rounded-md border border-indigo-500/30">
              Section 04
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5 mt-2.5">
              <Code2 className="w-5 h-5 text-indigo-400" />
              Full Production Tech Stack
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              End-to-end frontend, API computation, and cloud database specifications
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-900/75 border border-white/15 backdrop-blur-xl rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 border border-indigo-400/30 text-indigo-300 flex items-center justify-center">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Frontend Architecture</h3>
                <p className="text-xs text-slate-400 mt-0.5">High-fidelity client application</p>
              </div>
              <ul className="space-y-3.5 text-xs text-slate-300">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong className="text-white">React 19 &amp; Vite:</strong> High-performance SPA client with fast route hydration.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong className="text-white">Tailwind CSS:</strong> Glassmorphic dark design system with dynamic viewport scaling.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong className="text-white">Three.js / React Three Fiber:</strong> Hardware-accelerated 3D WebGL rendering engine.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong className="text-white">HTML5 MediaStream API:</strong> Direct hardware camera feeds with real-time canvas crop.</span>
                </li>
              </ul>
            </div>

            <div className="bg-slate-900/75 border border-white/15 backdrop-blur-xl rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 flex items-center justify-center">
                <Server className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Backend Infrastructure</h3>
                <p className="text-xs text-slate-400 mt-0.5">Asynchronous computation core</p>
              </div>
              <ul className="space-y-3.5 text-xs text-slate-300">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong className="text-white">FastAPI (Python 3.10):</strong> Non-blocking high-throughput asynchronous REST endpoints.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong className="text-white">OpenCV (cv2):</strong> CLAHE contrast equalization and multi-axis spatial image rotation.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong className="text-white">Trimesh &amp; NumPy:</strong> Automated photogrammetric 3D specimen mesh synthesis (.GLB).</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong className="text-white">ReportLab Engine:</strong> Statutory PDF generation for Form V compounding notices.</span>
                </li>
              </ul>
            </div>

            <div className="bg-slate-900/75 border border-white/15 backdrop-blur-xl rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-400/30 text-cyan-300 flex items-center justify-center">
                <Database className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Cloud &amp; Database Layer</h3>
                <p className="text-xs text-slate-400 mt-0.5">Scalable serverless deployment</p>
              </div>
              <ul className="space-y-3.5 text-xs text-slate-300">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong className="text-white">Hugging Face ZeroGPU:</strong> Serverless dynamic CUDA resource scheduling on demand.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong className="text-white">Supabase Cloud PostgreSQL:</strong> Encrypted relational database with row-level security.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong className="text-white">SQLAlchemy ORM:</strong> Structured schema migration and reliable connection pooling.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong className="text-white">Vercel Edge Network:</strong> Global asset distribution providing sub-50ms static delivery.</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* SECTION 5: AI & OCR ENGINES */}
        <section id="ai-engine" className="space-y-6">
          <div className="border-b border-white/10 pb-4">
            <span className="font-mono text-[11px] font-bold text-amber-300 tracking-wider uppercase bg-amber-950 px-3 py-1 rounded-md border border-amber-500/30">
              Section 05
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5 mt-2.5">
              <Zap className="w-5 h-5 text-amber-400" />
              AI Capabilities &amp; Vision OCR Engines
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Edge-based processing combined with GPU-accelerated statutory verification
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-slate-900/75 border border-white/15 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-500/15 border border-indigo-400/30 text-indigo-300">
                  <CpuIcon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white">AI &amp; Computer Vision Engine</h3>
              </div>
              
              <div className="space-y-4 text-xs text-slate-300">
                <div className="p-4 bg-slate-950/90 rounded-2xl border border-white/10 space-y-1.5">
                  <p className="font-bold text-white flex items-center justify-between text-sm">
                    <span>1. Edge &amp; Contour Tracking</span>
                    <span className="text-[10px] font-mono text-indigo-300 bg-indigo-950 px-2 py-0.5 rounded">Client-Side</span>
                  </p>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Pixel gradient analysis locks a dynamic 1:1 bounding reticle to prevent perspective distortion prior to server upload.
                  </p>
                </div>

                <div className="p-4 bg-slate-950/90 rounded-2xl border border-white/10 space-y-1.5">
                  <p className="font-bold text-white flex items-center justify-between text-sm">
                    <span>2. Adaptive CLAHE Synthesis</span>
                    <span className="text-[10px] font-mono text-indigo-300 bg-indigo-950 px-2 py-0.5 rounded">OpenCV Core</span>
                  </p>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Equalizes the luminance channel across reflective, dark, or glossy surfaces, resolving OCR capture failures on live camera snaps.
                  </p>
                </div>

                <div className="p-4 bg-slate-950/90 rounded-2xl border border-white/10 space-y-1.5">
                  <p className="font-bold text-white flex items-center justify-between text-sm">
                    <span>3. Multi-Orientation OCR Pass</span>
                    <span className="text-[10px] font-mono text-indigo-300 bg-indigo-950 px-2 py-0.5 rounded">PyTorch GPU</span>
                  </p>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Evaluates rotations across 0°, 90°, 180°, and 270° to reliably extract micro-printed batch codes, dates, and statutory markings.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-slate-900/75 border border-white/15 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-400/30 text-emerald-300">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white">Core Advantages Over Manual Audits</h3>
              </div>

              <div className="space-y-4 text-xs text-slate-300">
                <div className="p-4 bg-slate-950/90 rounded-2xl border border-white/10 space-y-1.5">
                  <p className="font-bold text-emerald-300 flex items-center justify-between text-sm">
                    <span>99.4% Latency Reduction</span>
                    <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950 px-2 py-0.5 rounded">&lt; 1.8s Scan</span>
                  </p>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Reduces comprehensive packaging inspections from 15 minutes manually down to under 2 seconds across all legal schedules.
                  </p>
                </div>

                <div className="p-4 bg-slate-950/90 rounded-2xl border border-white/10 space-y-1.5">
                  <p className="font-bold text-emerald-300 flex items-center justify-between text-sm">
                    <span>Photogrammetric 3D Proof</span>
                    <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950 px-2 py-0.5 rounded">.GLB Twin</span>
                  </p>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Generates an interactive, tamper-evident digital twin that preserves the exact specimen condition for statutory court evidence.
                  </p>
                </div>

                <div className="p-4 bg-slate-950/90 rounded-2xl border border-white/10 space-y-1.5">
                  <p className="font-bold text-emerald-300 flex items-center justify-between text-sm">
                    <span>Zero Inspector Subjectivity</span>
                    <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950 px-2 py-0.5 rounded">Deterministic</span>
                  </p>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Exact pixel-to-millimeter ratio verification against Rule 7 Table 1 font matrices removes human inspection bias and errors.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 6: GOVERNANCE & SCALE */}
        <section id="governance" className="space-y-6">
          <div className="border-b border-white/10 pb-4">
            <span className="font-mono text-[11px] font-bold text-purple-300 tracking-wider uppercase bg-purple-950 px-3 py-1 rounded-md border border-purple-500/30">
              Section 06
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5 mt-2.5">
              <TrendingUp className="w-5 h-5 text-purple-400" />
              Scalability, Feasibility &amp; Data Governance
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Legal admissibility standards under the Indian Evidence Act and economic scaling
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-slate-900/75 border border-white/15 backdrop-blur-xl rounded-3xl p-6 shadow-xl space-y-2.5">
              <div className="text-indigo-400 font-bold text-xs flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Technical Feasibility
              </div>
              <h3 className="font-bold text-base text-white">Browser-Native Compute</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Requires zero specialized hardware; runs on standard mobile browsers using WebGL and WebRTC camera feeds.
              </p>
            </div>

            <div className="bg-slate-900/75 border border-white/15 backdrop-blur-xl rounded-3xl p-6 shadow-xl space-y-2.5">
              <div className="text-emerald-400 font-bold text-xs flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4" /> Economic Viability
              </div>
              <h3 className="font-bold text-base text-white">Serverless Scaling</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                ZeroGPU cold-start scheduling eliminates idle cloud costs, enabling high-volume scans at minimal operational expense.
              </p>
            </div>

            <div className="bg-slate-900/75 border border-white/15 backdrop-blur-xl rounded-3xl p-6 shadow-xl space-y-2.5">
              <div className="text-cyan-400 font-bold text-xs flex items-center gap-1.5">
                <Compass className="w-4 h-4" /> Scalability
              </div>
              <h3 className="font-bold text-base text-white">Microservice Sharding</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Stateless FastAPI workers enable seamless container horizontal autoscaling across distributed Kubernetes pods.
              </p>
            </div>

            <div className="bg-slate-900/75 border border-white/15 backdrop-blur-xl rounded-3xl p-6 shadow-xl space-y-2.5">
              <div className="text-amber-400 font-bold text-xs flex items-center gap-1.5">
                <Target className="w-4 h-4" /> Target Audience
              </div>
              <h3 className="font-bold text-base text-white">Enforcement &amp; FMCG</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Legal Metrology Officers, FSSAI Inspectors, FMCG Quality Assurance pipelines, and Consumer Rights organizations.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-slate-900/75 border border-white/15 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-indigo-400" />
                Security &amp; Legal Admissibility
              </h3>
              <div className="space-y-3.5 text-xs text-slate-300">
                <div className="flex items-start gap-3.5 p-4 bg-slate-950/90 rounded-2xl border border-white/10">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-white text-sm">Section 65B Indian Evidence Act Compliance</p>
                    <p className="text-xs text-slate-300 mt-1">Produces machine-verifiable audit logs and cryptographically hashed digital evidence for court proceedings.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3.5 p-4 bg-slate-950/90 rounded-2xl border border-white/10">
                  <FileCheck2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-white text-sm">Automated Form V Docketing</p>
                    <p className="text-xs text-slate-300 mt-1">Formats statutory compound notices with specific infraction citations (Rule 6, Rule 7, Rule 32) ready for immediate filing.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-900/75 border border-white/15 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Scale className="w-5 h-5 text-emerald-400" />
                Socio-Economic &amp; Regulatory Impact
              </h3>
              <div className="space-y-3.5 text-xs text-slate-300">
                <div className="flex items-start gap-3.5 p-4 bg-slate-950/90 rounded-2xl border border-white/10">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-white text-sm">Curbing Deceptive Downsizing (Shrinkflation)</p>
                    <p className="text-xs text-slate-300 mt-1">Enforces mandatory Unit Sale Price (USP) calculations to protect consumers from covert packaging shrinkage.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3.5 p-4 bg-slate-950/90 rounded-2xl border border-white/10">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-white text-sm">FMCG Pre-Production Validation</p>
                    <p className="text-xs text-slate-300 mt-1">Enables brands to verify packaging artwork prior to mass cylinder printing, eliminating risk of regulatory product recalls.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer Authority Badge */}
        <footer className="bg-slate-950/90 border border-white/15 rounded-2xl p-5 text-center text-xs text-slate-300 backdrop-blur-md">
          <p>
            Metronox Packaging Metrology Engine • Built in accordance with Legal Metrology (Packaged Commodities) Rules 2011 &amp; FSSAI Regulations.
          </p>
        </footer>

      </div>
    </div>
  );
}
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
  FileText,
  ChevronDown,
  AlertTriangle,
  Send,
  Sliders,
  Check
} from 'lucide-react';

const HERO_VIDEO_URL = '/hero.mp4';

const QUICK_ANCHORS = [
  { href: '#visual-pipeline-track', label: '1. Live Visual Pipeline' },
  { href: '#flowchart', label: '2. Statutory Flowchart' },
  { href: '#dataflow', label: '3. Dataflow Matrix' },
  { href: '#wireframes', label: '4. Scanner & 3D HUD' },
  { href: '#techstack', label: '5. Tech Stack' },
];

const ANIMATION_STAGES = [
  {
    step: '01',
    phase: 'REAL-WORLD ACQUISITION',
    title: '6-Axis Orthogonal Scanning',
    badge: 'Hardware Sensor Stream',
    desc: 'Target pre-packaged specimen is tracked in a locked 1:1 aspect ratio reticle. Laser bounds sweep across 6 orthogonal faces capturing raw 1080p frames.',
    stats: [
      { label: 'Aspect Ratio', val: '1:1 Locked' },
      { label: 'Facets', val: '6/6 Complete' },
      { label: 'Feed', val: '1080p 60FPS' }
    ]
  },
  {
    step: '02',
    phase: 'OPTICAL NORMALIZATION',
    title: 'CLAHE & Homography Normalization',
    badge: 'OpenCV Vision Core',
    desc: 'Contrast-Limited Adaptive Histogram Equalization cleans packaging glare and shadows. Optical perspective skew is restored (0.00° Affine).',
    stats: [
      { label: 'Deskew Angle', val: '0.00° Affine' },
      { label: 'Histogram', val: 'Equalized' },
      { label: 'PDA Region', val: 'Isolated (99.4%)' }
    ]
  },
  {
    step: '03',
    phase: 'TEXT & NUMERAL EXTRACTION',
    title: 'Multi-Pass ZeroGPU Inference',
    badge: 'PyTorch CUDA Engine',
    desc: 'Rotational 4-quadrant OCR (0°, 90°, 180°, 270°) extracts statutory text lines: MRP, Batch Number, Mfg & Exp Dates, Unit Sale Price, and FSSAI License Number.',
    stats: [
      { label: 'Confidence', val: '99.82%' },
      { label: 'Rotations', val: '4-Way Pass' },
      { label: 'Inference', val: '240ms ZeroGPU' }
    ]
  },
  {
    step: '04',
    phase: 'STATUTORY AUDIT',
    title: 'Legal Metrology & FSSAI Verification',
    badge: 'PCR 2011 & Codex Rules',
    desc: 'Extracted attributes are cross-referenced with PCR 2011 Rule 6, Rule 7 Table 1 font heights, and FSSAI 2020 rules.',
    stats: [
      { label: 'Rule 6(1)(e)', val: 'Passed' },
      { label: 'Rule 7 Table 1', val: '1.4mm (>=1.0mm)' },
      { label: 'Violations', val: '0 Flagged' }
    ]
  },
  {
    step: '05',
    phase: 'NOTICE GENERATION',
    title: 'Form V Dossier & Enforcement Routing',
    badge: 'ReportLab & Fast Mailer',
    desc: 'Statutory records are compiled and an automated compound notice (Form V) is sealed with cryptographic SHA-256 digest and routed directly to the Inspector workstation.',
    stats: [
      { label: 'Dossier Hash', val: 'SHA-256 Sealed' },
      { label: 'Routing', val: 'Inspector Inbox' },
      { label: 'Status', val: 'Legally Verified' }
    ]
  },
  {
    step: '06',
    phase: '3D TWIN SYNTHESIS',
    title: 'Photogrammetric 3D Specimen Mesh',
    badge: 'Trimesh & WebGL Binary',
    desc: 'All 6 calibrated surface textures are UV-mapped onto a real-scale 3D bounding mesh, compiling a downloadable .GLB digital twin for legal archiving.',
    stats: [
      { label: 'Format', val: 'Binary .GLB' },
      { label: 'Topology', val: 'Water-tight' },
      { label: 'Size', val: '2.84 MB' }
    ]
  }
];

export default function OverviewPage() {
  const [selectedHudFace, setSelectedHudFace] = useState('Front');
  const [videoReady, setVideoReady] = useState(false);
  const videoRef = useRef(null);

  // Pin & Scroll Animation Controller
  const trackRef = useRef(null);
  const [activeStage, setActiveStage] = useState(0);
  const [stageProgress, setStageProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!trackRef.current) return;
      const rect = trackRef.current.getBoundingClientRect();
      const totalScrollableDistance = trackRef.current.offsetHeight - window.innerHeight;

      if (totalScrollableDistance <= 0) return;

      const currentScroll = -rect.top;
      const progress = Math.max(0, Math.min(1, currentScroll / totalScrollableDistance));
      setStageProgress(progress);

      const stepIndex = Math.min(
        Math.floor(progress * ANIMATION_STAGES.length),
        ANIMATION_STAGES.length - 1
      );
      setActiveStage(stepIndex);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {});
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      video.pause();
      setVideoReady(true);
    }
  }, []);

  const curr = ANIMATION_STAGES[activeStage];

  return (
    <div className="relative min-h-screen w-full bg-[radial-gradient(65%_55%_at_50%_25%,rgba(99,102,241,0.35)_0%,rgba(30,27,75,0)_100%),radial-gradient(120%_90%_at_50%_10%,#1e1b4b_0%,#0f172a_100%)] text-slate-100 selection:bg-indigo-500 selection:text-white font-sans scroll-smooth">
      
      {/* Background Video Layer */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <video
          ref={videoRef}
          src={HERO_VIDEO_URL}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          onCanPlay={() => setVideoReady(true)}
          className={`w-full h-full object-cover transition-opacity duration-1000 ${
            videoReady ? 'opacity-40 brightness-90 contrast-125' : 'opacity-0'
          }`}
        />
        <div className="absolute inset-0 bg-[radial-gradient(90%_65%_at_50%_45%,rgba(15,23,42,0.2)_20%,rgba(15,23,42,0.75)_100%),linear-gradient(180deg,rgba(15,23,42,0.6)_0%,rgba(15,23,42,0.2)_30%,rgba(15,23,42,0.4)_70%,rgba(15,23,42,0.95)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,#000_80%,transparent_100%)]" />
      </div>

      {/* TOP HERO CONTENT */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12 space-y-12 flex flex-col items-center">
        
        {/* Meta Bar */}
        <header className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-white/10">
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

        {/* Hero Banner */}
        <section className="w-full flex flex-col items-center justify-center text-center space-y-6 pt-4">
          <div className="inline-flex p-3.5 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 shadow-xl shadow-indigo-950/50">
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

      </div>

      {/* FULL-SCREEN PINNED SCROLLTRACK */}
      <div 
        id="visual-pipeline-track" 
        ref={trackRef} 
        className="relative z-20 w-full h-[360vh]"
      >
        <div className="sticky top-0 h-screen w-full flex items-center justify-center px-4 sm:px-6 lg:px-8 py-4 pointer-events-auto">
          <div className="w-full max-w-7xl h-[88vh] bg-slate-950/95 border border-indigo-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-3xl flex flex-col justify-between overflow-hidden relative">
            
            <div className="flex items-center justify-between pb-4 border-b border-white/10 flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-indigo-950 text-indigo-300 border border-indigo-500/40 rounded-lg text-xs font-mono font-bold">
                  STAGE {curr.step} / 06
                </span>
                <span className="text-xs font-mono font-bold tracking-wider text-slate-300 uppercase">
                  {curr.phase}
                </span>
              </div>

              <div className="flex items-center gap-4 text-xs font-mono">
                <div className="flex items-center gap-2 bg-slate-900 px-3 py-1 rounded-full border border-white/10">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-slate-200">BUFFER: LIVE</span>
                </div>
                <span className="text-indigo-400 hidden sm:inline">
                  SCROLL PROGRESS: {Math.round(stageProgress * 100)}%
                </span>
              </div>
            </div>

            <div className="grid grid-cols-6 gap-2 font-mono text-xs my-2">
              {ANIMATION_STAGES.map((st, idx) => (
                <div
                  key={st.step}
                  className={`p-2 rounded-lg border text-center transition-all duration-300 ${
                    activeStage === idx
                      ? 'bg-indigo-950 border-indigo-400 text-white shadow-[0_0_15px_rgba(99,102,241,0.5)]'
                      : idx < activeStage
                      ? 'bg-slate-900/90 border-emerald-500/40 text-emerald-400'
                      : 'bg-slate-950/60 border-white/10 text-slate-500'
                  }`}
                >
                  <span className="text-[10px] font-bold block">NODE {st.step}</span>
                  <span className="text-[10px] truncate hidden md:block">{st.title.split(' ')[0]}</span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center my-auto">
              <div className="lg:col-span-7 h-[280px] sm:h-[340px] bg-slate-900/90 border border-indigo-500/30 rounded-2xl relative overflow-hidden flex items-center justify-center p-6 shadow-inner">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:2rem_2rem] pointer-events-none" />

                {activeStage === 0 && (
                  <div className="relative w-full h-full flex flex-col items-center justify-center">
                    <div className="relative w-48 h-48 sm:w-56 sm:h-56 border-2 border-indigo-400/80 rounded-xl bg-indigo-950/40 flex items-center justify-center shadow-[0_0_35px_rgba(99,102,241,0.4)]">
                      <div className="absolute -top-2 -left-2 w-4 h-4 border-t-2 border-l-2 border-indigo-400" />
                      <div className="absolute -top-2 -right-2 w-4 h-4 border-t-2 border-r-2 border-indigo-400" />
                      <div className="absolute -bottom-2 -left-2 w-4 h-4 border-b-2 border-l-2 border-indigo-400" />
                      <div className="absolute -bottom-2 -right-2 w-4 h-4 border-b-2 border-r-2 border-indigo-400" />
                      
                      <div className="w-24 h-24 border border-cyan-400/70 bg-cyan-950/50 rounded-lg flex items-center justify-center animate-[spin_10s_linear_infinite]">
                        <Box className="w-12 h-12 text-cyan-300 animate-pulse" />
                      </div>

                      <div className="absolute w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#22d3ee] animate-[bounce_2s_infinite]" />
                    </div>

                    <div className="absolute bottom-1 flex gap-1 font-mono text-[9px]">
                      {['FRONT', 'BACK', 'TOP', 'BOTTOM', 'LEFT', 'RIGHT'].map((f, idx) => (
                        <span key={f} className={`px-2 py-0.5 rounded ${idx === 0 ? 'bg-indigo-600 text-white font-bold' : 'bg-slate-800 text-slate-400'}`}>
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {activeStage === 1 && (
                  <div className="relative w-full h-full flex flex-col items-center justify-center">
                    <div className="w-56 h-56 border border-emerald-400/80 bg-emerald-950/30 rounded-xl p-4 flex flex-col justify-between shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                      <div className="flex justify-between items-center text-[10px] font-mono text-emerald-300">
                        <span>[AFFINE_HOMOGRAPHY]</span>
                        <span className="text-emerald-400">HIST_EQUALIZED</span>
                      </div>

                      <div className="relative my-auto w-full h-24 border border-dashed border-emerald-400 bg-emerald-900/40 rounded flex flex-col items-center justify-center p-2">
                        <Eye className="w-6 h-6 text-emerald-300 mb-1 animate-pulse" />
                        <span className="text-[10px] font-mono font-bold text-emerald-200">
                          PRINCIPAL DISPLAY AREA (PDA)
                        </span>
                        <span className="text-[8px] font-mono text-emerald-400/80">
                          Luminance Variance: &lt; 2.1%
                        </span>
                      </div>

                      <div className="text-[10px] font-mono text-center text-slate-300 bg-slate-950/90 py-1 rounded border border-white/10">
                        Perspective Skew Restored: 0.00°
                      </div>
                    </div>
                  </div>
                )}

                {activeStage === 2 && (
                  <div className="relative w-full h-full flex flex-col items-center justify-center">
                    <div className="w-64 sm:w-72 bg-slate-950 border border-cyan-400/70 rounded-xl p-4 space-y-2 font-mono text-xs shadow-[0_0_35px_rgba(6,182,212,0.35)]">
                      <div className="flex justify-between items-center text-cyan-300 pb-1.5 border-b border-white/10 text-[11px]">
                        <span className="flex items-center gap-1.5"><Cpu className="w-3.5 h-3.5 text-cyan-400" /> 4-WAY ROTATION OCR</span>
                        <span className="text-[9px] bg-cyan-950 text-cyan-300 px-1.5 py-0.5 rounded border border-cyan-500/40">240ms</span>
                      </div>

                      <div className="space-y-1 text-[10px] sm:text-[11px]">
                        <div className="p-1.5 bg-cyan-950/50 rounded border border-cyan-500/30 text-cyan-100 flex justify-between">
                          <span>MRP (INCL. TAXES):</span>
                          <span className="font-bold text-emerald-400">₹ 120.79</span>
                        </div>
                        <div className="p-1.5 bg-cyan-950/50 rounded border border-cyan-500/30 text-cyan-100 flex justify-between">
                          <span>BATCH / MFG:</span>
                          <span className="font-bold text-cyan-300">PX250820 • 08/2026</span>
                        </div>
                        <div className="p-1.5 bg-cyan-950/50 rounded border border-cyan-500/30 text-cyan-100 flex justify-between">
                          <span>NET QUANTITY:</span>
                          <span className="font-bold text-cyan-300">500 g</span>
                        </div>
                        <div className="p-1.5 bg-cyan-950/50 rounded border border-cyan-500/30 text-cyan-100 flex justify-between">
                          <span>FSSAI LIC:</span>
                          <span className="font-bold text-cyan-300">10017022006123</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeStage === 3 && (
                  <div className="relative w-full h-full flex flex-col items-center justify-center">
                    <div className="w-64 sm:w-72 bg-slate-950 border border-amber-400/80 rounded-xl p-4 space-y-2 font-mono text-xs shadow-[0_0_35px_rgba(245,158,11,0.35)]">
                      <div className="flex justify-between items-center text-amber-300 pb-1.5 border-b border-white/10 text-[11px]">
                        <span className="flex items-center gap-1.5"><Scale className="w-3.5 h-3.5 text-amber-400" /> STATUTORY CHECK</span>
                        <span className="text-[9px] bg-emerald-950 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/40">PASSED</span>
                      </div>

                      <div className="space-y-1 text-[10px] sm:text-[11px]">
                        <div className="flex items-center justify-between p-1.5 bg-slate-900 rounded border border-white/10">
                          <span className="text-slate-300">Rule 6(1)(e) Price:</span>
                          <span className="text-emerald-400 font-bold">COMPLIANT</span>
                        </div>
                        <div className="flex items-center justify-between p-1.5 bg-slate-900 rounded border border-white/10">
                          <span className="text-slate-300">Rule 7 Font (≥1.0mm):</span>
                          <span className="text-emerald-400 font-bold">1.4mm (OK)</span>
                        </div>
                        <div className="flex items-center justify-between p-1.5 bg-slate-900 rounded border border-white/10">
                          <span className="text-slate-300">FSSAI Registration:</span>
                          <span className="text-emerald-400 font-bold">VERIFIED</span>
                        </div>
                      </div>

                      <div className="p-1.5 bg-emerald-950/40 border border-emerald-500/30 rounded text-[10px] text-emerald-300 text-center font-bold">
                        ZERO STATUTORY DEFECTS FOUND
                      </div>
                    </div>
                  </div>
                )}

                {activeStage === 4 && (
                  <div className="relative w-full h-full flex flex-col items-center justify-center">
                    <div className="w-64 sm:w-72 bg-slate-950 border border-rose-400/80 rounded-xl p-4 space-y-2.5 font-mono text-xs shadow-[0_0_35px_rgba(244,63,94,0.35)]">
                      <div className="flex justify-between items-center text-rose-300 pb-1.5 border-b border-white/10 text-[11px]">
                        <span className="flex items-center gap-1.5"><FileText className="w-4 h-4 text-rose-400" /> FORM V DOSSIER</span>
                        <span className="text-[9px] bg-rose-950 text-rose-300 px-1.5 py-0.5 rounded border border-rose-500/40">SEALED</span>
                      </div>

                      <div className="p-2 bg-slate-900/90 rounded border border-white/10 space-y-1 text-[10px] sm:text-[11px]">
                        <div className="text-white font-bold flex justify-between">
                          <span>Dossier #2026-0819</span>
                          <span className="text-emerald-400">PASS</span>
                        </div>
                        <div className="text-slate-400 text-[9px]">SHA: 9f83...bc41</div>
                        <div className="text-indigo-300 text-[10px] flex items-center gap-1">
                          <Send className="w-3 h-3 text-indigo-400" /> Dispatched to Inspector Database
                        </div>
                      </div>

                      <div className="w-full bg-rose-600/30 border border-rose-500/50 text-rose-200 py-1.5 rounded text-center font-bold text-[10px]">
                        EVALUATION CERTIFICATE READY
                      </div>
                    </div>
                  </div>
                )}

                {activeStage === 5 && (
                  <div className="relative w-full h-full flex flex-col items-center justify-center">
                    <div className="w-56 h-56 bg-slate-950 border-2 border-indigo-400 rounded-xl p-4 flex flex-col items-center justify-between shadow-[0_0_40px_rgba(99,102,241,0.5)]">
                      <div className="w-full flex justify-between items-center text-[10px] font-mono text-indigo-300">
                        <span>[3D_MESH_COMPILED]</span>
                        <span className="text-emerald-400">GLB_READY</span>
                      </div>

                      <div className="w-24 h-24 border border-indigo-400/80 rounded-lg flex items-center justify-center text-indigo-200 bg-indigo-950/60 shadow-2xl animate-[spin_10s_linear_infinite]">
                        <Box className="w-12 h-12 text-indigo-400" />
                      </div>

                      <div className="w-full text-center text-[10px] font-mono text-slate-200 bg-slate-900 py-1 rounded border border-white/10">
                        Specimen_DigitalTwin.glb (2.84 MB)
                      </div>
                    </div>
                  </div>
                )}

              </div>

              <div className="lg:col-span-5 space-y-4">
                <div className="inline-flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-md bg-indigo-950 border border-indigo-500/40 text-xs font-mono font-bold text-indigo-300">
                    NODE {curr.step}
                  </span>
                  <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-md border border-emerald-500/30">
                    {curr.badge}
                  </span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-tight">
                  {curr.title}
                </h3>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {curr.desc}
                </p>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/10 font-mono">
                  {curr.stats.map((st) => (
                    <div key={st.label} className="p-2.5 bg-slate-900/80 rounded-xl border border-white/10">
                      <div className="text-[9px] text-slate-400 uppercase">{st.label}</div>
                      <div className="text-xs font-bold text-indigo-200 mt-0.5">{st.val}</div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            <div className="space-y-2 pt-3 border-t border-white/10">
              <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-white/10">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400 transition-all duration-200"
                  style={{ width: `${Math.round(stageProgress * 100)}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span className="flex items-center gap-1.5">
                  <ChevronDown className="w-3.5 h-3.5 text-indigo-400 animate-bounce" /> 
                  {activeStage < 5 ? 'Scroll down to step through pipeline animation' : 'Pipeline complete! Continue scrolling to view blueprint architecture'}
                </span>
                <span className="text-indigo-300 font-bold">
                  {activeStage < 5 ? `Stage ${activeStage + 1} of 6` : 'Unlocked 🔓'}
                </span>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* REST OF BLUEPRINT SECTIONS */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 flex flex-col items-center pt-8 pb-32">
        
        {/* ========================================================================= */}
        {/* SECTION 1: FULL SVG-NATIVE VECTOR FLOWCHART (PERFECT SINGLE VIEW EVERYWHERE) */}
        {/* ========================================================================= */}
        <section id="flowchart" className="w-full space-y-4 pt-4 scroll-mt-20">
          <div className="bg-slate-900/85 border border-white/15 backdrop-blur-2xl rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl space-y-4">
            
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-white/10">
              <div>
                <span className="font-mono text-[10px] font-bold text-indigo-300 tracking-wider uppercase bg-indigo-950 px-2.5 py-0.5 rounded border border-indigo-500/30">
                  Section 01 • Pure Vector Single View Circuit
                </span>
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white flex items-center gap-2 mt-1">
                  <Workflow className="w-5 h-5 text-indigo-400 shrink-0" />
                  Statutory Decision Logic &amp; Enforcement Flowchart
                </h2>
              </div>
              
              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="px-2.5 py-1 bg-emerald-950/80 text-emerald-300 rounded-lg border border-emerald-500/40 flex items-center gap-1.5 text-[10px]">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  Latency &lt; 1.8s
                </span>
              </div>
            </div>

            {/* FULL SVG NATIVE CIRCUIT CONTAINER */}
            <div className="relative w-full bg-slate-950/95 border border-indigo-500/30 rounded-2xl overflow-hidden shadow-2xl p-1 sm:p-2">
              
              <svg 
                className="w-full h-auto block select-none" 
                viewBox="0 0 960 560" 
                preserveAspectRatio="xMidYMid meet"
              >
                <defs>
                  {/* Background Grid Pattern */}
                  <pattern id="circuit-grid" width="24" height="24" patternUnits="userSpaceOnUse">
                    <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#ffffff06" strokeWidth="1" />
                  </pattern>

                  {/* Flow Arrow Markers */}
                  <marker id="arr-indigo" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                    <path d="M0,0 L6,3 L0,6 Z" fill="#818cf8" />
                  </marker>
                  <marker id="arr-cyan" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                    <path d="M0,0 L6,3 L0,6 Z" fill="#22d3ee" />
                  </marker>
                  <marker id="arr-emerald" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                    <path d="M0,0 L6,3 L0,6 Z" fill="#34d399" />
                  </marker>
                  <marker id="arr-rose" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                    <path d="M0,0 L6,3 L0,6 Z" fill="#fb7185" />
                  </marker>
                  <marker id="arr-purple" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                    <path d="M0,0 L6,3 L0,6 Z" fill="#c084fc" />
                  </marker>
                  <marker id="arr-amber" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                    <path d="M0,0 L6,3 L0,6 Z" fill="#fbbf24" />
                  </marker>
                </defs>

                {/* Technical Canvas Background */}
                <rect width="960" height="560" fill="#030712" rx="12" />
                <rect width="960" height="560" fill="url(#circuit-grid)" rx="12" />

                {/* ========================================================================= */}
                {/* 1. CONNECTING WIRES & CIRCUIT BUSES */}
                {/* ========================================================================= */}

                {/* Wire 1: Start -> Ingest Parallelogram */}
                <path d="M 480 44 L 480 66" stroke="#818cf8" strokeWidth="2" fill="none" markerEnd="url(#arr-indigo)" />

                {/* Wire 2: Ingest Parallelogram -> Decision 1 */}
                <path d="M 480 126 L 480 148" stroke="#22d3ee" strokeWidth="2" fill="none" markerEnd="url(#arr-cyan)" />

                {/* Wire 3: Decision 1 NO (Left Loopback to Ingest) */}
                <path d="M 426 195 L 340 195 L 340 96 L 366 96" stroke="#fb7185" strokeWidth="1.75" strokeDasharray="4 4" fill="none" markerEnd="url(#arr-rose)" />

                {/* Wire 4: Decision 1 YES -> Branch to CLAHE (Left) & OCR (Right) */}
                <path d="M 464 225 L 464 246 L 290 246 L 290 264" stroke="#818cf8" strokeWidth="2" fill="none" markerEnd="url(#arr-indigo)" />
                <path d="M 496 225 L 496 246 L 670 246 L 670 264" stroke="#22d3ee" strokeWidth="2" fill="none" markerEnd="url(#arr-cyan)" />

                {/* Wire 5: Join CLAHE + OCR into Decision 2 */}
                <path d="M 290 324 L 290 348 L 444 348 L 444 366" stroke="#818cf8" strokeWidth="2" fill="none" markerEnd="url(#arr-purple)" />
                <path d="M 670 324 L 670 348 L 516 348 L 516 366" stroke="#22d3ee" strokeWidth="2" fill="none" markerEnd="url(#arr-purple)" />

                {/* Wire 6: Decision 2 NO -> Form V Notice Parallelogram */}
                <path d="M 426 405 L 290 405 L 290 432" stroke="#fb7185" strokeWidth="2" fill="none" markerEnd="url(#arr-rose)" />

                {/* Wire 7: Decision 2 YES -> 3D Twin Parallelogram */}
                <path d="M 534 405 L 670 405 L 670 432" stroke="#34d399" strokeWidth="2" fill="none" markerEnd="url(#arr-emerald)" />

                {/* Wire 8: Merge Form V + 3D Twin -> Stop Terminator */}
                <path d="M 290 492 L 290 514 L 402 514 L 402 528" stroke="#fb7185" strokeWidth="1.75" fill="none" markerEnd="url(#arr-emerald)" />
                <path d="M 670 492 L 670 514 L 558 514 L 558 528" stroke="#34d399" strokeWidth="1.75" fill="none" markerEnd="url(#arr-emerald)" />

                {/* ========================================================================= */}
                {/* 2. FLOWCHART NODES & SHAPES */}
                {/* ========================================================================= */}

                {/* 1. START TERMINATOR (OVAL) */}
                <g transform="translate(480, 26)">
                  <rect x="-115" y="-16" width="230" height="32" rx="16" fill="#1e1b4b" stroke="#818cf8" strokeWidth="2" />
                  <circle cx="-95" cy="0" r="4" fill="#fbbf24" />
                  <text x="-82" y="4" fill="#ffffff" fontFamily="monospace" fontSize="11" fontWeight="bold">START: Ingest Specimen</text>
                  <rect x="52" y="-10" width="52" height="20" rx="4" fill="#0f172a" stroke="#818cf8" strokeWidth="0.8" />
                  <text x="78" y="4" textAnchor="middle" fill="#818cf8" fontFamily="monospace" fontSize="8" fontWeight="bold">React 19</text>
                </g>

                {/* 2. INPUT DATA (PARALLELOGRAM: skewX -15) */}
                <g transform="translate(480, 96)">
                  <polygon points="-110,-28 120,-28 100,28 -130,28" fill="#030712" stroke="#22d3ee" strokeWidth="2" />
                  <text x="0" y="-11" textAnchor="middle" fill="#22d3ee" fontFamily="monospace" fontSize="8" fontWeight="bold" letterSpacing="1">[INPUT DATA]</text>
                  <text x="0" y="4" textAnchor="middle" fill="#ffffff" fontFamily="monospace" fontSize="11" fontWeight="bold">Read 6 Orthogonal Faces</text>
                  <text x="0" y="18" textAnchor="middle" fill="#94a3b8" fontFamily="monospace" fontSize="8">OpenCV • MediaStream (1080p)</text>
                </g>

                {/* 3. DECISION 01 (DIAMOND: 45 DEGREE ROTATION) */}
                <g transform="translate(480, 195)">
                  <polygon points="0,-42 54,0 0,42 -54,0" fill="#030712" stroke="#fbbf24" strokeWidth="2" />
                  <text x="0" y="-8" textAnchor="middle" fill="#fbbf24" fontFamily="monospace" fontSize="8" fontWeight="bold">IS 6/6</text>
                  <text x="0" y="7" textAnchor="middle" fill="#ffffff" fontFamily="monospace" fontSize="10" fontWeight="bold">Faces OK?</text>
                  
                  {/* Branch Labels */}
                  <rect x="-105" y="-10" width="46" height="18" rx="4" fill="#4c0519" stroke="#fb7185" strokeWidth="0.8" />
                  <text x="-82" y="2" textAnchor="middle" fill="#fb7185" fontFamily="monospace" fontSize="8" fontWeight="bold">NO (Loop)</text>
                  
                  <rect x="-16" y="46" width="32" height="16" rx="4" fill="#064e3b" stroke="#34d399" strokeWidth="0.8" />
                  <text x="0" y="58" textAnchor="middle" fill="#34d399" fontFamily="monospace" fontSize="8" fontWeight="bold">YES</text>
                </g>

                {/* 4. PROCESS A: CLAHE (RECTANGLE) */}
                <g transform="translate(290, 294)">
                  <rect x="-115" y="-28" width="230" height="56" rx="8" fill="#030712" stroke="#818cf8" strokeWidth="2" />
                  <text x="-105" y="-12" fill="#818cf8" fontFamily="monospace" fontSize="8" fontWeight="bold">[PROCESS] CLAHE &amp; PDA</text>
                  <text x="105" y="-12" textAnchor="end" fill="#94a3b8" fontFamily="monospace" fontSize="8">0.00° Affine</text>
                  <text x="-105" y="5" fill="#ffffff" fontFamily="monospace" fontSize="10.5" fontWeight="bold">Histogram &amp; Skew Equalized</text>
                  <line x1="-105" y1="12" x2="105" y2="12" stroke="#ffffff15" strokeWidth="1" />
                  <text x="-105" y="22" fill="#94a3b8" fontFamily="monospace" fontSize="8">OpenCV Vision Core</text>
                  <text x="105" y="22" textAnchor="end" fill="#818cf8" fontFamily="monospace" fontSize="8">CLAHE.py</text>
                </g>

                {/* 5. PROCESS B: MULTI-PASS OCR (RECTANGLE) */}
                <g transform="translate(670, 294)">
                  <rect x="-115" y="-28" width="230" height="56" rx="8" fill="#030712" stroke="#22d3ee" strokeWidth="2" />
                  <text x="-105" y="-12" fill="#22d3ee" fontFamily="monospace" fontSize="8" fontWeight="bold">[PROCESS] Multi-Pass OCR</text>
                  <text x="105" y="-12" textAnchor="end" fill="#34d399" fontFamily="monospace" fontSize="8" fontWeight="bold">99.8% Conf</text>
                  <text x="-105" y="5" fill="#ffffff" fontFamily="monospace" fontSize="10.5" fontWeight="bold">MRP, Qty, Dates, FSSAI</text>
                  <line x1="-105" y1="12" x2="105" y2="12" stroke="#ffffff15" strokeWidth="1" />
                  <text x="-105" y="22" fill="#94a3b8" fontFamily="monospace" fontSize="8">PyTorch • ZeroGPU</text>
                  <text x="105" y="22" textAnchor="end" fill="#22d3ee" fontFamily="monospace" fontSize="8">240ms</text>
                </g>

                {/* 6. DECISION 02: STATUTORY AUDIT (DIAMOND) */}
                <g transform="translate(480, 405)">
                  <polygon points="0,-44 54,0 0,44 -54,0" fill="#030712" stroke="#c084fc" strokeWidth="2" />
                  <text x="0" y="-8" textAnchor="middle" fill="#c084fc" fontFamily="monospace" fontSize="8" fontWeight="bold">PCR 2011</text>
                  <text x="0" y="7" textAnchor="middle" fill="#ffffff" fontFamily="monospace" fontSize="10" fontWeight="bold">Rule 6 &amp; 7?</text>
                  
                  {/* Branch Labels */}
                  <rect x="-110" y="-10" width="52" height="18" rx="4" fill="#4c0519" stroke="#fb7185" strokeWidth="0.8" />
                  <text x="-84" y="2" textAnchor="middle" fill="#fb7185" fontFamily="monospace" fontSize="8" fontWeight="bold">NO (Defect)</text>
                  
                  <rect x="58" y="-10" width="52" height="18" rx="4" fill="#064e3b" stroke="#34d399" strokeWidth="0.8" />
                  <text x="84" y="2" textAnchor="middle" fill="#34d399" fontFamily="monospace" fontSize="8" fontWeight="bold">YES (Pass)</text>
                </g>

                {/* 7. OUTPUT A: FORM V DOSSIER (PARALLELOGRAM) */}
                <g transform="translate(290, 462)">
                  <polygon points="-100,-28 125,-28 105,28 -120,28" fill="#4c0519" fillOpacity="0.4" stroke="#fb7185" strokeWidth="2" />
                  <text x="0" y="-11" textAnchor="middle" fill="#fb7185" fontFamily="monospace" fontSize="8" fontWeight="bold">[OUTPUT NOTICE] Form V Dossier</text>
                  <text x="0" y="4" textAnchor="middle" fill="#ffffff" fontFamily="monospace" fontSize="10" fontWeight="bold">Rule 39 Penalty &amp; Citations</text>
                  <text x="0" y="17" textAnchor="middle" fill="#cbd5e1" fontFamily="monospace" fontSize="8">ReportLab • SHA-256 Digest</text>
                </g>

                {/* 8. OUTPUT B: 3D DIGITAL TWIN (PARALLELOGRAM) */}
                <g transform="translate(670, 462)">
                  <polygon points="-100,-28 125,-28 105,28 -120,28" fill="#064e3b" fillOpacity="0.4" stroke="#34d399" strokeWidth="2" />
                  <text x="0" y="-11" textAnchor="middle" fill="#34d399" fontFamily="monospace" fontSize="8" fontWeight="bold">[OUTPUT TWIN] 3D Mesh .GLB</text>
                  <text x="0" y="4" textAnchor="middle" fill="#ffffff" fontFamily="monospace" fontSize="10" fontWeight="bold">100% Compliant Certificate</text>
                  <text x="0" y="17" textAnchor="middle" fill="#cbd5e1" fontFamily="monospace" fontSize="8">Trimesh • Three.js WebGL</text>
                </g>

                {/* 9. STOP TERMINATOR (OVAL) */}
                <g transform="translate(480, 540)">
                  <rect x="-120" y="-15" width="240" height="30" rx="15" fill="#064e3b" stroke="#34d399" strokeWidth="2" />
                  <circle cx="-100" cy="0" r="4" fill="#34d399" />
                  <text x="-88" y="4" fill="#ffffff" fontFamily="monospace" fontSize="10" fontWeight="bold">STOP: Persist to Database</text>
                  <rect x="48" y="-10" width="62" height="20" rx="4" fill="#030712" stroke="#34d399" strokeWidth="0.8" />
                  <text x="79" y="4" textAnchor="middle" fill="#34d399" fontFamily="monospace" fontSize="8" fontWeight="bold">Supabase RLS</text>
                </g>

              </svg>

            </div>

          </div>
        </section>

        {/* SECTION 2: DATAFLOW MATRIX */}
        <section id="dataflow" className="w-full space-y-6">
          <div className="bg-slate-900/75 border border-white/15 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
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
        <section id="wireframes" className="w-full space-y-6">
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
            <div className="bg-slate-900/75 border border-white/15 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5">
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

            <div className="bg-slate-900/75 border border-white/15 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5">
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

        {/* SECTION 4: PRODUCTION TECH STACK */}
        <section id="techstack" className="w-full space-y-6">
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
            <div className="bg-slate-900/75 border border-white/15 backdrop-blur-2xl rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 hover:-translate-y-1 transition-transform duration-300">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 flex items-center justify-center">
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

            <div className="bg-slate-900/75 border border-white/15 backdrop-blur-2xl rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 hover:-translate-y-1 transition-transform duration-300">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 flex items-center justify-center">
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

            <div className="bg-slate-900/75 border border-white/15 backdrop-blur-2xl rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 hover:-translate-y-1 transition-transform duration-300">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 flex items-center justify-center">
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
                  <span><strong className="text-white">Docker Hub Deployments:</strong> Multi-stage isolated microservice containers.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong className="text-white">Edge Storage:</strong> Real-time signed CDN bucket hosting for scanned dossiers.</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
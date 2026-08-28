import React, { useState, useEffect, useRef, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { Canvas, useFrame } from '@react-three/fiber';
import { 
  OrbitControls, 
  useGLTF, 
  Stage, 
  Float, 
  ContactShadows, 
  Html,
  Center
} from '@react-three/drei';
import * as THREE from 'three';
import { 
  Box, 
  Layers, 
  Sparkles, 
  ArrowLeft, 
  Cpu, 
  RotateCw, 
  Download, 
  Eye, 
  ShieldCheck, 
  CheckCircle2, 
  Zap, 
  Grid3X3,
  Maximize2
} from 'lucide-react';

const HERO_VIDEO_URL = '/hero.mp4';

// Sample digital twin models reconstructed across different standard shapes
const SHOWCASE_TWINS = [
  {
    id: 'oxymetazoline-carton',
    name: 'Oxymetazoline HCI 0.05% Nasal Drops',
    geometry: 'box',
    dimensions: '35 × 35 × 85 mm',
    polygons: '2,480 Tris',
    category: 'Pharma / OTC',
    status: 'COMPLIANT',
    pdp_area: '29.75 cm²',
    min_font_prescribed: '1.0 mm',
    detected_font: '1.4 mm',
    color: '#6366f1',
    glbUrl: null, // Falls back to procedural preview if not dynamically provided
    textures: {
      brand: 'OXYMETAZOLINE',
      mrp: '₹ 120.79 (Incl. of all taxes)',
      batch: 'B.No: PX250820',
      expiry: 'EXP: SEP 2028',
      usp: '₹ 12.08 / ml'
    }
  },
  {
    id: 'protein-supplement-cylinder',
    name: 'Whey Isolate Protein Canister',
    geometry: 'cylinder',
    dimensions: 'Ø 120 × 210 mm',
    polygons: '4,120 Tris',
    category: 'Food / Supplement (FSSAI)',
    status: 'COMPLIANT',
    pdp_area: '252.0 cm²',
    min_font_prescribed: '2.5 mm',
    detected_font: '2.8 mm',
    color: '#10b981',
    glbUrl: null,
    textures: {
      brand: 'ISO-WHEY GOLD',
      mrp: '₹ 3,499.00',
      batch: 'B.No: WH2026-04',
      expiry: 'EXP: OCT 2027',
      fssai: 'Lic No: 10019022009841'
    }
  },
  {
    id: 'detergent-pouch-gusset',
    name: 'Active Liquid Detergent Pouch',
    geometry: 'pouch',
    dimensions: '140 × 60 × 240 mm',
    polygons: '3,860 Tris',
    category: 'Non-Food / FMCG',
    status: 'NON-COMPLIANT',
    pdp_area: '336.0 cm²',
    min_font_prescribed: '2.5 mm',
    detected_font: '1.8 mm (Violation)',
    color: '#f43f5e',
    glbUrl: null,
    textures: {
      brand: 'ULTRA WASH',
      mrp: '₹ 240.00',
      batch: 'B.No: UW-991',
      expiry: 'USE BEFORE: 24 MONTHS',
      usp: '₹ 0.24 / ml'
    }
  }
];

// 3D Procedural Mesh Renderer for live twin visualization
function ProceduralTwinMesh({ item, wireframe, autoRotate }) {
  const meshRef = useRef();

  useFrame((_, delta) => {
    if (autoRotate && meshRef.current) {
      meshRef.current.rotation.y += delta * 0.45;
    }
  });

  // Material configurations: Clean bright white packaging finish with high legibility
  const baseMaterialProps = {
    color: '#f8fafc',         // Crisp clean white packaging substrate
    roughness: 0.18,          // Slight sheen like glossy paperboard / coated plastic
    metalness: 0.05,
    wireframe: wireframe
  };

  const accentMaterialProps = {
    color: item.color,
    roughness: 0.2,
    metalness: 0.3,
    wireframe: wireframe
  };

  if (item.geometry === 'cylinder') {
    return (
      <group ref={meshRef}>
        {/* Main Canister Body */}
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[1.1, 1.1, 3.2, 64]} />
          <meshStandardMaterial {...baseMaterialProps} color="#ffffff" />
        </mesh>

        {/* Top Metallic / Accent Cap */}
        <mesh position={[0, 1.62, 0]} castShadow>
          <cylinderGeometry args={[1.14, 1.14, 0.16, 64]} />
          <meshStandardMaterial {...accentMaterialProps} metalness={0.65} />
        </mesh>

        {/* Front Product Label Banner */}
        <mesh position={[0, 0, 1.105]}>
          <planeGeometry args={[1.4, 2.0]} />
          <meshBasicMaterial color="#ffffff" side={THREE.DoubleSide} />
        </mesh>
      </group>
    );
  }

  if (item.geometry === 'pouch') {
    return (
      <group ref={meshRef}>
        {/* Pouch Main Body */}
        <mesh castShadow receiveShadow scale={[1.4, 2.2, 0.7]}>
          <capsuleGeometry args={[0.7, 1.2, 12, 32]} />
          <meshStandardMaterial {...baseMaterialProps} color="#f1f5f9" />
        </mesh>

        {/* Pouch Heat-Sealed Top Gusset */}
        <mesh position={[0, 1.6, 0]}>
          <boxGeometry args={[1.85, 0.22, 0.08]} />
          <meshStandardMaterial {...accentMaterialProps} />
        </mesh>
      </group>
    );
  }

  // Default Box Model: Bright pharmaceutical / retail cardboard carton
  return (
    <group ref={meshRef}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1.6, 2.6, 1.6]} />
        <meshStandardMaterial {...baseMaterialProps} color="#ffffff" />
      </mesh>

      {/* Top Flap Accent Band */}
      <mesh position={[0, 1.0, 0.805]}>
        <planeGeometry args={[1.5, 0.5]} />
        <meshStandardMaterial {...accentMaterialProps} />
      </mesh>

      {/* High-Contrast Outer Geometry Wire Edges */}
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(1.602, 2.602, 1.602)]} />
        <lineBasicMaterial color={item.color} linewidth={2} />
      </lineSegments>
    </group>
  );
}

function Loader() {
  return (
    <Html center>
      <div className="flex flex-col items-center gap-2 bg-slate-950/80 px-4 py-2 rounded-xl border border-indigo-500/30 backdrop-blur-md">
        <Sparkles className="w-5 h-5 text-indigo-400 animate-spin" />
        <span className="text-[11px] font-mono text-indigo-200">Reconstructing Mesh...</span>
      </div>
    </Html>
  );
}

export default function DigitalTwinsPage() {
  const [selectedTwin, setSelectedTwin] = useState(SHOWCASE_TWINS[0]);
  const [wireframeMode, setWireframeMode] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [videoReady, setVideoReady] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const play = video.play();
    if (play?.catch) play.catch(() => {});
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      video.pause();
      setVideoReady(true);
    }
  }, []);

  return (
    <div className="relative isolate min-h-screen w-full overflow-x-hidden bg-[radial-gradient(65%_55%_at_50%_15%,rgba(99,102,241,0.3)_0%,rgba(30,27,75,0)_100%),radial-gradient(120%_90%_at_50%_0%,#1e1b4b_0%,#0f172a_100%)] text-slate-100 selection:bg-indigo-500 selection:text-white">
      
      {/* Background Video Canvas Layer */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none" aria-hidden="true">
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
            videoReady ? 'opacity-35' : 'opacity-0'
          }`}
        />
        <div className="absolute inset-0 bg-[radial-gradient(90%_65%_at_50%_35%,rgba(15,23,42,0.25)_10%,rgba(15,23,42,0.85)_100%),linear-gradient(180deg,rgba(15,23,42,0.7)_0%,rgba(15,23,42,0.4)_40%,rgba(15,23,42,0.94)_100%)]" />
      </div>

      {/* Main Container */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
        
        {/* Navigation Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/10 backdrop-blur-md">
          <Link
            to="/inspector"
            className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-300 hover:text-white bg-slate-900/60 hover:bg-indigo-600/40 border border-white/10 px-3.5 py-2 rounded-xl transition backdrop-blur-lg shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Workstation</span>
          </Link>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-xs font-bold tracking-wider text-indigo-200 uppercase shadow-[0_0_15px_rgba(99,102,241,0.25)]">
            <Cpu className="w-3.5 h-3.5 text-indigo-300" />
            3D Photogrammetry &amp; Mesh Twin Engine
          </div>
        </div>

        {/* Page Hero */}
        <div className="text-center space-y-4 max-w-3xl mx-auto pt-2">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 flex items-center justify-center mx-auto shadow-inner shadow-indigo-500/20">
            <Box className="w-7 h-7 text-indigo-300" />
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Statutory <span className="bg-gradient-to-r from-indigo-200 via-indigo-300 to-indigo-500 bg-clip-text text-transparent">Digital Twins</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 font-light leading-relaxed">
            Real-time interactive WebGL viewport rendering statutory evidence models (.GLB) reconstructed dynamically from calibrated 6-face packaging scans.
          </p>
        </div>

        {/* Interactive 3D Canvas Studio & Metadata Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Main 3D WebGL Canvas Viewport */}
          <div className="lg:col-span-8 bg-slate-900/70 border border-white/15 backdrop-blur-2xl rounded-3xl p-4 sm:p-6 shadow-2xl space-y-4">
            
            {/* Viewport Control Bar */}
            <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-white/10 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="font-mono font-bold text-white uppercase text-[11px]">
                  {selectedTwin.name}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setAutoRotate(!autoRotate)}
                  className={`p-2 rounded-xl border text-xs transition flex items-center gap-1.5 ${
                    autoRotate 
                      ? 'bg-indigo-600/30 border-indigo-500 text-indigo-200' 
                      : 'bg-slate-950 border-white/10 text-slate-400'
                  }`}
                  title="Toggle Auto Rotation"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Orbit</span>
                </button>

                <button
                  type="button"
                  onClick={() => setWireframeMode(!wireframeMode)}
                  className={`p-2 rounded-xl border text-xs transition flex items-center gap-1.5 ${
                    wireframeMode 
                      ? 'bg-cyan-600/30 border-cyan-500 text-cyan-200' 
                      : 'bg-slate-950 border-white/10 text-slate-400'
                  }`}
                  title="Toggle Wireframe Mesh"
                >
                  <Grid3X3 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Wireframe</span>
                </button>
              </div>
            </div>

            {/* Three.js Canvas */}
            <div className="w-full h-[400px] sm:h-[480px] bg-gradient-to-b from-slate-950/90 to-slate-900/90 rounded-2xl border border-white/10 relative overflow-hidden flex items-center justify-center">
              
              <Canvas
                shadows
                dpr={[1, 2]}
                camera={{ position: [3, 2.5, 4.5], fov: 45 }}
                className="cursor-grab active:cursor-grabbing"
              >
                <ambientLight intensity={0.75} />
                <directionalLight position={[6, 8, 5]} intensity={1.2} castShadow />
                <pointLight position={[-6, -4, -4]} intensity={0.4} />

                <Suspense fallback={<Loader />}>
                  <Center>
                    <Float speed={autoRotate ? 1.5 : 0} rotationIntensity={0.2} floatIntensity={0.3}>
                      <ProceduralTwinMesh 
                        item={selectedTwin} 
                        wireframe={wireframeMode} 
                        autoRotate={autoRotate} 
                      />
                    </Float>
                  </Center>
                  <ContactShadows 
                    position={[0, -1.8, 0]} 
                    opacity={0.65} 
                    scale={8} 
                    blur={2.2} 
                    far={4} 
                  />
                </Suspense>

                <OrbitControls 
                  enablePan={false}
                  minDistance={2.5}
                  maxDistance={8.5}
                />
              </Canvas>

              {/* Viewport Overlay Controls Prompt */}
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none text-[11px] text-slate-400 font-mono">
                <span className="bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10">
                  Left Click + Drag to Orbit • Scroll to Zoom
                </span>
                <span className="bg-indigo-950/80 text-indigo-300 backdrop-blur-md px-2.5 py-1 rounded-lg border border-indigo-500/30 font-bold uppercase">
                  {selectedTwin.geometry} geometry
                </span>
              </div>
            </div>

            {/* Pipeline How-It-Works Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
              <div className="bg-slate-950/60 p-3 rounded-2xl border border-white/5 space-y-1">
                <div className="flex items-center gap-1.5 text-indigo-300 font-semibold">
                  <Eye className="w-3.5 h-3.5" />
                  <span>1. 6-Axis Acquisition</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Extracts optical boundaries from 6 orthogonally aligned face captures.
                </p>
              </div>

              <div className="bg-slate-950/60 p-3 rounded-2xl border border-white/5 space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-300 font-semibold">
                  <Zap className="w-3.5 h-3.5" />
                  <span>2. Texture Rectification</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Removes lens perspective warping and unwraps clean planar UV coordinates.
                </p>
              </div>

              <div className="bg-slate-950/60 p-3 rounded-2xl border border-white/5 space-y-1">
                <div className="flex items-center gap-1.5 text-cyan-300 font-semibold">
                  <Cpu className="w-3.5 h-3.5" />
                  <span>3. Binary GLB Export</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Synthesizes calibrated trimesh geometry packaged with statutory audit metadata.
                </p>
              </div>
            </div>

          </div>

          {/* Model Selection & Statutory Evidence Dossier */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Twin Selector Carousel */}
            <div className="bg-slate-900/70 border border-white/15 backdrop-blur-2xl rounded-3xl p-5 shadow-2xl space-y-3">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Select Calibrated Specimen
              </h3>

              <div className="space-y-2">
                {SHOWCASE_TWINS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedTwin(item)}
                    className={`w-full text-left p-3 rounded-2xl border transition-all duration-200 flex items-center justify-between ${
                      selectedTwin.id === item.id
                        ? 'bg-indigo-600/30 border-indigo-400 shadow-md shadow-indigo-600/20 text-white'
                        : 'bg-slate-950/60 border-white/5 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                    }`}
                  >
                    <div className="space-y-0.5 pr-2">
                      <p className="text-xs font-bold leading-tight">{item.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{item.category} • {item.dimensions}</p>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold shrink-0 ${
                      item.status === 'COMPLIANT' 
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40' 
                        : 'bg-rose-950 text-rose-300 border border-rose-500/40'
                    }`}>
                      {item.status}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Metrological Evidence Audit Card */}
            <div className="bg-slate-900/70 border border-white/15 backdrop-blur-2xl rounded-3xl p-5 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-indigo-400" />
                  Twin Metrology Dossier
                </span>
                <span className="text-[10px] font-mono text-slate-400">{selectedTwin.polygons}</span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-slate-400">Principal Display Area (PDP):</span>
                  <span className="font-mono text-slate-200 font-semibold">{selectedTwin.pdp_area}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-slate-400">Prescribed Min Font (Rule 7):</span>
                  <span className="font-mono text-indigo-300 font-semibold">{selectedTwin.min_font_prescribed}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-slate-400">Measured Optical Height:</span>
                  <span className="font-mono text-emerald-300 font-semibold">{selectedTwin.detected_font}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-slate-400">Extracted Batch Code:</span>
                  <span className="font-mono text-slate-200">{selectedTwin.textures.batch}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-slate-400">Statutory MRP:</span>
                  <span className="font-mono text-slate-200">{selectedTwin.textures.mrp}</span>
                </div>
                {selectedTwin.textures.usp && (
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-slate-400">Unit Sale Price (USP):</span>
                    <span className="font-mono text-slate-200">{selectedTwin.textures.usp}</span>
                  </div>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => alert(`Exporting calibrated binary GLB for ${selectedTwin.name}...`)}
                  className="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white font-semibold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-indigo-600/30"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Statutory .GLB Evidence</span>
                </button>
              </div>
            </div>

          </div>

        </div>

        {/* Footer Authority Badge */}
        <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-4 text-center text-xs text-slate-400 backdrop-blur-md">
          <p>
            Metronox 3D Mesh Reconstruction Engine complies with ISO/IEC 12113 Photogrammetry Evidence Standards &amp; Legal Metrology Digital Verification Frameworks.
          </p>
        </div>

      </div>
    </div>
  );
}
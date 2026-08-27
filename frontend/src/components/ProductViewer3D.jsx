import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useTexture, ContactShadows, Float } from '@react-three/drei';

function GeometryMesh({ textures, geometryType, meshDims }) {
  const meshRef = useRef();

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.35;
    }
  });

  const blank = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

  const front = useTexture(textures?.front?.url || blank);
  const back = useTexture(textures?.back?.url || textures?.front?.url || blank);
  const left = useTexture(textures?.left?.url || textures?.front?.url || blank);
  const right = useTexture(textures?.right?.url || textures?.front?.url || blank);
  const top = useTexture(textures?.top?.url || textures?.front?.url || blank);
  const bottom = useTexture(textures?.bottom?.url || textures?.front?.url || blank);

  if (geometryType === 'cylinder') {
    const h = meshDims?.height || 2.8;
    return (
      <mesh ref={meshRef} position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.95, 0.95, h, 64]} />
        <meshStandardMaterial attach="material-0" map={front} roughness={0.3} metalness={0.15} />
        <meshStandardMaterial attach="material-1" map={top} roughness={0.2} metalness={0.8} />
        <meshStandardMaterial attach="material-2" map={bottom} roughness={0.2} metalness={0.8} />
      </mesh>
    );
  }

  // 6-SIDED BOX: [+X (Right), -X (Left), +Y (Top), -Y (Bottom), +Z (Front), -Z (Back)]
  const w = meshDims?.width || 1.9;
  const h = meshDims?.height || 2.8;
  const d = meshDims?.depth || 1.2;

  return (
    <mesh ref={meshRef} position={[0, 0.1, 0]}>
      <boxGeometry args={[w, h, d]} />
      <meshStandardMaterial attach="material-0" map={right} roughness={0.35} />
      <meshStandardMaterial attach="material-1" map={left} roughness={0.35} />
      <meshStandardMaterial attach="material-2" map={top} roughness={0.35} />
      <meshStandardMaterial attach="material-3" map={bottom} roughness={0.35} />
      <meshStandardMaterial attach="material-4" map={front} roughness={0.35} />
      <meshStandardMaterial attach="material-5" map={back} roughness={0.35} />
    </mesh>
  );
}

export default function ProductViewer3D({ textures, geometryType = 'box', meshDims = null }) {
  return (
    <div className="w-full h-80 bg-gradient-to-b from-slate-100 to-slate-200 rounded-2xl overflow-hidden border border-slate-300 relative shadow-inner">
      <div className="absolute top-3 left-3 z-10 bg-white/90 border border-slate-300 px-2.5 py-1 rounded-md text-[11px] font-mono text-slate-800 shadow-sm backdrop-blur">
        3D Digital Twin: <span className="uppercase font-bold text-indigo-600">{geometryType}</span>
      </div>

      <Canvas camera={{ position: [0, 0, 4.6], fov: 42 }}>
        <ambientLight intensity={1.8} />
        <directionalLight position={[5, 8, 5]} intensity={1.4} />
        <directionalLight position={[-5, -4, -5]} intensity={0.6} />

        <React.Suspense fallback={null}>
          <Float speed={1.5} rotationIntensity={0.15} floatIntensity={0.25}>
            <GeometryMesh textures={textures} geometryType={geometryType} meshDims={meshDims} />
          </Float>
          <ContactShadows position={[0, -1.4, 0]} opacity={0.4} scale={6} blur={2.0} far={4} color="#0f172a" />
        </React.Suspense>

        <OrbitControls enableZoom={true} enablePan={false} minDistance={2.5} maxDistance={7} />
      </Canvas>
    </div>
  );
}
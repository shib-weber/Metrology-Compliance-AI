import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stage } from '@react-three/drei';
import * as THREE from 'three';

function PackagingMesh({ textures, geometryType = 'box' }) {
  const meshRef = useRef();

  // Load and configure texture maps
  const textureLoader = useMemo(() => new THREE.TextureLoader(), []);

  const materials = useMemo(() => {
    const faceKeys = ['right', 'left', 'top', 'bottom', 'front', 'back'];
    
    return faceKeys.map((face) => {
      const src = textures?.[face]?.url || textures?.[face] || '';
      if (!src) {
        return new THREE.MeshStandardMaterial({ color: '#1e293b', roughness: 0.5 });
      }

      const tex = textureLoader.load(src);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.wrapS = THREE.ClampToEdgeWrapping;
      tex.wrapT = THREE.ClampToEdgeWrapping;

      return new THREE.MeshStandardMaterial({
        map: tex,
        roughness: 0.3,
        metalness: 0.05
      });
    });
  }, [textures, textureLoader]);

  // Gentle turntable rotation
  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.35;
    }
  });

  return (
    <mesh ref={meshRef} material={materials} castShadow receiveShadow>
      {geometryType === 'cylinder' ? (
        <cylinderGeometry args={[1, 1, 2.5, 32]} />
      ) : geometryType === 'pouch' ? (
        <boxGeometry args={[1.6, 2.4, 0.4]} />
      ) : (
        <boxGeometry args={[1.5, 2.2, 1.0]} />
      )}
    </mesh>
  );
}

export default function ProductViewer3D({ textures, geometryType = 'box' }) {
  return (
    <div className="w-full h-80 bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl relative">
      <Canvas camera={{ position: [0, 0, 4.5], fov: 45 }}>
        <ambientLight intensity={0.7} />
        <directionalLight position={[5, 10, 5]} intensity={1.2} />
        <pointLight position={[-5, -5, -5]} intensity={0.4} />
        
        <Stage intensity={0.6} environment="city" adjustCamera={false}>
          <PackagingMesh textures={textures} geometryType={geometryType} />
        </Stage>
        
        <OrbitControls enableZoom={true} enablePan={false} autoRotate={false} />
      </Canvas>

      <div className="absolute bottom-2 right-3 text-[10px] font-mono text-slate-500 bg-black/60 px-2 py-0.5 rounded backdrop-blur-sm pointer-events-none">
        Drag to inspect 360°
      </div>
    </div>
  );
}
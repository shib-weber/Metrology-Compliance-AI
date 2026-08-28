import React, { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stage, useGLTF, Center } from '@react-three/drei';
import * as THREE from 'three';

function GLBDigitalTwin({ glbUrl }) {
  const { scene } = useGLTF(glbUrl);
  const meshRef = useRef();

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.35;
    }
  });

  return <primitive ref={meshRef} object={scene} />;
}

function StandardParametricMesh({ textures, geometryType = 'box' }) {
  const meshRef = useRef();
  const textureLoader = useMemo(() => new THREE.TextureLoader(), []);

  const materials = useMemo(() => {
    const faceKeys = ['right', 'left', 'top', 'bottom', 'front', 'back'];
    return faceKeys.map((face) => {
      const src = textures?.[face]?.url || textures?.[face] || '';
      if (!src) {
        return new THREE.MeshStandardMaterial({ color: '#0f172a', roughness: 0.6 });
      }
      const tex = textureLoader.load(src);
      tex.colorSpace = THREE.SRGBColorSpace;
      return new THREE.MeshStandardMaterial({ map: tex, roughness: 0.3, metalness: 0.05 });
    });
  }, [textures, textureLoader]);

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

export default function ProductViewer3D({ textures, geometryType = 'box', glbUrl = null }) {
  return (
    <div className="w-full h-80 bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl relative">
      <Canvas camera={{ position: [0, 0, 4.5], fov: 45 }}>
        <ambientLight intensity={0.7} />
        <directionalLight position={[5, 10, 5]} intensity={1.2} />
        
        <Suspense fallback={null}>
          <Stage intensity={0.6} environment="city" adjustCamera={false}>
            {glbUrl ? (
              <Center>
                <GLBDigitalTwin glbUrl={glbUrl} />
              </Center>
            ) : (
              <StandardParametricMesh textures={textures} geometryType={geometryType} />
            )}
          </Stage>
        </Suspense>
        
        <OrbitControls enableZoom={true} enablePan={false} autoRotate={false} />
      </Canvas>

      <div className="absolute bottom-2 right-3 text-[10px] font-mono text-slate-500 bg-black/60 px-2 py-0.5 rounded backdrop-blur-sm pointer-events-none">
        Drag to inspect 360°
      </div>
    </div>
  );
}
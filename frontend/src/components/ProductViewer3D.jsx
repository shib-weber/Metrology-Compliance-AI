import React, { useState, useEffect, Suspense, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage, Center } from '@react-three/drei';
import * as THREE from 'three';

function BoxMesh({ textures }) {
  const [loadedTextures, setLoadedTextures] = useState({});

  useEffect(() => {
    if (!textures) return;
    let isMounted = true;
    const loader = new THREE.TextureLoader();

    const order = ['right', 'left', 'top', 'bottom', 'front', 'back'];

    order.forEach((key) => {
      const src =
        textures[key] ||
        textures[key.toLowerCase()] ||
        textures[key.toUpperCase()] ||
        (typeof textures[key] === 'object' ? textures[key]?.url : null);

      if (src && typeof src === 'string' && src.length > 50) {
        loader.load(
          src,
          (tex) => {
            if (!isMounted) return;
            tex.colorSpace = THREE.SRGBColorSpace;
            tex.wrapS = THREE.ClampToEdgeWrapping;
            tex.wrapT = THREE.ClampToEdgeWrapping;
            tex.generateMipmaps = true;
            tex.minFilter = THREE.LinearMipmapLinearFilter;
            tex.magFilter = THREE.LinearFilter;
            tex.needsUpdate = true;

            setLoadedTextures((prev) => ({
              ...prev,
              [key]: tex
            }));
          },
          undefined,
          (err) => {
            console.warn(`Failed to load texture for panel: ${key}`, err);
          }
        );
      }
    });

    return () => {
      isMounted = false;
    };
  }, [textures]);

  const materials = useMemo(() => {
    const order = ['right', 'left', 'top', 'bottom', 'front', 'back'];
    return order.map((key) => {
      const tex = loadedTextures[key];
      if (tex) {
        return new THREE.MeshStandardMaterial({
          map: tex,
          roughness: 0.35,
          metalness: 0.1,
          side: THREE.FrontSide
        });
      }
      return new THREE.MeshStandardMaterial({
        color: '#1e293b',
        roughness: 0.85,
        metalness: 0.05
      });
    });
  }, [loadedTextures]);

  return (
    <mesh castShadow receiveShadow material={materials}>
      <boxGeometry args={[2.2, 3.2, 1.4]} />
    </mesh>
  );
}

export default function ProductViewer3D({ textures, geometryType = 'box' }) {
  // Normalize incoming texture dictionaries
  const normalizedTextures = useMemo(() => {
    if (!textures || typeof textures !== 'object') return {};
    const out = {};
    Object.entries(textures).forEach(([k, v]) => {
      const val = typeof v === 'object' && v?.url ? v.url : v;
      if (val) {
        out[k.toLowerCase()] = val;
      }
    });
    return out;
  }, [textures]);

  return (
    <div className="w-full h-64 sm:h-72 rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 relative shadow-inner">
      <Canvas
        shadows
        camera={{ position: [0, 0, 5], fov: 45 }}
        gl={{ preserveDrawingBuffer: true, antialias: true, powerPreference: 'default' }}
      >
        <Suspense fallback={null}>
          <Stage environment="city" intensity={0.65} adjustCamera={false}>
            <Center>
              <BoxMesh textures={normalizedTextures} />
            </Center>
          </Stage>
          <OrbitControls
            autoRotate
            autoRotateSpeed={1.5}
            enablePan={false}
            maxDistance={8}
            minDistance={2.5}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
'use client';
import { Environment, ContactShadows, Sky, Clouds, Cloud } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import { useAppStore, SPATIAL_STATES } from '../store/useAppStore';

export default function Stage() {
  const { state } = useAppStore();
  const cloudRef = useRef();
  const sunPos = [0, 8, -120];

  const isGallery = state !== SPATIAL_STATES.EVENT_ROOM;

  useFrame((state) => {
    if (cloudRef.current && isGallery) {
      const t = state.clock.elapsedTime * 3.5;
      const range = 600;
      const offset = 300;
      cloudRef.current.position.x = ((t + offset) % range) - offset;
    }
  });

  return (
    <>
      {/* 1. GALLERY-ONLY ATMOSPHERE */}
      {isGallery && (
        <>
          <Sky 
            distance={450000} 
            sunPosition={sunPos} 
            inclination={0} 
            azimuth={0.25} 
            mieCoefficient={0.005}
            mieDirectionalG={0.8}
            rayleigh={3}
          />

          <group position={sunPos}>
            <mesh>
              <sphereGeometry args={[4, 32, 32]} />
              <meshBasicMaterial color="#ff9d6c" toneMapped={false} />
            </mesh>
            <mesh scale={1.5}>
              <sphereGeometry args={[4.5, 32, 32]} />
              <meshBasicMaterial 
                color="#ff7e33" 
                transparent 
                opacity={0.3} 
                blending={THREE.AdditiveBlending} 
              />
            </mesh>
            <pointLight intensity={10} distance={300} color="#ff7e33" />
          </group>

          <group ref={cloudRef}>
            <Clouds material={THREE.MeshBasicMaterial}>
              <Cloud seed={42} segments={35} bounds={[200, 15, 80]} volume={25} color="#ffccaa" opacity={0.4} speed={0} fade={15} position={[-150, 25, -100]} />
              <Cloud seed={84} segments={35} bounds={[200, 15, 80]} volume={20} color="#ffb380" opacity={0.4} speed={0} fade={15} position={[150, 20, -130]} />
              <Cloud seed={126} segments={40} bounds={[300, 20, 100]} volume={15} color="#f472b6" opacity={0.3} speed={0} fade={20} position={[0, 22, -180]} />
            </Clouds>
          </group>

          <directionalLight
            position={sunPos}
            intensity={3}
            color="#ff7e33"
            castShadow
            shadow-mapSize={[512, 512]} 
          />
          
          <Environment preset="sunset" />
          <fog attach="fog" args={['#ff9d6c', 20, 150]} />
        </>
      )}

      {/* 2. GLOBAL AMBIENCE (Low intensity to prevent pitch black) */}
      <ambientLight intensity={0.2} color={isGallery ? "#ffd1b3" : "#ffffff"} />

      {/* 3. FLOOR SHADOWS (Adaptive color) */}
      <ContactShadows 
        position={[0, 0.01, 0]} 
        opacity={isGallery ? 0.4 : 0.6} 
        scale={60} 
        blur={2} 
        far={10} 
        color={isGallery ? "#2e1a0c" : "#000000"} 
      />
    </>
  );
}
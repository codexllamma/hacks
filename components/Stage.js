'use client';
import { Environment, ContactShadows, Sky, Clouds, Cloud } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import { useAppStore, SPATIAL_STATES } from '../store/useAppStore';

export default function Stage() {
  const { state } = useAppStore();
  const cloudRef = useRef();
  
  // Sun Position: High and visible through the glass
  const sunPos = [0, 60, -50];

  const isGallery = state !== SPATIAL_STATES.EVENT_ROOM;

  useFrame((state) => {
    if (cloudRef.current && isGallery) {
      const t = state.clock.elapsedTime * 2.5; 
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
            inclination={0.6} 
            azimuth={0.25} 
            mieCoefficient={0.008} 
            mieDirectionalG={0.8}
            rayleigh={5} 
          />

          {/* THE SUN ORB */}
          <group position={sunPos}>
            <mesh>
              <sphereGeometry args={[8, 32, 32]} />
              <meshBasicMaterial color="#ff9d6c" toneMapped={false} />
            </mesh>
            <mesh scale={1.8}>
              <sphereGeometry args={[8, 32, 32]} />
              <meshBasicMaterial 
                color="#ff7e33" 
                transparent 
                opacity={0.4} 
                blending={THREE.AdditiveBlending} 
                side={THREE.BackSide}
              />
            </mesh>
            <pointLight intensity={5} distance={500} color="#ff7e33" />
          </group>

          {/* CLOUDS */}
          <group ref={cloudRef}>
            <Clouds material={THREE.MeshBasicMaterial}>
              <Cloud seed={42} segments={35} bounds={[200, 20, 80]} volume={30} color="#ffccaa" opacity={0.3} speed={0} fade={20} position={[-100, 70, -60]} />
              <Cloud seed={84} segments={35} bounds={[200, 20, 80]} volume={25} color="#ffb380" opacity={0.3} speed={0} fade={20} position={[100, 65, -90]} />
            </Clouds>
          </group>

          <directionalLight
            position={sunPos}
            intensity={2.5}
            color="#ffaa77"
            castShadow
            shadow-bias={-0.0005}
            shadow-mapSize={[1024, 1024]} 
          />
          
          <Environment preset="sunset" />
          
          {/* FIX: Warm Mist to fade distant objects beautifully */}
          <fog attach="fog" args={['#ffbd99', 10, 150]} /> 
        </>
      )}

      {/* 2. GLOBAL AMBIENCE */}
      <ambientLight intensity={0.5} color={isGallery ? "#ffd1b3" : "#ffffff"} />

      {/* 3. FLOOR SHADOWS */}
      <ContactShadows 
        position={[0, 0.01, 0]} 
        opacity={isGallery ? 0.5 : 0.6} 
        scale={60} 
        blur={2} 
        far={10} 
        color={isGallery ? "#4a2c1f" : "#000000"} 
      />
    </>
  );
}
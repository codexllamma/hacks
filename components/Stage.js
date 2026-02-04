'use client';
import { Environment, ContactShadows } from '@react-three/drei';

export default function Stage() {
  return (
    <>
      <color attach="background" args={['#d6d3ce']} /> 
      <fog attach="fog" args={['#d6d3ce', 10, 50]} />

      {/* 1. SKYLIGHT SOURCE (Soft cool overhead) */}
      <rectAreaLight
        width={10}
        height={100}
        intensity={2}
        position={[0, 9.5, -50]}
        rotation={[-Math.PI / 2, 0, 0]}
        color="#ffffff"
      />

      {/* 2. WARM INTERIOR AMBIENCE */}
      <ambientLight intensity={0.4} color="#fff1e6" />

      {/* 3. SPOTLIGHTS ON PAINTINGS (Dramatic flair) */}
      <directionalLight
        position={[-5, 8, -5]}
        intensity={0.5}
        castShadow
        shadow-bias={-0.001}
      />

      {/* 4. FLOOR REFLECTIONS */}
      <ContactShadows 
        position={[0, 0.01, 0]} 
        opacity={0.4} 
        scale={40} 
        blur={2} 
        far={4} 
        color="#1a1a1a"
      />

      {/* 5. REFLECTIONS */}
      <Environment preset="city" />
    </>
  );
}
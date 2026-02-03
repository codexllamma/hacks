'use client';

import { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';

export default function Experience() {
  const meshRef = useRef();
  const [hovered, setHover] = useState(false);

  // 1. Create the audio object once. 
  // Make sure 'hover.mp3' exists in your /public folder!
  const hoverSound = useMemo(() => {
    // Check if window is defined (to avoid server-side errors)
    if (typeof window !== 'undefined') {
      return new Audio('/hover.mp3'); 
    }
    return null;
  }, []);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.5;
      meshRef.current.rotation.y += delta * 0.5;
    }
  });

  return (
    <mesh
      ref={meshRef}
      onPointerOver={() => {
        setHover(true);
        // 2. Play sound on hover
        if (hoverSound) {
          hoverSound.currentTime = 0; // Reset sound to start so it can be spammed
          hoverSound.play().catch((e) => console.log("Interaction required first:", e));
        }
      }}
      onPointerOut={() => setHover(false)}
      scale={hovered ? 1.1 : 1}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={hovered ? "hotpink" : "orange"} />
    </mesh>
  );
}
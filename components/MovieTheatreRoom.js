'use client'
import { Environment, ContactShadows, Text } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useRef } from 'react'
import UserGroup from './UserGroup'

function MovieScreen({ progress, goal }) {
  const height = 5.5;
  const width = 10;
  
  return (
    <group position={[0, 3.5, -9.8]}>
      {/* Black Frame */}
      <mesh position={[0, 0, -0.1]}>
        <boxGeometry args={[width + 0.8, height + 0.8, 0.2]} />
        <meshStandardMaterial color="#111" />
      </mesh>
      
      {/* Screen Canvas */}
      <mesh>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>

      {/* Filling Logic: Scaled and Positioned to grow from the bottom edge */}
      <mesh 
        position={[0, -(height / 2) + (height * progress / 2), 0.01]} 
        scale={[1, progress, 1]}
      >
         <planeGeometry args={[width, height]} />
         <meshBasicMaterial color="#22c55e" transparent opacity={0.7} />
      </mesh>
      
      {/* Budget Goal Label */}
      <Text position={[0, height / 2 + 0.4, 0.01]} fontSize={0.5} color="black" font="/fonts/Geist-VariableFont_wght.ttf">
        TOTAL GOAL: ${goal}
      </Text>
      {/* If the font still fails, remove the font prop: <Text position={[0, height / 2 + 0.4, 0.01]} fontSize={0.5} color="black">TOTAL GOAL: ${goal}</Text> */}
    </group>
  )
}

export default function MovieTheatreRoom({ event }) {
  if (!event) return null;
  const percentage = Math.min(1, Math.max(0, event.totalPool / (event.budgetGoal || 1)));

  const projectorRef = useRef();
  const beamRef = useRef();

  // Animate flicker for realism
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const flicker = Math.sin(t * 5) * 0.1; // Subtle variation

    if (projectorRef.current) {
      projectorRef.current.intensity = 2.5 + flicker;
    }

    if (beamRef.current) {
      beamRef.current.material.opacity = 0.05 + Math.abs(flicker) * 0.02; // Slight opacity flicker for rays
    }
  });

  return (
    <group>
      <Environment preset="night" />
      <ambientLight intensity={0.4} />
      <spotLight 
        ref={projectorRef} 
        position={[0, 8, 4]} 
        intensity={2.5} 
        angle={0.6} 
        penumbra={1} 
        castShadow 
        color="#fff0e0" 
      />

      {/* Projector Beam Visualization (cone for rays) */}
      <mesh 
        ref={beamRef} 
        position={[0, 8, 4]} 
        rotation={[0.31, 0, 0]} // Tilt to point at screen
      >
        <coneGeometry args={[4.5, 14.5, 32]} />
        <meshBasicMaterial 
          color="#fff0e0" 
          transparent 
          opacity={0.05} 
          blending={THREE.AdditiveBlending} 
          depthWrite={false} 
        />
      </mesh>

      {/* ROOM SHELL */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 25]} />
        <meshStandardMaterial color="#1a0505" /> {/* Dark red carpet */}
      </mesh>
      <mesh position={[0, 5, -10]}><planeGeometry args={[20, 10]} /><meshStandardMaterial color="#050505" /></mesh>

      <MovieScreen progress={percentage} goal={event.budgetGoal} />

      {/* Single Row of 5 Seats */}
      <group position={[0, 0, -4]}> 
        <UserGroup variant="theatre" />
      </group>

      <ContactShadows position={[0, 0.01, 0]} opacity={0.4} scale={15} blur={2.5} />
    </group>
  )
}
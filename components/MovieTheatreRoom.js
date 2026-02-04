'use client'
import { Environment, ContactShadows, Text, Float, Sparkles } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useRef, useState, useMemo } from 'react'
import UserGroup from './UserGroup'

// --- THEATRE STAGE ---
function TheatreStage() {
  return (
    <group position={[0, 0, -9]}>
      <mesh position={[0, 0.4, 0]} receiveShadow>
        <boxGeometry args={[16, 0.8, 4]} />
        <meshStandardMaterial color="#1a0a05" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.4, 2.01]}>
        <boxGeometry args={[16.2, 0.85, 0.1]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
    </group>
  )
}

// --- RED CURTAINS ---
function RedCurtains() {
  return (
    <group position={[0, 3.5, -9.6]}>
      <mesh position={[0, 3.8, 0]}>
        <boxGeometry args={[14, 1.2, 0.3]} />
        <meshStandardMaterial color="#800000" roughness={0.9} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[-6.5, 0, 0]}>
        <boxGeometry args={[1.5, 7.5, 0.4]} />
        <meshStandardMaterial color="#800000" roughness={0.9} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[6.5, 0, 0]}>
        <boxGeometry args={[1.5, 7.5, 0.4]} />
        <meshStandardMaterial color="#800000" roughness={0.9} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

// --- CINEMATIC CELEBRATION ---
function CinematicCelebration() {
  const groupRef = useRef();
  const particleCount = 100;
  
  const particles = useMemo(() => {
    return Array.from({ length: particleCount }).map(() => ({
      position: [0, 4.5, -9.5],
      velocity: [(Math.random() - 0.5) * 10, Math.random() * 10, (Math.random() - 0.5) * 5],
      color: new THREE.Color().setHSL(Math.random(), 1, 0.5)
    }));
  }, []);

  const [activeParticles, setActiveParticles] = useState(particles);

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 20) * 0.1;
    }
    
    setActiveParticles(prev => prev.map(p => ({
      ...p,
      position: [
        p.position[0] + p.velocity[0] * delta,
        p.position[1] + p.velocity[1] * delta - 4.9 * delta * delta,
        p.position[2] + p.velocity[2] * delta
      ],
      velocity: [p.velocity[0], p.velocity[1] - 9.8 * delta, p.velocity[2]]
    })));
  });

  return (
    <group ref={groupRef}>
      <pointLight intensity={5} distance={20} color="#ffffff" />
      {activeParticles.map((p, i) => (
        <mesh key={i} position={p.position}>
          <boxGeometry args={[0.1, 0.1, 0.1]} />
          <meshBasicMaterial color={p.color} />
        </mesh>
      ))}
      <Sparkles count={200} scale={[15, 8, 5]} size={4} speed={2} color="#ffd700" />
    </group>
  );
}

function MovieScreen({ progress, goal, raised }) {
  const height = 5.5;
  const width = 10;
  const fillRef = useRef();
  const textGroupRef = useRef();
  const [displayProgress, setDisplayProgress] = useState(0);
  const percentage = Math.floor((raised / goal) * 100);

  useFrame((state, delta) => {
    const targetProgress = progress;
    const newProgress = THREE.MathUtils.lerp(displayProgress, targetProgress, 0.05);
    setDisplayProgress(newProgress);

    if (fillRef.current) {
      const ripple = Math.sin(state.clock.elapsedTime * 3) * 0.02;
      fillRef.current.position.y = -(height / 2) + (height * newProgress / 2) + ripple;
    }

    if (percentage >= 100 && textGroupRef.current) {
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 10) * 0.1;
      textGroupRef.current.scale.set(pulse, pulse, pulse);
    }
  });
  
  return (
    <group position={[0, 4.5, -9.8]}>
      {/* 1. Black Frame - Layered at Z=-0.02 */}
      <mesh position={[0, 0, -0.02]}>
        <planeGeometry args={[width + 0.6, height + 0.6]} />
        <meshBasicMaterial color="#000000" />
      </mesh>
      
      {/* 2. White Canvas - Layered at Z=0 */}
      <mesh receiveShadow={false}>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>

      {/* 3. Gold Liquid Fill - Layered at Z=0.01 */}
      <mesh 
        ref={fillRef} 
        position={[0, -(height / 2), 0.01]} 
        scale={[1, displayProgress, 1]} 
        receiveShadow={false}
      >
         <planeGeometry args={[width, height]} />
         <meshBasicMaterial color="#ffd700" transparent opacity={0.9} />
      </mesh>
      
      {/* 4. Text - Layered at Z=0.02 */}
      <group ref={textGroupRef} position={[0, 0, 0.02]}>
        <Text position={[0, 0.8, 0]} fontSize={0.6} font="/fonts/Geist-VariableFont_wght.ttf">
          GOAL: ${goal}
          <meshStandardMaterial emissive="#00ffcc" emissiveIntensity={percentage >= 100 ? 10 : 4} toneMapped={false} color="#00ffcc" />
        </Text>
        <Text position={[0, 0, 0]} fontSize={0.5} font="/fonts/Geist-VariableFont_wght.ttf">
          RAISED: ${raised}
          <meshStandardMaterial emissive="#ff0099" emissiveIntensity={percentage >= 100 ? 10 : 4} toneMapped={false} color="#ff0099" />
        </Text>
        <Text position={[0, -0.8, 0]} fontSize={0.4} font="/fonts/Geist-VariableFont_wght.ttf">
          {percentage}% COMPLETED
          <meshStandardMaterial emissive={percentage >= 100 ? "#00ff00" : "#ffffff"} emissiveIntensity={percentage >= 100 ? 15 : 4} toneMapped={false} />
        </Text>
      </group>

      {percentage >= 100 && <CinematicCelebration />}
    </group>
  )
}

export default function MovieTheatreRoom({ event }) {
  if (!event) return null;
  const percentage = Math.min(1, Math.max(0, event.totalPool / (event.budgetGoal || 1)));
  const projectorLight = useRef();

  useFrame((state) => {
    if (projectorLight.current) {
      projectorLight.current.intensity = 2.5 + Math.sin(state.clock.elapsedTime * 10) * 0.3;
    }
  });

  return (
    <group>
      <Environment preset="night" />
      <ambientLight intensity={0.1} />
      <spotLight ref={projectorLight} position={[0, 10, 5]} angle={0.6} penumbra={1} intensity={2.5} color="#fff0e0" castShadow />
      
      <TheatreStage />
      <RedCurtains />
      <MovieScreen progress={percentage} goal={event.budgetGoal} raised={event.totalPool} />
      <ProjectorBeam />

      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#0a0505" />
      </mesh>
      <mesh position={[0, 5, -10]}><planeGeometry args={[40, 20]} /><meshStandardMaterial color="#020202" /></mesh>

      <group position={[0, 0, -2]}> 
        <UserGroup variant="theatre" />
      </group>

      <ContactShadows position={[0, 0.01, 0]} opacity={0.6} scale={25} blur={3} far={2} color="#000000" />
    </group>
  )
}

function ProjectorBeam() {
  const beamRef = useRef();
  useFrame((state) => {
    if (beamRef.current) {
      beamRef.current.material.opacity = 0.02 + Math.random() * 0.03;
    }
  });

  return (
    <group position={[0, 10, 5]}>
      {/* SHIFTED: Increased Z offset to -8.5 to ensure cone starts well after camera at Z=5 */}
      <mesh rotation={[Math.PI / 2.1, 0, 0]} position={[0, -5, -8.5]}>
        <coneGeometry args={[7, 13, 32, 1, true]} />
        <meshBasicMaterial color="#fff0e0" transparent opacity={0.04} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}
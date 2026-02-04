'use client';
import { useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { useAppStore } from '../store/useAppStore';
import * as THREE from 'three';

function HumanoidCharacter({ color, isPaid, isHovered }) {
  const bodyRef = useRef()
  const leftArmRef = useRef()
  const rightArmRef = useRef()

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (bodyRef.current && leftArmRef.current && rightArmRef.current) {
      if (isPaid) {
        bodyRef.current.position.y = 0.85 + Math.abs(Math.sin(t * 10)) * 0.3
        leftArmRef.current.rotation.z = Math.PI - 0.5 + Math.sin(t * 15) * 0.5
        rightArmRef.current.rotation.z = -Math.PI + 0.5 - Math.sin(t * 15) * 0.5
      } else if (isHovered) {
        rightArmRef.current.rotation.z = Math.PI - 0.2 + Math.sin(t * 15) * 0.5
        bodyRef.current.rotation.z = Math.sin(t * 10) * 0.05
      } else {
        bodyRef.current.position.y = 0.85
        bodyRef.current.rotation.z = 0
        leftArmRef.current.rotation.z = 0
        rightArmRef.current.rotation.z = 0
      }
    }
  })

  return (
    <group>
      <group ref={bodyRef} position={[0, 0.85, 0]}>
        <mesh position={[0, 0.6, 0]} castShadow><boxGeometry args={[0.3, 0.35, 0.3]} /><meshStandardMaterial color="#ffdbac" roughness={0.5} /></mesh>
        <mesh position={[0, 0, 0]} castShadow><boxGeometry args={[0.4, 0.75, 0.25]} /><meshStandardMaterial color={color} emissive={isPaid ? color : "#000000"} emissiveIntensity={isPaid ? 0.6 : 0} roughness={0.7} /></mesh>
        <group ref={leftArmRef} position={[-0.28, 0.3, 0]}><mesh position={[0, -0.3, 0]} castShadow><boxGeometry args={[0.12, 0.65, 0.12]} /><meshStandardMaterial color={color} roughness={0.7} /></mesh></group>
        <group ref={rightArmRef} position={[0.28, 0.3, 0]}><mesh position={[0, -0.3, 0]} castShadow><boxGeometry args={[0.12, 0.65, 0.12]} /><meshStandardMaterial color={color} roughness={0.7} /></mesh></group>
      </group>
      <mesh position={[-0.11, 0.25, 0]} castShadow><boxGeometry args={[0.14, 0.55, 0.14]} /><meshStandardMaterial color="#1f2937" roughness={0.9} /></mesh>
      <mesh position={[0.11, 0.25, 0]} castShadow><boxGeometry args={[0.14, 0.55, 0.14]} /><meshStandardMaterial color="#1f2937" roughness={0.9} /></mesh>
    </group>
  )
}

function TheatreSeat() {
  const velvetMat = new THREE.MeshStandardMaterial({ color: '#800000', roughness: 0.9 })
  const blackMat = new THREE.MeshStandardMaterial({ color: '#111111', roughness: 0.5 })
  
  return (
    <group scale={0.5}> {/* Made seats significantly smaller */}
      <mesh position={[0, 0.1, 0]}><cylinderGeometry args={[0.08, 0.1, 0.2]} /><primitive object={blackMat} /></mesh>
      <mesh position={[0, 0.3, 0]}><boxGeometry args={[0.5, 0.12, 0.5]} /><primitive object={velvetMat} /></mesh>
      <mesh position={[0, 0.7, 0.2]} rotation={[-0.1, 0, 0]}><boxGeometry args={[0.5, 0.7, 0.1]} /><primitive object={velvetMat} /></mesh>
      <mesh position={[-0.3, 0.45, 0]}><boxGeometry args={[0.08, 0.04, 0.4]} /><primitive object={blackMat} /></mesh>
      <mesh position={[0.3, 0.45, 0]}><boxGeometry args={[0.08, 0.04, 0.4]} /><primitive object={blackMat} /></mesh>
    </group>
  )
}

function UserAvatar({ user, position, rotation, onClick, showSeat }) {
  const groupRef = useRef();
  const [hovered, setHover] = useState(false);
  const hasPaid = user.deposit > 0;
  const shirtColor = hasPaid ? "#10b981" : (hovered ? "#3b82f6" : "#6b7280");

  const handleClick = (e) => {
    if (e) e.stopPropagation();
    onClick(user.id);
  };

  return (
    <group 
      ref={groupRef}
      position={position} 
      rotation={rotation} 
      onClick={handleClick}
      onPointerOver={() => setHover(true)}
      onPointerOut={() => setHover(false)}
    >
      {showSeat && <TheatreSeat />}
      {/* User scaled down to fit small seats */}
      <group position={[0, showSeat ? 0.15 : 0, 0]} scale={showSeat ? 0.45 : 1}>
        <HumanoidCharacter color={shirtColor} isPaid={hasPaid} isHovered={hovered} />
      </group>

      <Html position={[0, 1.5, 0]} center distanceFactor={8} style={{ pointerEvents: 'auto' }}>
        <div 
          onClick={handleClick} 
          className={`cursor-pointer flex flex-col items-center transition-all duration-300 ${hovered ? 'scale-110' : 'scale-100'}`}
        >
          <div className={`px-2 py-1 rounded-md text-[8px] font-bold shadow-sm whitespace-nowrap border ${
            hasPaid ? 'bg-green-100 text-green-800 border-green-300' : 'bg-white text-gray-800 border-gray-300'
          }`}>
            {user.name}
          </div>
        </div>
      </Html>
    </group>
  );
}

export default function UserGroup({ variant = 'circle' }) {
  const { events, activeEventIndex, setPaymentTarget } = useAppStore();
  const activeEvent = events[activeEventIndex];
  const participants = activeEvent?.participants || [];
  
  const layout = useMemo(() => {
    if (participants.length === 0) return [];
    if (variant === 'theatre') {
      const cols = 5; // Exactly 5 seats per row
      const spacingX = 0.8; // Tight spacing for small seats
      const spacingZ = 1.5;
      return participants.map((user, i) => {
        const row = Math.floor(i / cols);
        const col = i % cols;
        const x = (col - (cols - 1) / 2) * spacingX;
        const z = row * spacingZ; 
        const y = row * 0.2; 
        return { ...user, x, y, z, rotation: [0, 0, 0] };
      });
    }
    const radius = 3.5;
    return participants.map((user, i) => {
      const angle = (i / participants.length) * Math.PI * 2;
      return { ...user, x: Math.cos(angle) * radius, y: 0, z: Math.sin(angle) * radius, rotation: [0, -angle + Math.PI / 2, 0] };
    });
  }, [participants, variant]);

  return (
    <group>
      {layout.map((user) => (
        <UserAvatar key={user.id} user={user} position={[user.x, user.y, user.z]} rotation={user.rotation} onClick={setPaymentTarget} showSeat={variant === 'theatre'} />
      ))}
    </group>
  );
}
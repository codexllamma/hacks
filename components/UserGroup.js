'use client';
import { useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { useAppStore } from '../store/useAppStore';

// --- HUMANOID MODEL ---
function HumanoidCharacter({ color, isPaid, isHovered }) {
  const bodyRef = useRef()
  const leftArmRef = useRef()
  const rightArmRef = useRef()

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (bodyRef.current && leftArmRef.current && rightArmRef.current) {
      if (isPaid) {
        // JUMP animation
        bodyRef.current.position.y = 0.85 + Math.abs(Math.sin(t * 10)) * 0.3
        leftArmRef.current.rotation.z = Math.PI - 0.5 + Math.sin(t * 15) * 0.5
        rightArmRef.current.rotation.z = -Math.PI + 0.5 - Math.sin(t * 15) * 0.5
      } else if (isHovered) {
        // WAVE animation
        rightArmRef.current.rotation.z = Math.PI - 0.2 + Math.sin(t * 15) * 0.5
        bodyRef.current.rotation.z = Math.sin(t * 10) * 0.05
      } else {
        // IDLE
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

function UserAvatar({ user, position, rotation, onClick }) {
  const groupRef = useRef();
  const [hovered, setHover] = useState(false);

  useFrame((state) => {
    if (groupRef.current) {
      const t = state.clock.elapsedTime + position[0];
      if (!hovered && user.deposit === 0) {
        groupRef.current.position.y = position[1] + Math.sin(t * 2) * 0.03;
      } else {
        groupRef.current.position.y = position[1];
      }
    }
  });

  const hasPaid = user.deposit > 0;
  const shirtColor = hasPaid ? "#10b981" : (hovered ? "#3b82f6" : "#6b7280");

  const handleClick = (e) => {
    if (e) e.stopPropagation();
    // FIX: Pass user.id, NOT the whole user object
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
      <HumanoidCharacter color={shirtColor} isPaid={hasPaid} isHovered={hovered} />

      <Html position={[0, 1.8, 0]} center distanceFactor={8} style={{ pointerEvents: 'auto' }}>
        <div 
          onClick={handleClick} 
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          className={`cursor-pointer flex flex-col items-center transition-all duration-300 ${hovered ? 'scale-110' : 'scale-100'}`}
        >
          <div className={`px-2 py-1 rounded-md text-[10px] font-bold shadow-sm whitespace-nowrap border ${
            hasPaid 
              ? 'bg-green-100 text-green-800 border-green-300' 
              : 'bg-white text-gray-800 border-gray-300'
          }`}>
            {user.name}
          </div>
          {hovered && !hasPaid && (
            <div className="mt-1 text-[8px] font-bold text-yellow-300 bg-black/80 px-2 py-0.5 rounded animate-pulse border border-yellow-500">
              CLICK TO PAY
            </div>
          )}
        </div>
      </Html>
    </group>
  );
}

export default function UserGroup() {
  const { events, activeEventIndex, setPaymentTarget } = useAppStore();
  const activeEvent = events[activeEventIndex];
  const participants = activeEvent?.participants || [];
  
  const layout = useMemo(() => {
    if (participants.length === 0) return [];
    const radius = 3.5;
    return participants.map((user, i) => {
      const angle = (i / participants.length) * Math.PI * 2;
      return {
        ...user,
        x: Math.cos(angle) * radius,
        z: Math.sin(angle) * radius,
        rotation: [0, -angle + Math.PI / 2, 0] 
      };
    });
  }, [participants]);

  return (
    <group position={[0, 0, 0]}>
      {layout.map((user) => (
        <UserAvatar 
          key={user.id} 
          user={user}
          position={[user.x, 0, user.z]} 
          rotation={user.rotation} 
          onClick={setPaymentTarget}
        />
      ))}
    </group>
  );
}
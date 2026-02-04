'use client'
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { MeshTransmissionMaterial, Text, Float } from '@react-three/drei'
import { useSpring, animated } from '@react-spring/three' // <--- SWITCHED LIBRARY
import { useAppStore } from '../store/useAppStore'

export default function BucketPool() {
  const { totalPool, budgetGoal } = useAppStore()
  
  // Calculate percentage (0 to 1)
  const progress = budgetGoal > 0 ? Math.min(totalPool / budgetGoal, 1) : 0
  
  // Dynamic Color based on progress
  const liquidColor = progress >= 1 ? "#00ff88" : "#29b6f6"

  // Animation values
  const { scaleY, y } = useSpring({
    scaleY: Math.max(0.05, progress),
    y: (3 * Math.max(0.05, progress)) / 2 - 1.5, // Keeps bottom anchored
    config: { tension: 80, friction: 20 }
  })

  return (
    <group position={[0, -1.5, 0]}>
      {/* 1. Glass Container */}
      <mesh position={[0, 1, 0]}>
        <cylinderGeometry args={[2.1, 2, 3.2, 32]} />
        <MeshTransmissionMaterial 
          thickness={0.2} roughness={0} transmission={1} ior={1.5} chromaticAberration={0.1} backside 
        />
      </mesh>

      {/* 2. Liquid Fill (Animated) */}
      {/* React Spring handles "scale-y" and "position-y" props natively on 3D objects */}
      <animated.mesh 
        position-y={y}
        scale-y={scaleY}
      >
        <cylinderGeometry args={[1.9, 1.8, 3, 32]} />
        <meshStandardMaterial color={liquidColor} transparent opacity={0.8} />
      </animated.mesh>

      {/* 3. Floating Label */}
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
        <Text position={[0, 3, 0]} fontSize={0.4} color="white" anchorX="center" anchorY="middle">
          {Math.round(progress * 100)}% FUNDED
        </Text>
      </Float>
    </group>
  )
}
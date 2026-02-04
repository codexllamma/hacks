'use client'
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Float, Sparkles, Text } from '@react-three/drei' // <--- ADDED 'Text' HERE
import * as THREE from 'three'

export default function BirthdayCake({ currentAmount, goalAmount }) {
  // Prevent division by zero
  const safeGoal = goalAmount || 1
  const percentage = Math.min(1, Math.max(0, currentAmount / safeGoal))
  const meshRef = useRef()

  // Animate the cake pop when funds increase
  useFrame((state) => {
    if (meshRef.current) {
      // Gentle bobbing
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.05
      meshRef.current.rotation.y += 0.005
    }
  })

  // Determine Cake State
  const cakeState = useMemo(() => {
    if (percentage === 0) return 'EMPTY';
    if (percentage < 0.33) return 'SLICE';
    if (percentage < 0.50) return 'THIRD';
    if (percentage < 1.0) return 'HALF';
    return 'FULL';
  }, [percentage])

  // Common Materials
  const frostingMat = new THREE.MeshStandardMaterial({ color: '#f472b6', roughness: 0.2 })
  const plateMat = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.1, metalness: 0.1 })

  return (
    <group ref={meshRef}>
      {/* 1. The Plate (Always Visible) */}
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[1.5, 1.2, 0.1, 32]} />
        <primitive object={plateMat} />
      </mesh>

      {/* 2. The Cake Logic */}
      <group position={[0, 0.6, 0]}>
        
        {/* STATE: SLICE (1% - 32%) */}
        {cakeState === 'SLICE' && (
          <group>
            {/* A single wedge (approx 45 degrees) */}
            <mesh position={[0.2, 0, 0.2]} rotation={[0, Math.PI/4, 0]}>
               <cylinderGeometry args={[1, 1, 0.8, 32, 1, false, 0, Math.PI / 4]} />
               <primitive object={frostingMat} />
            </mesh>
            <Sparkles count={10} scale={2} size={2} speed={0.4} opacity={0.5} color="#f472b6" />
          </group>
        )}

        {/* STATE: THIRD (33% - 49%) */}
        {cakeState === 'THIRD' && (
          <group>
            {/* 1/3 Cylinder (120 degrees) */}
            <mesh rotation={[0, 0, 0]}>
               <cylinderGeometry args={[1, 1, 0.8, 32, 1, false, 0, (Math.PI * 2) / 3]} />
               <primitive object={frostingMat} />
            </mesh>
          </group>
        )}

        {/* STATE: HALF (50% - 99%) */}
        {cakeState === 'HALF' && (
          <group>
             {/* Half Cylinder */}
             <mesh rotation={[0, 0, 0]}>
               <cylinderGeometry args={[1, 1, 0.8, 32, 1, false, 0, Math.PI]} />
               <primitive object={frostingMat} />
            </mesh>
          </group>
        )}

        {/* STATE: FULL (100%) */}
        {cakeState === 'FULL' && (
          <group>
            <mesh>
               <cylinderGeometry args={[1, 1, 0.8, 32]} />
               <primitive object={frostingMat} />
            </mesh>
            {/* Candles */}
            <group position={[0, 0.5, 0]}>
               <mesh position={[0.3, 0, 0]}><cylinderGeometry args={[0.05, 0.05, 0.4]} /><meshStandardMaterial color="white"/></mesh>
               <mesh position={[-0.3, 0, 0]}><cylinderGeometry args={[0.05, 0.05, 0.4]} /><meshStandardMaterial color="white"/></mesh>
               <mesh position={[0, 0, 0.3]}><cylinderGeometry args={[0.05, 0.05, 0.4]} /><meshStandardMaterial color="white"/></mesh>
               <Sparkles count={50} scale={3} size={5} speed={1} opacity={1} color="#ffaa00" />
            </group>
            
            {/* THE TEXT THAT WAS CRASHING */}
            <Float speed={5} floatIntensity={0.2}>
               <Text position={[0, 1.5, 0]} fontSize={0.5} color="#d4af37" anchorX="center" anchorY="middle">
                 GOAL MET!
               </Text>
            </Float>
          </group>
        )}
      </group>
    </group>
  )
}
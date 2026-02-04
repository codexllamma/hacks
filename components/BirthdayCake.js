'use client'
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Float, Sparkles, Text } from '@react-three/drei'
import * as THREE from 'three'

export default function BirthdayCake({ currentAmount, goalAmount }) {
  const safeGoal = goalAmount || 1
  const percentage = Math.min(1, Math.max(0, currentAmount / safeGoal))
  const meshRef = useRef()

  // Animate the cake
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.05
      meshRef.current.rotation.y += 0.005
    }
  })

  // 1. UPDATED LOGIC: Added 'THREE_QUARTER' state
  const cakeState = useMemo(() => {
    if (percentage === 0) return 'EMPTY';
    if (percentage < 0.33) return 'SLICE';         // < 33%
    if (percentage < 0.50) return 'THIRD';         // 33% - 49%
    if (percentage < 0.75) return 'HALF';          // 50% - 74%
    if (percentage < 1.0) return 'THREE_QUARTER';  // 75% - 99% (NEW)
    return 'FULL';                                 // 100%
  }, [percentage])

  // 2. MATERIALS: Enforced DoubleSide to prevent transparency
  const frostingMat = new THREE.MeshStandardMaterial({ 
    color: '#f472b6', 
    roughness: 0.2,
    side: THREE.DoubleSide, // FIX: Makes inside faces visible
    shadowSide: THREE.DoubleSide
  })
  
  const plateMat = new THREE.MeshStandardMaterial({ 
    color: '#ffffff', 
    roughness: 0.1, 
    metalness: 0.1,
    side: THREE.DoubleSide
  })

  return (
    <group ref={meshRef}>
      {/* PLATE */}
      <mesh position={[0, 0.05, 0]} receiveShadow>
        <cylinderGeometry args={[1.5, 1.2, 0.1, 32]} />
        <primitive object={plateMat} />
      </mesh>

      {/* CAKE GEOMETRY */}
      <group position={[0, 0.6, 0]}>
        
        {/* 1. SLICE (~12.5% or 45 degrees) */}
        {cakeState === 'SLICE' && (
          <group>
            <mesh position={[0.2, 0, 0.2]} rotation={[0, Math.PI/4, 0]} castShadow>
               <cylinderGeometry args={[1, 1, 0.8, 32, 1, false, 0, Math.PI / 4]} />
               <primitive object={frostingMat} />
            </mesh>
            <Sparkles count={10} scale={2} size={2} speed={0.4} opacity={0.5} color="#f472b6" />
          </group>
        )}

        {/* 2. THIRD (~33% or 120 degrees) */}
        {cakeState === 'THIRD' && (
          <group>
            <mesh rotation={[0, 0, 0]} castShadow>
               <cylinderGeometry args={[1, 1, 0.8, 32, 1, false, 0, (Math.PI * 2) / 3]} />
               <primitive object={frostingMat} />
            </mesh>
          </group>
        )}

        {/* 3. HALF (50% or 180 degrees) */}
        {cakeState === 'HALF' && (
          <group>
             <mesh rotation={[0, 0, 0]} castShadow>
               <cylinderGeometry args={[1, 1, 0.8, 32, 1, false, 0, Math.PI]} />
               <primitive object={frostingMat} />
            </mesh>
          </group>
        )}

        {/* 4. THREE QUARTER (75% or 270 degrees) - NEW */}
        {cakeState === 'THREE_QUARTER' && (
          <group>
             <mesh rotation={[0, 0, 0]} castShadow>
               {/* 1.5 * PI = 270 degrees */}
               <cylinderGeometry args={[1, 1, 0.8, 32, 1, false, 0, Math.PI * 1.5]} />
               <primitive object={frostingMat} />
            </mesh>
            <Sparkles count={20} scale={2.5} size={3} speed={0.6} opacity={0.7} color="#f472b6" />
          </group>
        )}

        {/* 5. FULL (100% or 360 degrees) */}
        {cakeState === 'FULL' && (
          <group>
            <mesh castShadow>
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
'use client'
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Float, Sparkles, Text } from '@react-three/drei'
import * as THREE from 'three'

export default function BirthdayCake({ currentAmount, goalAmount }) {
  const safeGoal = goalAmount || 1
  const percentage = Math.min(1, Math.max(0, currentAmount / safeGoal))
  const meshRef = useRef()

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.05
      meshRef.current.rotation.y += 0.005
    }
  })

  const cakeState = useMemo(() => {
    if (percentage === 0) return 'EMPTY';
    if (percentage < 0.33) return 'SLICE';
    if (percentage < 0.50) return 'THIRD';
    if (percentage < 0.75) return 'HALF';
    if (percentage < 1.0) return 'THREE_QUARTER';
    return 'FULL';
  }, [percentage])

  return (
    <group ref={meshRef}>
      {/* PLATE */}
      <mesh position={[0, 0.05, 0]} receiveShadow>
        <cylinderGeometry args={[1.5, 1.2, 0.1, 32]} />
        <meshStandardMaterial color="#ffffff" roughness={0.1} metalness={0.1} side={THREE.DoubleSide} />
      </mesh>

      {/* CAKE GEOMETRY */}
      <group position={[0, 0.6, 0]}>
        {cakeState === 'SLICE' && (
          <group>
            <mesh position={[0.2, 0, 0.2]} rotation={[0, Math.PI/4, 0]} castShadow>
               <cylinderGeometry args={[1, 1, 0.8, 32, 1, false, 0, Math.PI / 4]} />
               <meshStandardMaterial color="#f472b6" roughness={0.2} side={THREE.DoubleSide} />
            </mesh>
            <Sparkles count={10} scale={2} size={2} speed={0.4} opacity={0.5} color="#f472b6" />
          </group>
        )}

        {cakeState === 'THIRD' && (
          <mesh rotation={[0, 0, 0]} castShadow>
             <cylinderGeometry args={[1, 1, 0.8, 32, 1, false, 0, (Math.PI * 2) / 3]} />
             <meshStandardMaterial color="#f472b6" roughness={0.2} side={THREE.DoubleSide} />
          </mesh>
        )}

        {cakeState === 'HALF' && (
          <mesh rotation={[0, 0, 0]} castShadow>
             <cylinderGeometry args={[1, 1, 0.8, 32, 1, false, 0, Math.PI]} />
             <meshStandardMaterial color="#f472b6" roughness={0.2} side={THREE.DoubleSide} />
          </mesh>
        )}

        {cakeState === 'THREE_QUARTER' && (
          <group>
             <mesh rotation={[0, 0, 0]} castShadow>
               <cylinderGeometry args={[1, 1, 0.8, 32, 1, false, 0, Math.PI * 1.5]} />
               <meshStandardMaterial color="#f472b6" roughness={0.2} side={THREE.DoubleSide} />
            </mesh>
            <Sparkles count={20} scale={2.5} size={3} speed={0.6} opacity={0.7} color="#f472b6" />
          </group>
        )}

        {cakeState === 'FULL' && (
          <group>
            <mesh castShadow>
               <cylinderGeometry args={[1, 1, 0.8, 32]} />
               <meshStandardMaterial color="#f472b6" roughness={0.2} side={THREE.DoubleSide} />
            </mesh>
            <group position={[0, 0.5, 0]}>
               <mesh position={[0.3, 0, 0]}><cylinderGeometry args={[0.05, 0.05, 0.4]} /><meshStandardMaterial color="white"/></mesh>
               <mesh position={[-0.3, 0, 0]}><cylinderGeometry args={[0.05, 0.05, 0.4]} /><meshStandardMaterial color="white"/></mesh>
               <mesh position={[0, 0, 0.3]}><cylinderGeometry args={[0.05, 0.05, 0.4]} /><meshStandardMaterial color="white"/></mesh>
               <Sparkles count={50} scale={3} size={5} speed={1} opacity={1} color="#ffaa00" />
            </group>
            <Float speed={5} floatIntensity={0.2}>
               <Text position={[0, 1.5, 0]} fontSize={0.5} color="#d4af37" anchorX="center" anchorY="middle">GOAL MET!</Text>
            </Float>
          </group>
        )}
      </group>
    </group>
  )
}
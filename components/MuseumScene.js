'use client'
import React, { Suspense, Component } from 'react'
import { useAppStore } from '../store/useAppStore'
import { Text, Float, useTexture } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'

// --- 1. ERROR BOUNDARY ---
class TextureErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }
  static getDerivedStateFromError(error) {
    return { hasError: true }
  }
  componentDidCatch(error, errorInfo) {
    console.warn("Texture load failed. Using fallback colors.", error)
  }
  render() {
    if (this.state.hasError) {
      return this.props.fallback
    }
    return this.props.children
  }
}

// --- 2. TEXTURE HOOK ---
function useArchitecturalTextures() {
  const floor = useTexture({
    map: '/textures/floor/color.jpg',
    normalMap: '/textures/floor/normal.jpg',
    roughnessMap: '/textures/floor/roughness.jpg',
    aoMap: '/textures/floor/ao.jpg',
  })
  
  floor.map.wrapS = floor.map.wrapT = THREE.RepeatWrapping
  floor.normalMap.wrapS = floor.normalMap.wrapT = THREE.RepeatWrapping
  floor.roughnessMap.wrapS = floor.roughnessMap.wrapT = THREE.RepeatWrapping
  floor.aoMap.wrapS = floor.aoMap.wrapT = THREE.RepeatWrapping
  
  const repeatX = 4
  const repeatY = 30
  floor.map.repeat.set(repeatX, repeatY)
  floor.normalMap.repeat.set(repeatX, repeatY)
  floor.roughnessMap.repeat.set(repeatX, repeatY)
  floor.aoMap.repeat.set(repeatX, repeatY)

  const wall = useTexture({
    map: '/textures/wall/color.jpg',
    normalMap: '/textures/wall/normal.jpg',
    roughnessMap: '/textures/wall/roughness.jpg',
  })

  return { floorProps: floor, wallProps: wall }
}

// --- 3. COMPONENTS ---
function ClassicFrame({ width = 3, height = 4, children }) {
  return (
    <group>
      <mesh position={[0, 0, -0.05]} castShadow>
        <boxGeometry args={[width + 0.4, height + 0.4, 0.1]} />
        <meshStandardMaterial color="#c5a059" roughness={0.2} metalness={0.9} />
      </mesh>
      <mesh position={[0, 0, 0.05]}>
        <boxGeometry args={[width + 0.15, height + 0.15, 0.1]} />
        <meshStandardMaterial color="#c5a059" roughness={0.2} metalness={0.9} />
      </mesh>
      <group position={[0, 0, 0.06]}>{children}</group>
    </group>
  )
}

function CreateFrame({ position, onClick }) {
  const meshRef = useRef()
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.material.emissiveIntensity = 0.5 + Math.sin(state.clock.elapsedTime * 3) * 0.3
    }
  })
  return (
    <group position={position} onClick={onClick}>
       <ClassicFrame width={3.5} height={4.5}>
         <mesh ref={meshRef}>
            <planeGeometry args={[3.3, 4.3]} />
            <meshStandardMaterial color="#10b981" emissive="#059669" roughness={0.2} />
         </mesh>
         <Float speed={4} rotationIntensity={0} floatIntensity={0.5}>
           <Text position={[0, 0, 0.1]} fontSize={0.8} color="white" font="/fonts/Geist-VariableFont_wght.ttf" anchorX="center" anchorY="middle">+</Text>
           <Text position={[0, -1, 0.1]} fontSize={0.2} color="white" font="/fonts/Geist-VariableFont_wght.ttf" anchorX="center" anchorY="middle">CREATE EVENT</Text>
         </Float>
       </ClassicFrame>
    </group>
  )
}

function WallSegment({ position, textureProps }) {
  return (
    <group position={position}>
      <mesh position={[0, 5, -5]} receiveShadow>
        <planeGeometry args={[20, 10]} />
        <meshStandardMaterial color="#e5e5e0" roughness={0.9} {...textureProps} />
      </mesh>
      <mesh position={[0, 1, -4.9]} receiveShadow>
        <boxGeometry args={[20, 2, 0.2]} />
        <meshStandardMaterial color="#3e2723" roughness={0.6} />
      </mesh>
      <mesh position={[0, 9.5, -4.8]}>
        <boxGeometry args={[20, 1, 0.4]} />
        <meshStandardMaterial color="#f3f4f6" />
      </mesh>
    </group>
  )
}

// --- 4. LAYOUT ---
function MuseumLayout({ textures }) {
  const { events, selectEvent, startCreating } = useAppStore()
  const createIndex = events.length; 
  const createZPos = createIndex * -15 - 5;

  const floorMat = textures?.floorProps || { color: "#d4c5b0", roughness: 0.8 }
  const wallMat = textures?.wallProps || { color: "#e5e5e0", roughness: 0.9 }

  return (
    <group>
      {/* FLOOR */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -75]} receiveShadow>
        <planeGeometry args={[30, 250]} />
        <meshStandardMaterial {...floorMat} />
      </mesh>

      {/* SKYLIGHT */}
      <group position={[0, 10, 0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -100]}>
          <planeGeometry args={[12, 250]} />
          <meshStandardMaterial color="#e0f7fa" emissive="#e0f7fa" emissiveIntensity={0.8} toneMapped={false} />
        </mesh>
        {Array.from({ length: 50 }).map((_, i) => (
          <mesh key={i} position={[0, -0.2, -i * 5]} castShadow receiveShadow>
            <boxGeometry args={[12.5, 0.5, 0.5]} />
            <meshStandardMaterial color="#262626" />
          </mesh>
        ))}
      </group>

      {/* WALLS */}
      {Array.from({ length: 15 }).map((_, i) => (
        <group key={i} position={[0, 0, -i * 20]}>
           <group position={[8, 0, 0]} rotation={[0, -Math.PI/2, 0]}>
             <WallSegment position={[0, 0, 0]} textureProps={wallMat} />
           </group>
           <group position={[-8, 0, 0]} rotation={[0, Math.PI/2, 0]}>
             <WallSegment position={[0, 0, 0]} textureProps={wallMat} />
           </group>
        </group>
      ))}

      {/* EVENTS */}
      {events.map((event, i) => {
        const zPos = i * -15 - 5 
        let color = '#60a5fa'
        if (event.theme === 'birthday') color = '#f472b6'
        
        return (
          <group key={event.id} position={[7.8, 4, zPos]} rotation={[0, -Math.PI / 2, 0]}>
            <group onClick={() => selectEvent(i)}>
              <ClassicFrame width={3.5} height={4.5}>
                <mesh>
                  <planeGeometry args={[3.3, 4.3]} />
                  <meshStandardMaterial color={color} roughness={0.6} />
                </mesh>
                <mesh position={[0, -2.5, 0.05]}>
                   <boxGeometry args={[2, 0.5, 0.05]} />
                   <meshStandardMaterial color="#b8860b" />
                </mesh>
                <Text position={[0, -2.5, 0.1]} fontSize={0.15} color="black" font="/fonts/Geist-VariableFont_wght.ttf" anchorX="center" anchorY="middle">
                  {event.title.toUpperCase()}
                </Text>
              </ClassicFrame>
            </group>
          </group>
        )
      })}

      <group position={[7.8, 4, createZPos]} rotation={[0, -Math.PI / 2, 0]}>
         <CreateFrame onClick={startCreating} />
      </group>
    </group>
  )
}

function TexturedMuseum() {
  const textures = useArchitecturalTextures()
  return <MuseumLayout textures={textures} />
}

function FallbackMuseum() {
  return <MuseumLayout textures={null} />
}

export default function MuseumScene() {
  return (
    <TextureErrorBoundary fallback={<FallbackMuseum />}>
      <Suspense fallback={<FallbackMuseum />}>
        <TexturedMuseum />
      </Suspense>
    </TextureErrorBoundary>
  )
}
'use client'
import React, { Suspense, Component, useRef, useMemo } from 'react'
import { useAppStore } from '../store/useAppStore'
import { Text, Float, useTexture, MeshTransmissionMaterial } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// --- 1. THEMED ICONS COMPONENT ---
function ThemeIcon({ theme }) {
  const icons = {
    birthday: { char: '🎂', color: '#f472b6', bg: '#fee2e2' },
    trip: { char: '✈️', color: '#60a5fa', bg: '#dbeafe' },
    dineout: { char: '🍽️', color: '#fbbf24', bg: '#fef3c7' },
    movie: { char: '🎬', color: '#a78bfa', bg: '#ede9fe' },
    default: { char: '✨', color: '#9ca3af', bg: '#f3f4f6' }
  }
  const config = icons[theme] || icons.default

  return (
    <group>
      <mesh position={[0, 0, 0.01]}>
        <planeGeometry args={[3.3, 4.3]} />
        <meshStandardMaterial color={config.bg} roughness={0.2} />
      </mesh>
      <Text position={[0, 0.5, 0.15]} fontSize={1.2} font="/fonts/Geist-VariableFont_wght.ttf">{config.char}</Text>
      <mesh position={[0, 0, 0]}>
        <planeGeometry args={[3.4, 4.4]} />
        <meshBasicMaterial color={config.color} />
      </mesh>
    </group>
  )
}

// --- 2. OPTIMIZED SUNSET RAYS ---
function SunsetSunRays() {
  const raysRef = useRef()
  useFrame((state) => {
    if (raysRef.current) {
       const t = state.clock.elapsedTime
       raysRef.current.children.forEach((ray, i) => {
         ray.material.opacity = 0.04 + Math.sin(t * 1.5 + i) * 0.02
       })
    }
  })

  return (
    <group ref={raysRef} position={[15, 15, -60]} rotation={[0.6, 0, 0.4]}>
      {[...Array(6)].map((_, i) => (
        <mesh key={i} position={[i * -8, 0, 0]}>
          <cylinderGeometry args={[0.5, 6, 80, 12, 1, true]} />
          <meshBasicMaterial 
            color="#ffaa33" 
            transparent 
            opacity={0.06} 
            blending={THREE.AdditiveBlending} 
            side={THREE.DoubleSide} 
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  )
}

// --- 3. UPGRADED FRAME ---
function ClassicFrame({ width = 3, height = 4, children }) {
  return (
    <group>
      <mesh position={[0, 0, -0.05]} castShadow>
        <boxGeometry args={[width + 0.6, height + 0.6, 0.2]} />
        <meshStandardMaterial color="#2d1d14" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0, 0.05]}>
        <boxGeometry args={[width + 0.15, height + 0.15, 0.05]} />
        <meshStandardMaterial color="#d4af37" roughness={0.3} metalness={0.8} />
      </mesh>
      <mesh position={[0, 0, 0.07]}>
        <planeGeometry args={[width + 0.05, height + 0.05]} />
        <meshStandardMaterial color="#fdfcf0" />
      </mesh>
      <group position={[0, 0, 0.08]}>{children}</group>
    </group>
  )
}

function CreateFrame({ position, onClick }) {
  const meshRef = useRef()
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.material.emissiveIntensity = 0.4 + Math.sin(state.clock.elapsedTime * 2) * 0.2
    }
  })
  return (
    <group position={position} onClick={onClick}>
       <ClassicFrame width={3.5} height={4.5}>
         <mesh ref={meshRef} position={[0, 0, 0.01]}>
            <planeGeometry args={[3.3, 4.3]} />
            <meshStandardMaterial color="#059669" emissive="#10b981" roughness={0.2} />
         </mesh>
         <Float speed={3} rotationIntensity={0} floatIntensity={0.4}>
           <Text position={[0, 0, 0.1]} fontSize={0.8} color="white" font="/fonts/Geist-VariableFont_wght.ttf" anchorX="center" anchorY="middle">+</Text>
           <Text position={[0, -1, 0.1]} fontSize={0.2} color="white" font="/fonts/Geist-VariableFont_wght.ttf" anchorX="center" anchorY="middle">CREATE EVENT</Text>
         </Float>
       </ClassicFrame>
    </group>
  )
}

// --- 4. HIGH-PERFORMANCE GLASS ROOF ---
function GlassSkylight() {
  return (
    <group position={[0, 10, 0]}>
      {/* Merged Glass Pane - Fast Physical Material */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -75]}>
        <planeGeometry args={[12, 160]} />
        <meshPhysicalMaterial 
          transparent 
          opacity={0.3} 
          transmission={1} 
          thickness={0.5} 
          roughness={0} 
          color="#ffd1b3" 
          ior={1.1}
        />
      </mesh>
      
      {/* Structural Framework (Single Loop) */}
      {Array.from({ length: 32 }).map((_, i) => (
        <group key={i} position={[0, 0, -i * 5]}>
          <mesh>
            <boxGeometry args={[12.2, 0.2, 0.2]} />
            <meshStandardMaterial color="#111" metalness={0.9} />
          </mesh>
          <mesh position={[6, 0, 2.5]} rotation={[0, 0, 0]}>
            <boxGeometry args={[0.2, 0.2, 5]} />
            <meshStandardMaterial color="#111" metalness={0.9} />
          </mesh>
          <mesh position={[-6, 0, 2.5]}>
            <boxGeometry args={[0.2, 0.2, 5]} />
            <meshStandardMaterial color="#111" metalness={0.9} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

function WallSegment({ position, textureProps }) {
  return (
    <group position={position}>
      <mesh position={[0, 5, -5]} receiveShadow>
        <planeGeometry args={[20, 10]} />
        <meshStandardMaterial color="#fafaf9" roughness={0.9} {...textureProps} />
      </mesh>
      {/* Connection to Roof */}
      <mesh position={[-1, 10, -5]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2, 10]} />
        <meshStandardMaterial color="#fafaf9" roughness={1} />
      </mesh>
      <mesh position={[0, 0.4, -4.9]}>
        <boxGeometry args={[20, 0.8, 0.3]} />
        <meshStandardMaterial color="#111" />
      </mesh>
    </group>
  )
}

// --- 5. MAIN LAYOUT ---
function MuseumLayout({ textures }) {
  const { events, selectEvent, startCreating } = useAppStore()
  const createIndex = events.length; 
  const createZPos = createIndex * -15 - 5;

  const floorMat = textures?.floorProps || { color: "#3d2b1f", roughness: 0.8 }
  const wallMat = textures?.wallProps || { color: "#fafaf9", roughness: 0.9 }

  return (
    <group>
      <SunsetSunRays />
      <GlassSkylight />

      {/* FLOOR */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -75]} receiveShadow>
        <planeGeometry args={[30, 200]} />
        <meshStandardMaterial {...floorMat} color="#3d2b1f" />
      </mesh>

      {/* WALLS */}
      {Array.from({ length: 12 }).map((_, i) => (
        <group key={i} position={[0, 0, -i * 20]}>
           <group position={[8, 0, 0]} rotation={[0, -Math.PI/2, 0]}><WallSegment position={[0, 0, 0]} textureProps={wallMat} /></group>
           <group position={[-8, 0, 0]} rotation={[0, Math.PI/2, 0]}><WallSegment position={[0, 0, 0]} textureProps={wallMat} /></group>
        </group>
      ))}

      {/* EVENTS */}
      {events.map((event, i) => (
        <group key={event.id} position={[7.8, 4, i * -15 - 5]} rotation={[0, -Math.PI / 2, 0]}>
          <group 
            onClick={() => selectEvent(i)}
            onPointerOver={() => (document.body.style.cursor = 'pointer')}
            onPointerOut={() => (document.body.style.cursor = 'auto')}
          >
            <ClassicFrame width={3.5} height={4.5}>
              <ThemeIcon theme={event.theme} />
              <mesh position={[0, -2.5, 0.1]}>
                 <boxGeometry args={[2.5, 0.6, 0.05]} />
                 <meshStandardMaterial color="#1a1a1a" />
              </mesh>
              <Text position={[0, -2.5, 0.15]} fontSize={0.18} color="white" font="/fonts/Geist-VariableFont_wght.ttf">
                {event.title.toUpperCase()}
              </Text>
            </ClassicFrame>
          </group>
        </group>
      ))}

      <group position={[7.8, 4, createZPos]} rotation={[0, -Math.PI / 2, 0]}>
         <CreateFrame onClick={startCreating} />
      </group>
    </group>
  )
}

// --- 6. TEXTURE & ERROR LOGIC ---
function useArchitecturalTextures() {
  const floor = useTexture({
    map: '/textures/floor/color.jpg',
    normalMap: '/textures/floor/normal.jpg',
    roughnessMap: '/textures/floor/roughness.jpg',
    aoMap: '/textures/floor/ao.jpg',
  })
  
  const wall = useTexture({
    map: '/textures/wall/color.jpg',
    normalMap: '/textures/wall/normal.jpg',
    roughnessMap: '/textures/wall/roughness.jpg',
  })

  useMemo(() => {
    Object.values(floor).forEach(t => { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(4, 30) })
  }, [floor])

  return { floorProps: floor, wallProps: wall }
}

class TextureErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { hasError: false } }
  static getDerivedStateFromError() { return { hasError: true } }
  render() { return this.state.hasError ? this.props.fallback : this.props.children }
}

function TexturedMuseum() {
  const textures = useArchitecturalTextures()
  return <MuseumLayout textures={textures} />
}

export default function MuseumScene() {
  return (
    <TextureErrorBoundary fallback={<MuseumLayout textures={null} />}>
      <Suspense fallback={<MuseumLayout textures={null} />}>
        <TexturedMuseum />
      </Suspense>
    </TextureErrorBoundary>
  )
}
'use client'
import React, { Suspense, Component, useRef, useMemo } from 'react'
import { useAppStore } from '../store/useAppStore'
import { Text, Float, useTexture } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// --- DECOR COMPONENTS ---
function MuseumBench({ position, rotation }) {
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[3, 0.4, 1]} />
        <meshStandardMaterial color="#5d1a1a" roughness={0.6} />
      </mesh>
      <mesh position={[1.2, 0.25, 0]}><boxGeometry args={[0.2, 0.5, 0.8]} /><meshStandardMaterial color="#111" /></mesh>
      <mesh position={[-1.2, 0.25, 0]}><boxGeometry args={[0.2, 0.5, 0.8]} /><meshStandardMaterial color="#111" /></mesh>
    </group>
  )
}

function AbstractSculpture({ position }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.75, 0]} castShadow>
        <boxGeometry args={[0.8, 1.5, 0.8]} />
        <meshStandardMaterial color="#f5f5f5" roughness={0.1} metalness={0.1} />
      </mesh>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.2}>
        <mesh position={[0, 1.8, 0]}>
          <torusKnotGeometry args={[0.4, 0.15, 100, 16]} />
          <meshStandardMaterial color="#ffd700" metalness={1} roughness={0.1} />
        </mesh>
      </Float>
    </group>
  )
}

function PottedPlant({ position }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.4, 0]} castShadow>
        <cylinderGeometry args={[0.4, 0.3, 0.8, 16]} />
        <meshStandardMaterial color="#3e2723" />
      </mesh>
      <mesh position={[0, 1.2, 0]}>
        <dodecahedronGeometry args={[0.6]} />
        <meshStandardMaterial color="#22c55e" roughness={0.8} />
      </mesh>
    </group>
  )
}

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

function SkeletonFrame() {
  const meshRef = useRef()
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.material.opacity = 0.3 + Math.sin(state.clock.elapsedTime * 5) * 0.2
    }
  })
  return (
    <ClassicFrame width={3.5} height={4.5}>
      <mesh ref={meshRef} position={[0, 0, 0.01]}>
         <planeGeometry args={[3.3, 4.3]} />
         <meshStandardMaterial color="#333" transparent opacity={0.5} />
      </mesh>
      <Text position={[0, 0, 0.1]} fontSize={0.4} color="#888" font="/fonts/Geist-VariableFont_wght.ttf" anchorX="center" anchorY="middle">LOADING...</Text>
    </ClassicFrame>
  )
}

function SunsetSunRays() {
  const raysRef = useRef()
  useFrame((state) => {
    if (raysRef.current) {
       const t = state.clock.elapsedTime
       raysRef.current.children.forEach((ray, i) => {
         ray.material.opacity = 0.03 + Math.sin(t * 1 + i) * 0.01
       })
    }
  })
  return (
    <group ref={raysRef} position={[0, 20, -40]} rotation={[0, 0, -0.2]}>
      {[...Array(5)].map((_, i) => (
        <mesh key={i} position={[i * 5 - 10, 0, 0]} rotation={[0, 0, (i - 2) * 0.1]}>
          <coneGeometry args={[2, 30, 32, 1, true]} />
          <meshBasicMaterial color="#fff0d4" transparent opacity={0.05} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
      ))}
    </group>
  )
}

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

function GlassSkylight({ length }) {
  const segments = Math.ceil(length / 5);
  // FIX: Shifted position Z slightly so beams align with wall segments
  return (
    <group position={[0, 10, -5]}> 
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -length / 2 + 5]}>
        <planeGeometry args={[12, length]} />
        {/* FIX: Lower opacity and remove transmission for better sun visibility */}
        <meshPhysicalMaterial 
            transparent 
            opacity={0.1} 
            color="#ffd1b3" 
            roughness={0}
            metalness={0.1}
            depthWrite={false}
        />
      </mesh>
      {Array.from({ length: segments }).map((_, i) => (
        <group key={i} position={[0, 0, -i * 5]}>
          <mesh><boxGeometry args={[12.2, 0.2, 0.2]} /><meshStandardMaterial color="#111" metalness={0.9} /></mesh>
          <mesh position={[6, 0, 2.5]}><boxGeometry args={[0.2, 0.2, 5]} /><meshStandardMaterial color="#111" metalness={0.9} /></mesh>
          <mesh position={[-6, 0, 2.5]}><boxGeometry args={[0.2, 0.2, 5]} /><meshStandardMaterial color="#111" metalness={0.9} /></mesh>
        </group>
      ))}
    </group>
  )
}

function WallSegment({ position, textureProps }) {
  return (
    <group position={position}>
      {/* FIX: Removed 'position' offset here. The geometry is now centered 
         relative to the group, so it rotates perfectly around the center. */}
      <mesh position={[0, 5, 0]} receiveShadow>
        <planeGeometry args={[20, 10]} />
        <meshStandardMaterial color="#fafaf9" roughness={0.9} {...textureProps} />
      </mesh>
      <mesh position={[-1, 10, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2, 10]} />
        <meshStandardMaterial color="#fafaf9" roughness={1} />
      </mesh>
      <mesh position={[0, 0.4, 0]}>
        <boxGeometry args={[20, 0.8, 0.3]} />
        <meshStandardMaterial color="#111" />
      </mesh>
    </group>
  )
}

function MuseumLayout({ textures }) {
  const { events, selectEvent, startCreating, isLoading } = useAppStore() 
  
  const spacing = 15;
  const eventCount = isLoading ? 3 : events.length; 
  const totalLength = Math.max(150, (eventCount + 1) * spacing + 50); 
  
  const wallSegmentCount = Math.ceil(totalLength / 20);
  
  // FIX: Calculate exact end position of the walls
  // Each segment is 20 units. 
  // If we have N segments, they span from Z=10 to Z=-(N*20 - 10).
  const wallEndPosition = -(wallSegmentCount * 20 - 10);
  
  const createZPos = eventCount * -15 - 5;

  const floorMat = textures?.floorProps || { color: "#3d2b1f", roughness: 0.8 }
  const wallMat = textures?.wallProps || { color: "#fafaf9", roughness: 0.9 }

  return (
    <group>
      <SunsetSunRays />
      <GlassSkylight length={totalLength} />

      {/* FLOOR */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -totalLength / 2 + 10]} receiveShadow>
        <planeGeometry args={[30, totalLength]} />
        <meshStandardMaterial {...floorMat} color="#3d2b1f" />
      </mesh>
      
      {/* RUNNER */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, -totalLength / 2 + 10]} receiveShadow>
        <planeGeometry args={[4, totalLength]} />
        <meshStandardMaterial color="#660000" roughness={0.9} />
      </mesh>

      {/* WALLS */}
      {Array.from({ length: wallSegmentCount }).map((_, i) => (
        <group key={`wall-${i}`} position={[0, 0, -i * 20]}>
           {/* Right Wall: Positioned at X=8, Rotated -90deg */}
           <group position={[8, 0, 0]} rotation={[0, -Math.PI/2, 0]}>
             <WallSegment position={[0, 0, 0]} textureProps={wallMat} />
           </group>
           {/* Left Wall: Positioned at X=-8, Rotated +90deg */}
           <group position={[-8, 0, 0]} rotation={[0, Math.PI/2, 0]}>
             <WallSegment position={[0, 0, 0]} textureProps={wallMat} />
           </group>
        </group>
      ))}

      {/* FIX: END WALL 
          Placed exactly at the end of the side walls (-20 per segment). 
          Width increased to 18 to ensure overlaps.
      */}
      <mesh position={[0, 5, wallEndPosition]} receiveShadow>
         <planeGeometry args={[18, 10]} />
         <meshStandardMaterial {...wallMat} color="#fafaf9" />
      </mesh>

      {/* FRAMES */}
      {isLoading && Array.from({ length: 3 }).map((_, i) => (
        <group key={`skeleton-${i}`} position={[7.8, 4, i * -15 - 5]} rotation={[0, -Math.PI / 2, 0]}>
          <SkeletonFrame />
        </group>
      ))}

      {!isLoading && events.map((event, i) => (
        <group key={`event-${event.id}`} position={[7.8, 4, i * -15 - 5]} rotation={[0, -Math.PI / 2, 0]}>
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
      
      {/* DECOR */}
      {!isLoading && events.map((_, i) => {
        const zPos = i * -15 - 5;
        if (i % 3 === 0) return <MuseumBench key={`decor-${i}`} position={[-6.5, 0, zPos]} rotation={[0, Math.PI / 2, 0]} />
        if (i % 3 === 1) return <AbstractSculpture key={`decor-${i}`} position={[-6.5, 0, zPos]} />
        return <PottedPlant key={`decor-${i}`} position={[-6.5, 0, zPos]} />
      })}

      <group position={[7.8, 4, createZPos]} rotation={[0, -Math.PI / 2, 0]}>
         <CreateFrame onClick={startCreating} />
      </group>
    </group>
  )
}

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
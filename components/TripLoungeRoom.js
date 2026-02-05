'use client'
import { 
  Environment, 
  ContactShadows, 
  Text, 
  Float,
  Stars,
  Grid,
  useTexture
} from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useRef, useMemo } from 'react'
import * as THREE from 'three'
import UserGroup from './UserGroup'

// --- DECORATIONS ---
function LuggageStack({ position }) {
  return (
    <group position={position} rotation={[0, Math.random() * Math.PI, 0]}>
      <mesh position={[0, 0.25, 0]} castShadow>
        <boxGeometry args={[0.8, 0.5, 0.5]} />
        <meshStandardMaterial color="#8B4513" roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.5, 0]}>
        <torusGeometry args={[0.1, 0.02, 16, 32]} />
        <meshStandardMaterial color="black" />
      </mesh>
      <group position={[0.1, 0.5, 0]} rotation={[0, 0.5, 0]}>
        <mesh position={[0, 0.2, 0]} castShadow>
          <boxGeometry args={[0.6, 0.4, 0.4]} />
          <meshStandardMaterial color="#2E8B57" roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.4, 0]}>
          <torusGeometry args={[0.08, 0.02, 16, 32]} />
          <meshStandardMaterial color="black" />
        </mesh>
      </group>
    </group>
  )
}

function HologramGlobe() {
  const globeRef = useRef()
  useFrame((state, delta) => {
    if (globeRef.current) globeRef.current.rotation.y += delta * 0.2
  })
  return (
    <group position={[5, 1.5, -5]}>
      <mesh position={[0, -1.5, 0]}><cylinderGeometry args={[0.5, 0.8, 1, 32]} /><meshStandardMaterial color="#333" metalness={0.8} /></mesh>
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
        <mesh ref={globeRef}><sphereGeometry args={[1.2, 32, 32]} /><meshBasicMaterial color="#00ffff" wireframe transparent opacity={0.3} /></mesh>
        <mesh scale={[0.95, 0.95, 0.95]}><sphereGeometry args={[1.2, 32, 32]} /><meshBasicMaterial color="#0000ff" transparent opacity={0.1} /></mesh>
      </Float>
      <Text position={[0, 1.8, 0]} fontSize={0.3} color="#00ffff" anchorX="center">SELECT DESTINATION</Text>
    </group>
  )
}

function Signpost() {
  return (
    <group position={[-5, 0, -4]} rotation={[0, 0.3, 0]}>
      <mesh position={[0, 1.5, 0]} castShadow><cylinderGeometry args={[0.05, 0.05, 3]} /><meshStandardMaterial color="#555" /></mesh>
      <group position={[0, 2.5, 0]}>
        <mesh position={[0, 0, 0.2]} rotation={[0, 0.1, 0]}><boxGeometry args={[1.2, 0.3, 0.05]} /><meshStandardMaterial color="#d4a133" /></mesh>
        <Text position={[0, 0, 0.26]} rotation={[0, 0.1, 0]} fontSize={0.15} color="black">PARIS ➜</Text>
        <mesh position={[0, -0.4, -0.2]} rotation={[0, -0.2, 0]}><boxGeometry args={[1.2, 0.3, 0.05]} /><meshStandardMaterial color="#d4a133" /></mesh>
        <Text position={[0, -0.4, -0.14]} rotation={[0, -0.2, 0]} fontSize={0.15} color="black">⬅ TOKYO</Text>
      </group>
    </group>
  )
}

function LoungePlatform() {
  return (
    <group position={[0, -0.05, 0]}>
      <mesh receiveShadow rotation={[-Math.PI/2, 0, 0]}><circleGeometry args={[12, 64]} /><meshStandardMaterial color="#1a1a1a" roughness={0.2} metalness={0.8} /></mesh>
      <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, 0.01, 0]}><ringGeometry args={[11.8, 12, 64]} /><meshBasicMaterial color="#00ffff" toneMapped={false} /></mesh>
      {Array.from({ length: 24 }).map((_, i) => {
        const angle = (i / 24) * Math.PI * 2
        return <mesh key={i} position={[Math.cos(angle) * 11.5, 0.5, Math.sin(angle) * 11.5]}><cylinderGeometry args={[0.05, 0.05, 1]} /><meshStandardMaterial color="#444" metalness={1} /></mesh>
      })}
    </group>
  )
}

// --- PORTAL COMPONENT 1: CONSTRUCTION PHASE (The "Coming Together") ---
function PortalConstruction({ progress }) {
  const count = 16
  const radius = 5.5
  
  // Create shards with random start positions but known target positions (the ring)
  const shards = useMemo(() => Array.from({ length: count }).map((_, i) => ({
      angle: (i / count) * Math.PI * 2,
      // Random scattered start position
      scatterPos: [
        (Math.random() - 0.5) * 20, 
        (Math.random() - 0.5) * 10 + 5, 
        (Math.random() - 0.5) * 10
      ],
      // Random scattered rotation
      scatterRot: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI]
  })), [])
  
  const groupRef = useRef()

  useFrame(() => {
    if (!groupRef.current) return
    
    // Smooth the progress curve (ease-out)
    const currentProgress = Math.min(progress, 1)
    const mix = Math.pow(currentProgress, 0.5) // Starts fast, slows down at the end

    groupRef.current.children.forEach((mesh, i) => {
      const shard = shards[i]
      
      // Calculate Target Position (The Perfect Ring)
      const targetX = Math.cos(shard.angle) * radius
      const targetY = Math.sin(shard.angle) * radius + 4 // +4 is height offset
      
      // Interpolate Position
      mesh.position.x = THREE.MathUtils.lerp(shard.scatterPos[0], targetX, mix)
      mesh.position.y = THREE.MathUtils.lerp(shard.scatterPos[1], targetY, mix)
      mesh.position.z = THREE.MathUtils.lerp(shard.scatterPos[2], 0, mix) // Target Z is 0

      // Interpolate Rotation (Spinning shards align perfectly to tangent)
      // Target rotation creates a clean ring segment alignment
      mesh.rotation.x = THREE.MathUtils.lerp(shard.scatterRot[0], 0, mix)
      mesh.rotation.y = THREE.MathUtils.lerp(shard.scatterRot[1], 0, mix)
      mesh.rotation.z = THREE.MathUtils.lerp(shard.scatterRot[2], shard.angle, mix)
    })
  })

  return (
    <group ref={groupRef} position={[0, 0, -25]}>
      {shards.map((_, i) => (
        <mesh key={i} castShadow>
          {/* Shards look like segments of the frame */}
          <boxGeometry args={[0.5, 2, 0.2]} /> 
          <meshStandardMaterial 
            color="#ffffff" 
            metalness={1} 
            roughness={0.2}
            emissive="#ffffff"
            emissiveIntensity={0.2}
          />
        </mesh>
      ))}
    </group>
  )
}

// --- PORTAL COMPONENT 2: FINAL STATE (The Sleek Window) ---
function PortalEventHorizon({ active }) {
  const portalMap = useTexture('https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80')

  if (!active) return null

  return (
    <group position={[0, 4, -25]}>
      {/* 1. Sleek Metallic Frame (Torus) - Matches the construction shards color */}
      <mesh>
        <torusGeometry args={[5.5, 0.15, 32, 100]} />
        <meshStandardMaterial 
          color="#ffffff" 
          metalness={1} 
          roughness={0.1} 
          emissive="#ffffff"
          emissiveIntensity={0.1}
        />
      </mesh>

      {/* 2. Seamless Destination Window */}
      <mesh position={[0, 0, -0.05]}>
        <circleGeometry args={[5.45, 64]} />
        <meshBasicMaterial map={portalMap} toneMapped={false} />
      </mesh>

      {/* 3. Subtle Inner Glow Ring */}
      <mesh position={[0, 0, -0.04]}>
        <ringGeometry args={[5.3, 5.5, 64]} />
        <meshBasicMaterial color="#00ffff" transparent opacity={0.5} toneMapped={false} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

export default function TripLoungeRoom({ event }) {
  if (!event) return null
  
  const percentage = event.percentage || 0;
  const progress = percentage / 100;
  const isActivated = progress >= 1;
  const categories = event.rawCategories || [];

  return (
    <group>
      <Environment preset="city" /> 
      <ambientLight intensity={0.7} color="#ffffff" />
      <pointLight position={[0, 10, 0]} intensity={1} color="#00ffff" distance={20} />
      <spotLight position={[10, 20, 10]} angle={0.5} penumbra={1} intensity={2} color="#ffd700" castShadow />

      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      <Grid position={[0, -0.1, 0]} args={[100, 100]} cellSize={1} cellThickness={0.5} cellColor="#6f6f6f" sectionSize={5} sectionThickness={1} sectionColor="#9d4b4b" fadeDistance={50} infiniteGrid />

      <LoungePlatform />
      <LuggageStack position={[3, 0, 2]} />
      <LuggageStack position={[-3.5, 0, 3]} />
      <HologramGlobe />
      <Signpost />

      {/* LOGIC: Show Construction OR Final based on completion */}
      {!isActivated && <PortalConstruction progress={progress} />}
      <PortalEventHorizon active={isActivated} />

      {/* TEXT & INFO */}
      <group position={[0, 9, -20]}>
        <Float speed={2} rotationIntensity={0} floatIntensity={0.5}>
          <Text fontSize={1.5} color={isActivated ? "#fcd34d" : "#ffffff"} font="/fonts/Geist-VariableFont_wght.ttf" anchorY="bottom" outlineWidth={0.02} outlineColor="#000">
            {event.title.toUpperCase()}
          </Text>
          <Text position={[0, -1, 0]} fontSize={0.8} color={isActivated ? "#4ade80" : "#a78bfa"} font="/fonts/Geist-VariableFont_wght.ttf">
            {isActivated 
              ? "PORTAL OPEN - READY TO TRAVEL" 
              : `BUILDING PORTAL: ${percentage}% ($${Number(event.totalPool).toFixed(2)} / $${Number(event.budgetGoal).toFixed(2)})`
            }
          </Text>

          <group position={[0, -2.5, 0]}>
            {categories.map((cat, i) => (
              <Text key={cat.id || i} position={[0, -0.8 * i, 0]} fontSize={0.5} color="#114e4e" anchorX="center">
                {cat.name} :: {Math.floor((cat.totalPooled / (cat.spendingLimit || 1)) * 100)}% ($${Number(cat.totalPooled).toFixed(2)} / $${Number(cat.spendingLimit).toFixed(2)})
              </Text>
            ))}
          </group>
        </Float>
      </group>

      <group position={[0, 0, 0]}><UserGroup variant="circle" /></group>
      <ContactShadows position={[0, 0.01, 0]} opacity={0.5} scale={30} blur={2.5} far={4} color="#000000" />
    </group>
  )
}
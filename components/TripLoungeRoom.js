'use client'
import { 
  Environment, 
  ContactShadows, 
  Text, 
  MeshTransmissionMaterial, 
  Sparkles, 
  Float,
  Stars,
  Grid,
  useTexture
} from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useRef, useMemo } from 'react'
import * as THREE from 'three'
import UserGroup from './UserGroup'

// --- DECORATIONS: LUGGAGE & TRAVEL GEAR ---
function LuggageStack({ position }) {
  return (
    <group position={position} rotation={[0, Math.random() * Math.PI, 0]}>
      {/* Suitcase 1 (Bottom) */}
      <mesh position={[0, 0.25, 0]} castShadow>
        <boxGeometry args={[0.8, 0.5, 0.5]} />
        <meshStandardMaterial color="#8B4513" roughness={0.3} />
      </mesh>
      {/* Handle */}
      <mesh position={[0, 0.5, 0]}>
        <torusGeometry args={[0.1, 0.02, 16, 32]} />
        <meshStandardMaterial color="black" />
      </mesh>

      {/* Suitcase 2 (Top, rotated) */}
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

// --- DECORATION: HOLOGRAPHIC GLOBE ---
function HologramGlobe() {
  const globeRef = useRef()
  useFrame((state, delta) => {
    if (globeRef.current) globeRef.current.rotation.y += delta * 0.2
  })

  return (
    <group position={[5, 1.5, -5]}>
      {/* Base */}
      <mesh position={[0, -1.5, 0]}>
        <cylinderGeometry args={[0.5, 0.8, 1, 32]} />
        <meshStandardMaterial color="#333" metalness={0.8} />
      </mesh>
      
      {/* Globe */}
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
        <mesh ref={globeRef}>
          <sphereGeometry args={[1.2, 32, 32]} />
          <meshBasicMaterial color="#00ffff" wireframe transparent opacity={0.3} />
        </mesh>
        <mesh scale={[0.95, 0.95, 0.95]}>
           <sphereGeometry args={[1.2, 32, 32]} />
           <meshBasicMaterial color="#0000ff" transparent opacity={0.1} />
        </mesh>
      </Float>
      
      <Text position={[0, 1.8, 0]} fontSize={0.3} color="#00ffff" anchorX="center">
        SELECT DESTINATION
      </Text>
    </group>
  )
}

// --- DECORATION: SIGNPOST ---
function Signpost() {
  return (
    <group position={[-5, 0, -4]} rotation={[0, 0.3, 0]}>
      {/* Pole */}
      <mesh position={[0, 1.5, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 3]} />
        <meshStandardMaterial color="#555" />
      </mesh>
      
      {/* Signs */}
      <group position={[0, 2.5, 0]}>
        <mesh position={[0, 0, 0.2]} rotation={[0, 0.1, 0]}>
          <boxGeometry args={[1.2, 0.3, 0.05]} />
          <meshStandardMaterial color="#d4a133" />
        </mesh>
        <Text position={[0, 0, 0.26]} rotation={[0, 0.1, 0]} fontSize={0.15} color="black">PARIS ➜</Text>
        
        <mesh position={[0, -0.4, -0.2]} rotation={[0, -0.2, 0]}>
          <boxGeometry args={[1.2, 0.3, 0.05]} />
          <meshStandardMaterial color="#d4a133" />
        </mesh>
        <Text position={[0, -0.4, -0.14]} rotation={[0, -0.2, 0]} fontSize={0.15} color="black">⬅ TOKYO</Text>
      </group>
    </group>
  )
}

// --- STRUCTURE: THE DECK ---
function LoungePlatform() {
  return (
    <group position={[0, -0.05, 0]}>
      {/* Main Floor */}
      <mesh receiveShadow rotation={[-Math.PI/2, 0, 0]}>
        <circleGeometry args={[12, 64]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.2} metalness={0.8} />
      </mesh>
      
      {/* Glowing Edge */}
      <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, 0.01, 0]}>
        <ringGeometry args={[11.8, 12, 64]} />
        <meshBasicMaterial color="#00ffff" toneMapped={false} />
      </mesh>

      {/* Railings */}
      {Array.from({ length: 24 }).map((_, i) => {
        const angle = (i / 24) * Math.PI * 2
        return (
          <mesh key={i} position={[Math.cos(angle) * 11.5, 0.5, Math.sin(angle) * 11.5]}>
             <cylinderGeometry args={[0.05, 0.05, 1]} />
             <meshStandardMaterial color="#444" metalness={1} />
          </mesh>
        )
      })}
    </group>
  )
}

function PortalRing({ progress }) {
  const count = 12
  const radius = 6
  const stones = useMemo(() => Array.from({ length: count }).map((_, i) => ({
      angle: (i / count) * Math.PI * 2,
      scatterPos: [(Math.random() - 0.5) * 15, -4 + Math.random() * 1, (Math.random() - 0.5) * 5],
      scatterRot: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random()]
  })), [])
  
  const groupRef = useRef()
  useFrame((state) => {
    if (!groupRef.current) return
    const t = state.clock.elapsedTime
    groupRef.current.children.forEach((mesh, i) => {
      const stone = stones[i]
      const currentProgress = Math.min(progress, 1)
      const mix = Math.pow(currentProgress, 0.5) 
      const targetX = Math.cos(stone.angle) * radius
      const targetY = Math.sin(stone.angle) * radius + 4 
      mesh.position.set(
        THREE.MathUtils.lerp(stone.scatterPos[0], targetX, mix),
        THREE.MathUtils.lerp(stone.scatterPos[1], targetY, mix),
        THREE.MathUtils.lerp(stone.scatterPos[2], 0, mix)
      )
      mesh.rotation.set(
        THREE.MathUtils.lerp(stone.scatterRot[0], 0, mix),
        THREE.MathUtils.lerp(stone.scatterRot[1], 0, mix),
        THREE.MathUtils.lerp(stone.scatterRot[2], stone.angle, mix)
      )
    })
  })

  return (
    <group ref={groupRef} position={[0, 0, -25]}>
      {stones.map((_, i) => (
        <mesh key={i} castShadow>
          <dodecahedronGeometry args={[0.8, 0]} />
          <meshStandardMaterial color={progress >= 1 ? "#ffd700" : "#57534e"} emissive={progress >= 1 ? "#ffaa00" : "black"} />
        </mesh>
      ))}
    </group>
  )
}

// --- UPDATED PORTAL: Shows "Another World" ---
function PortalEventHorizon({ active }) {
  const meshRef = useRef()
  // Load a scenic landscape texture
  const portalMap = useTexture('https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80')

  useFrame((state) => {
    if (meshRef.current && active) {
      meshRef.current.rotation.z -= 0.05 
      const s = 1 + Math.sin(state.clock.elapsedTime * 5) * 0.02
      meshRef.current.scale.set(s, s, s)
    }
  })

  if (!active) return null

  return (
    <group position={[0, 4, -25]}>
      {/* 1. Portal Rim */}
      <mesh><ringGeometry args={[5.5, 6, 64]} /><meshBasicMaterial color="#00ffff" /></mesh>
      
      {/* 2. Destination World (The Image) */}
      <mesh position={[0, 0, -0.1]}>
        <circleGeometry args={[5.4, 64]} />
        <meshBasicMaterial map={portalMap} toneMapped={false} />
      </mesh>

      {/* 3. Energy Field / Glass Distortion */}
      <mesh ref={meshRef} position={[0, 0, 0.1]}>
        <circleGeometry args={[5.5, 64]} />
        <MeshTransmissionMaterial 
          thickness={0.2} 
          roughness={0} 
          transmission={0.6} // Transparent enough to see the world behind
          ior={1.2} 
          color="#8b5cf6" 
          distortion={0.8}
          distortionScale={0.5}
          temporalDistortion={0.2}
        />
      </mesh>
      
      <Sparkles count={200} scale={12} size={6} speed={0.4} opacity={1} color="#a78bfa" />
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
      <Grid 
        position={[0, -0.1, 0]} 
        args={[100, 100]} 
        cellSize={1} 
        cellThickness={0.5} 
        cellColor="#6f6f6f" 
        sectionSize={5} 
        sectionThickness={1} 
        sectionColor="#9d4b4b" 
        fadeDistance={50} 
        fadeStrength={1.5} 
        infiniteGrid 
      />

      <LoungePlatform />
      <LuggageStack position={[3, 0, 2]} />
      <LuggageStack position={[-3.5, 0, 3]} />
      <HologramGlobe />
      <Signpost />

      <PortalRing progress={progress} />
      <PortalEventHorizon active={isActivated} />

      {/* TEXT & INFO */}
      <group position={[0, 9, -20]}>
        <Float speed={2} rotationIntensity={0} floatIntensity={0.5}>
          <Text 
            fontSize={1.5} 
            color={isActivated ? "#fcd34d" : "#ffffff"} 
            font="/fonts/Geist-VariableFont_wght.ttf"
            anchorY="bottom"
            outlineWidth={0.02} 
            outlineColor="#000"
          >
            {event.title.toUpperCase()}
          </Text>
          <Text 
            position={[0, -1, 0]} 
            fontSize={0.8} 
            color={isActivated ? "#4ade80" : "#a78bfa"} 
            font="/fonts/Geist-VariableFont_wght.ttf"
          >
            {isActivated 
              ? "PORTAL OPEN - READY TO TRAVEL" 
              : `BUILDING PORTAL: ${percentage}% ($${event.totalPool} / $${event.budgetGoal})`
            }
          </Text>

          <group position={[0, -2.5, 0]}>
            {categories.map((cat, i) => (
              <Text 
                key={cat.id || i} 
                position={[0, -0.8 * i, 0]} 
                fontSize={0.5} 
                color="#114e4e" // Bright Cyan for readability
                anchorX="center"
              >
                {cat.name} :: {Math.floor((cat.totalPooled / (cat.spendingLimit || 1)) * 100)}%
              </Text>
            ))}
          </group>

        </Float>
      </group>

      <group position={[0, 0, 0]}>
        <UserGroup variant="circle" />
      </group>

      <ContactShadows position={[0, 0.01, 0]} opacity={0.5} scale={30} blur={2.5} far={4} color="#000000" />
    </group>
  )
}
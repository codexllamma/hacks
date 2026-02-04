'use client'
import { useTexture, Environment, ContactShadows, Text, Float } from '@react-three/drei'
import { useMemo } from 'react'
import * as THREE from 'three'
import BirthdayCake from './BirthdayCake'
import UserGroup from './UserGroup'

// --- DECORATIONS ---
function Chandelier() {
  return (
    <group position={[0, 4.5, 0]}>
      <mesh position={[0, 0.5, 0]}><cylinderGeometry args={[0.05, 0.05, 1]} /><meshStandardMaterial color="#ffd700" metalness={0.8} roughness={0.2} /></mesh>
      <mesh><sphereGeometry args={[0.3, 16, 16]} /><meshStandardMaterial color="#ffd700" metalness={0.8} roughness={0.2} /></mesh>
      {[0, 1, 2, 3].map(i => (
        <group key={i} rotation={[0, (i * Math.PI) / 2, 0]}>
           <mesh position={[0.6, 0.1, 0]} rotation={[0, 0, -0.2]}><cylinderGeometry args={[0.03, 0.03, 1.2]} /><meshStandardMaterial color="#ffd700" metalness={0.8} roughness={0.2} /></mesh>
           <mesh position={[1.1, 0.3, 0]}><sphereGeometry args={[0.15, 16, 16]} /><meshStandardMaterial color="white" emissive="#ffddaa" emissiveIntensity={1} /><pointLight intensity={0.5} distance={3} color="#ffddaa" /></mesh>
        </group>
      ))}
    </group>
  )
}

function BalloonBundle({ position, colors = ['#ff0099', '#00d0ff', '#ffdd00'] }) {
  return (
    <group position={position}>
      {colors.map((c, i) => (
        <Float key={i} speed={2} rotationIntensity={0.5} floatIntensity={1} floatingRange={[0, 0.5]}>
          <group position={[Math.sin(i) * 0.3, i * 0.4, Math.cos(i) * 0.3]}>
            <mesh castShadow><sphereGeometry args={[0.35, 16, 16]} /><meshStandardMaterial color={c} roughness={0.1} metalness={0.1} emissive={c} emissiveIntensity={0.1} /></mesh>
            <mesh position={[0, -0.8, 0]}><cylinderGeometry args={[0.01, 0.01, 1.5]} /><meshBasicMaterial color="white" opacity={0.3} transparent /></mesh>
          </group>
        </Float>
      ))}
    </group>
  )
}

function LEDStringLights() {
  // FIX: Moved points INWARD (9.2 instead of 9.5) to stop clipping
  // FIX: Closed the loop to cover all 4 walls
  const curve = useMemo(() => new THREE.CatmullRomCurve3([
    new THREE.Vector3(-9.2, 4.5, 9.2),  // Front-Left
    new THREE.Vector3(-9.2, 4.0, -9.2), // Back-Left
    new THREE.Vector3(9.2, 4.5, -9.2),  // Back-Right
    new THREE.Vector3(9.2, 4.0, 9.2),   // Front-Right
    new THREE.Vector3(-9.2, 4.5, 9.2),  // Close Loop
  ], true), [])

  const points = useMemo(() => curve.getPoints(80), [curve])
  const lineGeometry = useMemo(() => new THREE.BufferGeometry().setFromPoints(points), [points])
  const bulbs = useMemo(() => curve.getSpacedPoints(40), [curve])

  return (
    <group>
      <line geometry={lineGeometry}><lineBasicMaterial color="#222" /></line>
      {bulbs.map((p, i) => (
        <mesh key={i} position={p}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshStandardMaterial color={i % 2 === 0 ? "#ff0099" : "#00ffcc"} emissive={i % 2 === 0 ? "#ff0099" : "#00ffcc"} emissiveIntensity={2} toneMapped={false} />
        </mesh>
      ))}
    </group>
  )
}

function RealisticTable() {
  const woodMaterial = new THREE.MeshStandardMaterial({ color: "#5d4037", roughness: 0.6 });
  return (
    <group>
      <mesh position={[0, 1.2, 0]} castShadow receiveShadow><boxGeometry args={[3.5, 0.15, 2.5]} /><primitive object={woodMaterial} /></mesh>
      <mesh position={[1.5, 0.6, 1]} castShadow><boxGeometry args={[0.2, 1.2, 0.2]} /><primitive object={woodMaterial} /></mesh>
      <mesh position={[-1.5, 0.6, 1]} castShadow><boxGeometry args={[0.2, 1.2, 0.2]} /><primitive object={woodMaterial} /></mesh>
      <mesh position={[1.5, 0.6, -1]} castShadow><boxGeometry args={[0.2, 1.2, 0.2]} /><primitive object={woodMaterial} /></mesh>
      <mesh position={[-1.5, 0.6, -1]} castShadow><boxGeometry args={[0.2, 1.2, 0.2]} /><primitive object={woodMaterial} /></mesh>
    </group>
  )
}

function RoomTextures() {
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
    [floor, wall].forEach(textures => { Object.values(textures).forEach(t => { t.wrapS = t.wrapT = THREE.RepeatWrapping }) })
    floor.map.repeat.set(4, 4); 
    wall.map.repeat.set(3, 2);
  }, [floor, wall])
  return { floor, wall }
}

export default function DetailedBirthdayRoom({ event }) {
  if (!event) return null;
  const percentage = Math.floor((event.totalPool / event.budgetGoal) * 100);
  let textures = { floor: {}, wall: {} }
  try { textures = RoomTextures() } catch(e) {}

  return (
    <group>
      <Environment preset="night" />
      <ambientLight intensity={0.4} color="#ffd1a4" />
      <spotLight position={[0, 8, 0]} angle={0.6} penumbra={0.4} intensity={1.5} castShadow color="#fff0e0" shadow-mapSize={[512, 512]} />

      <LEDStringLights />
      <Chandelier />
      
      {/* Moved balloons inward slightly to avoid clipping new front wall */}
      <BalloonBundle position={[-8, 1, -8]} colors={['#ff6b6b', '#f06595', '#cc5de8']} />
      <BalloonBundle position={[8, 1, -8]} colors={['#339af0', '#22b8cf', '#20c997']} />
      <BalloonBundle position={[-8, 1, 8]} colors={['#ff922b', '#fcc419', '#ff6b6b']} />
      <BalloonBundle position={[8, 1, 8]} colors={['#51cf66', '#329af0', '#20c997']} />

      <group position={[0, 3.5, -9.4]}>
        <Text fontSize={1.2} color="#ffffff" anchorX="center" anchorY="middle" outlineWidth={0.05} outlineColor="#ff0099">GOAL: ${event.budgetGoal}</Text>
        <Text position={[0, -1, 0]} fontSize={0.8} color={percentage > 0 ? "#00ffcc" : "#888"} anchorX="center" anchorY="middle">RAISED: ${event.totalPool} ({percentage}%)</Text>
      </group>

      <group>
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[20, 20]} /><meshStandardMaterial {...textures.floor} color={textures.floor.map ? "white" : "#4a3b32"} roughness={0.8}/></mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 5, 0]}><planeGeometry args={[20, 20]} /><meshStandardMaterial color="#1a1a1a" /></mesh>

        {/* WALLS: Now 4 Walls for a complete room */}
        {/* Back */}
        <mesh position={[0, 2.5, -9.5]} receiveShadow><planeGeometry args={[20, 5]} /><meshStandardMaterial {...textures.wall} color="#111111" /></mesh>
        {/* Left */}
        <mesh position={[-9.5, 2.5, 0]} rotation={[0, Math.PI/2, 0]} receiveShadow><planeGeometry args={[20, 5]} /><meshStandardMaterial {...textures.wall} color="#111111" /></mesh>
        {/* Right */}
        <mesh position={[9.5, 2.5, 0]} rotation={[0, -Math.PI/2, 0]} receiveShadow><planeGeometry args={[20, 5]} /><meshStandardMaterial {...textures.wall} color="#111111" /></mesh>
        {/* Front (New) */}
        <mesh position={[0, 2.5, 9.5]} rotation={[0, Math.PI, 0]} receiveShadow><planeGeometry args={[20, 5]} /><meshStandardMaterial {...textures.wall} color="#111111" /></mesh>
      </group>

      <group position={[0, 0, 0]}>
        <RealisticTable />
        <group position={[0, 1.3, 0]}>
          <BirthdayCake currentAmount={event.totalPool} goalAmount={event.budgetGoal} />
        </group>
      </group>

      <UserGroup />
      <ContactShadows position={[0, 0.01, 0]} opacity={0.4} scale={15} blur={3} far={1} resolution={256} color="#1a0b05" />
    </group>
  )
}
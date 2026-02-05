'use client'
import { useTexture, Environment, ContactShadows, Text, Float } from '@react-three/drei'
import { useMemo } from 'react'
import * as THREE from 'three'
import BirthdayCake from './BirthdayCake'
import UserGroup from './UserGroup'

function Chandelier() {
  return (
    <group position={[0, 4.5, 0]}>
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 1]} />
        <meshStandardMaterial color="#ffd700" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial color="#ffd700" metalness={0.8} roughness={0.2} />
      </mesh>
      {[0, 1, 2, 3].map(i => (
        <group key={i} rotation={[0, (i * Math.PI) / 2, 0]}>
           <mesh position={[0.6, 0.1, 0]} rotation={[0, 0, -0.2]}>
             <cylinderGeometry args={[0.03, 0.03, 1.2]} />
             <meshStandardMaterial color="#ffd700" metalness={0.8} roughness={0.2} />
           </mesh>
           <mesh position={[1.1, 0.3, 0]}>
             <sphereGeometry args={[0.15, 16, 16]} />
             <meshStandardMaterial color="white" emissive="#ffddaa" emissiveIntensity={2} />
             <pointLight intensity={0.3} distance={5} color="#ffddaa" />
           </mesh>
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
            <mesh castShadow>
              <sphereGeometry args={[0.35, 16, 16]} />
              <meshStandardMaterial color={c} roughness={0.1} metalness={0.1} emissive={c} emissiveIntensity={0.1} />
            </mesh>
            <mesh position={[0, -0.8, 0]}>
              <cylinderGeometry args={[0.01, 0.01, 1.5]} />
              <meshBasicMaterial color="white" opacity={0.3} transparent />
            </mesh>
          </group>
        </Float>
      ))}
    </group>
  )
}

function LEDStringLights() {
  const curve = useMemo(() => new THREE.CatmullRomCurve3([
    new THREE.Vector3(-9.3, 4.6, 9.3),
    new THREE.Vector3(-9.3, 4.1, 0),
    new THREE.Vector3(-9.3, 4.6, -9.3),
    new THREE.Vector3(0, 4.1, -9.3),
    new THREE.Vector3(9.3, 4.6, -9.3),
    new THREE.Vector3(9.3, 4.1, 0),
    new THREE.Vector3(9.3, 4.6, 9.3),
    new THREE.Vector3(0, 4.1, 9.3),
  ], true, 'catmullrom', 0.1), [])

  const points = useMemo(() => curve.getPoints(100), [curve])
  const lineGeometry = useMemo(() => new THREE.BufferGeometry().setFromPoints(points), [points])
  const bulbs = useMemo(() => curve.getSpacedPoints(32), [curve])

  return (
    <group>
      <line geometry={lineGeometry}>
        <lineBasicMaterial color="#111111" />
      </line>
      {bulbs.map((p, i) => {
        const color = i % 2 === 0 ? "#ff0099" : "#00ffcc";
        return (
          <mesh key={i} position={p}>
            <sphereGeometry args={[0.09, 8, 8]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={8} toneMapped={false} />
          </mesh>
        );
      })}
      <pointLight position={[-8, 4, 8]} intensity={0.5} distance={15} color="#ff0099" />
      <pointLight position={[8, 4, -8]} intensity={0.5} distance={15} color="#00ffcc" />
      <pointLight position={[-8, 4, -8]} intensity={0.5} distance={15} color="#ff0099" />
      <pointLight position={[8, 4, 8]} intensity={0.5} distance={15} color="#00ffcc" />
    </group>
  )
}

function RealisticTable() {
  return (
    <group>
      <mesh position={[0, 1.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.5, 0.15, 2.5]} />
        <meshStandardMaterial color="#5d4037" roughness={0.6} />
      </mesh>
      <mesh position={[1.5, 0.6, 1]} castShadow><boxGeometry args={[0.2, 1.2, 0.2]} /><meshStandardMaterial color="#5d4037" /></mesh>
      <mesh position={[-1.5, 0.6, 1]} castShadow><boxGeometry args={[0.2, 1.2, 0.2]} /><meshStandardMaterial color="#5d4037" /></mesh>
      <mesh position={[1.5, 0.6, -1]} castShadow><boxGeometry args={[0.2, 1.2, 0.2]} /><meshStandardMaterial color="#5d4037" /></mesh>
      <mesh position={[-1.5, 0.6, -1]} castShadow><boxGeometry args={[0.2, 1.2, 0.2]} /><meshStandardMaterial color="#5d4037" /></mesh>
    </group>
  )
}

export default function DetailedBirthdayRoom({ event }) {
  if (!event) return null;
  
  // Use pre-calculated percentage from store, default to 0 if missing
  const percentage = event.percentage || 0;
  const categories = event.rawCategories || [];

  const floorTextures = useTexture({
    map: '/textures/floor/color.jpg',
    normalMap: '/textures/floor/normal.jpg',
    roughnessMap: '/textures/floor/roughness.jpg',
    aoMap: '/textures/floor/ao.jpg',
  })
  
  const wallTextures = useTexture({
    map: '/textures/wall/color.jpg',
    normalMap: '/textures/wall/normal.jpg',
    roughnessMap: '/textures/wall/roughness.jpg',
  })

  useMemo(() => {
    [floorTextures, wallTextures].forEach(texSet => { 
      Object.values(texSet).forEach(t => { t.wrapS = t.wrapT = THREE.RepeatWrapping }) 
    })
    floorTextures.map.repeat.set(4, 4); 
    wallTextures.map.repeat.set(3, 2);
  }, [floorTextures, wallTextures])

  return (
    <group>
      <Environment preset="sunset" />
      <ambientLight intensity={0.6} color="#ffccaa" />
      <spotLight position={[0, 8, 0]} angle={0.8} penumbra={0.5} intensity={2.5} castShadow color="#ffcc88" />
      <pointLight position={[0, 2, 8]} intensity={0.5} color="#ffd1a4" />

      <LEDStringLights />
      <Chandelier />
      
      <BalloonBundle position={[-8, 1, -8]} colors={['#ff6b6b', '#f06595', '#cc5de8']} />
      <BalloonBundle position={[8, 1, -8]} colors={['#339af0', '#22b8cf', '#20c997']} />
      <BalloonBundle position={[-8, 1, 8]} colors={['#ff922b', '#fcc419', '#ff6b6b']} />
      <BalloonBundle position={[8, 1, 8]} colors={['#51cf66', '#329af0', '#20c997']} />

      {/* --- INFO DISPLAY --- */}
      <group position={[0, 4.5, -9.4]}>
        <Text fontSize={1.2} color="#ffffff" anchorX="center" anchorY="middle" outlineWidth={0.05} outlineColor="#ff0099">
          GOAL: ${event.budgetGoal}
        </Text>
        <Text position={[0, -1, 0]} fontSize={0.8} color={percentage > 0 ? "#00ffcc" : "#888"} anchorX="center" anchorY="middle">
          RAISED: ${event.totalPool} ({percentage}%)
        </Text>
        
        {/* --- MINI EVENTS / CATEGORIES LIST --- */}
        <group position={[0, -2.5, 0]}>
          <Text position={[0, 0.5, 0]} fontSize={0.5} color="#ffdd00" anchorX="center">
            EXPENSE BREAKDOWN
          </Text>
          {categories.map((cat, i) => (
             <Text 
               key={cat.id || i} 
               position={[0, -0.6 * i, 0]} 
               fontSize={0.4} 
               color="#ffffff" 
               anchorX="center"
             >
               • {cat.name}: ${Number(cat.totalPooled).toFixed(2)} / ${Number(cat.spendingLimit).toFixed(2)}
             </Text>
          ))}
        </group>
      </group>

      <group>
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[20, 20]} />
          <meshStandardMaterial {...floorTextures} color="#ffe4d1" roughness={0.8}/>
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 5, 0]}>
          <planeGeometry args={[20, 20]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>

        <mesh position={[0, 2.5, -9.5]} receiveShadow>
          <planeGeometry args={[20, 5]} />
          <meshStandardMaterial {...wallTextures} color="#222222" />
        </mesh>
        <mesh position={[-9.5, 2.5, 0]} rotation={[0, Math.PI/2, 0]} receiveShadow>
          <planeGeometry args={[20, 5]} />
          <meshStandardMaterial {...wallTextures} color="#222222" />
        </mesh>
        <mesh position={[9.5, 2.5, 0]} rotation={[0, -Math.PI/2, 0]} receiveShadow>
          <planeGeometry args={[20, 5]} />
          <meshStandardMaterial {...wallTextures} color="#222222" />
        </mesh>
        <mesh position={[0, 2.5, 9.5]} rotation={[0, Math.PI, 0]} receiveShadow>
          <planeGeometry args={[20, 5]} />
          <meshStandardMaterial {...wallTextures} color="#222222" />
        </mesh>
      </group>

      <group position={[0, 0, 0]}>
        <RealisticTable />
        <group position={[0, 1.3, 0]}>
          <BirthdayCake currentAmount={event.totalPool} goalAmount={event.budgetGoal} />
        </group>
      </group>

      <UserGroup />
      <ContactShadows position={[0, 0.01, 0]} opacity={0.5} scale={20} blur={2.5} far={1.5} color="#442211" />
    </group>
  )
}
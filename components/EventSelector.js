'use client'
import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text, Float, MeshTransmissionMaterial } from '@react-three/drei'
import { useAppStore } from '../store/useAppStore'
import * as THREE from 'three'

function CreateOrb({ position }) {
  const mesh = useRef()

  const handleClick = (e) => {
    e.stopPropagation()
    window.dispatchEvent(new CustomEvent("USER_SELECT_EVENT", { 
      detail: { eventId: 'CREATE_NEW' } 
    }))
  }

  return (
    <group position={position} onClick={handleClick}
      onPointerOver={() => document.body.style.cursor = 'pointer'}
      onPointerOut={() => document.body.style.cursor = 'auto'}
    >
      <mesh visible={false}><sphereGeometry args={[1.5]} /><meshBasicMaterial transparent opacity={0}/></mesh>
      
      <mesh ref={mesh}>
        <sphereGeometry args={[0.6, 32, 32]} />
        <meshStandardMaterial color="white" emissive="white" emissiveIntensity={2} toneMapped={false} />
      </mesh>
      
      <Float speed={5} rotationIntensity={0} floatIntensity={0.5}>
        <Text position={[0, 0, 0]} fontSize={0.5} color="black" anchorX="center" anchorY="middle">
          +
        </Text>
      </Float>
      <Text position={[0, -1, 0]} fontSize={0.15} color="#aaa">NEW EVENT</Text>
    </group>
  )
}

function EventOrb({ event, position, delay }) {
  // ... (Keep existing EventOrb code exactly the same as before) ...
  // JUST RE-USE THE PREVIOUS CODE FOR THIS FUNCTION
  const mesh = useRef()
  const glassRef = useRef()
  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    mesh.current.position.y = position[1] + Math.sin(t + delay) * 0.2
  })
  const handleClick = (e) => {
    e.stopPropagation()
    window.dispatchEvent(new CustomEvent("USER_SELECT_EVENT", { detail: { eventId: event.id } }))
  }
  return (
    <group ref={mesh} position={position} onClick={handleClick} onPointerOver={() => document.body.style.cursor = 'pointer'} onPointerOut={() => document.body.style.cursor = 'auto'}>
      <mesh visible={false}><sphereGeometry args={[1.5]} /><meshBasicMaterial transparent opacity={0} /></mesh>
      <mesh ref={glassRef}>
        <sphereGeometry args={[0.8, 32, 32]} />
        <MeshTransmissionMaterial backside thickness={0.2} roughness={0} transmission={1} chromaticAberration={0.1} color="#ffaa00"/>
      </mesh>
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.2}>
        <Text position={[0, 1.2, 0]} fontSize={0.2} color="white" anchorX="center" anchorY="middle" outlineWidth={0.02} outlineColor="#000000">{event.title.toUpperCase()}</Text>
        <Text position={[0, 1.0, 0]} fontSize={0.15} color="#aaa" anchorX="center" anchorY="middle">${event.totalPool} / ${event.budgetGoal}</Text>
      </Float>
    </group>
  )
}

export default function EventSelector() {
  const { events, activeEvent } = useAppStore()

  const layout = useMemo(() => {
    if (!events) return []
    // Add the "Create" button as the first item in the ring
    const allItems = [...events, { id: 'create_button', type: 'create' }] 
    const radius = 6
    return allItems.map((ev, i) => {
      const angle = (i / allItems.length) * Math.PI * 2
      return {
        ...ev,
        pos: [Math.cos(angle) * radius, 0, Math.sin(angle) * radius],
        delay: i * 0.5
      }
    })
  }, [events])
  
  if (activeEvent) return null

  return (
    <group position={[0, 0, 0]}>
      {layout.map((ev) => (
        ev.type === 'create' 
          ? <CreateOrb key={ev.id} position={ev.pos} />
          : <EventOrb key={ev.id} event={ev} position={ev.pos} delay={ev.delay} />
      ))}
    </group>
  )
}
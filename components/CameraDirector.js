'use client'
import { useFrame, useThree } from '@react-three/fiber'
import { useAppStore, SPATIAL_STATES } from '../store/useAppStore'
import * as THREE from 'three'
import { useRef, useEffect } from 'react'

export default function CameraDirector() {
  const { state, stationIndex, activeEventIndex } = useAppStore()
  const { camera, controls } = useThree()
  
  // Track visual position for Museum Gallery
  const visualIndex = useRef(-1)
  
  const vec = new THREE.Vector3()
  const lookTarget = new THREE.Vector3()
  
  // ONE-TIME SETUP: When entering the room, place camera nicely
  useEffect(() => {
    if (state === SPATIAL_STATES.EVENT_ROOM) {
      // 1. Move Camera inside the room (High angle)
      camera.position.set(0, 5, 8)
      
      // 2. Point OrbitControls at the CENTER (The Cake)
      // This ensures you rotate around the users/cake, not the wall.
      if (controls) {
        controls.target.set(0, 1, 0)
        controls.update()
      }
    }
  }, [state, camera, controls])


  const getStationCoords = (index) => {
    if (index < 0) return { pos: new THREE.Vector3(0, 1.7, 15), look: new THREE.Vector3(0, 1.7, -50) }
    if (index < 0.1) return { pos: new THREE.Vector3(0, 1.7, 10), look: new THREE.Vector3(0, 1.7, -50) }
    const adjIndex = index - 1; 
    const zPos = adjIndex * -15 - 5; 
    return { pos: new THREE.Vector3(3, 1.7, zPos), look: new THREE.Vector3(7.8, 3.5, zPos) }
  }

  useFrame((threeState, delta) => {
    // ONLY Control camera automatically in the HALLWAY (Gallery Mode)
    // We DO NOT touch the camera in EVENT_ROOM so your mouse works.
    if (state === SPATIAL_STATES.MUSEUM_OVERVIEW || state === SPATIAL_STATES.INTRO) {
      visualIndex.current = THREE.MathUtils.damp(visualIndex.current, stationIndex, 2.5, delta)
      const currentCoords = getStationCoords(visualIndex.current)
      
      // Manual Blend Logic
      if (visualIndex.current < 0) {
         const start = getStationCoords(-1)
         const end = getStationCoords(0)
         const alpha = visualIndex.current + 1 
         vec.lerpVectors(start.pos, end.pos, alpha)
         lookTarget.lerpVectors(start.look, end.look, alpha)
      } else if (visualIndex.current < 1) {
         const start = getStationCoords(0)
         const end = getStationCoords(1)
         const alpha = visualIndex.current
         const smoothAlpha = alpha * alpha * (3 - 2 * alpha) 
         vec.lerpVectors(start.pos, end.pos, smoothAlpha)
         lookTarget.lerpVectors(start.look, end.look, smoothAlpha)
      } else {
         vec.copy(currentCoords.pos)
         lookTarget.copy(currentCoords.look)
      }

      camera.position.copy(vec)
      camera.lookAt(lookTarget)
    }

    // Static Zoom for Create/Select
    if (state === SPATIAL_STATES.EVENT_SELECTED || state === SPATIAL_STATES.CREATING_EVENT) {
      const targetZ = activeEventIndex * -15 - 5
      camera.position.lerp(vec.set(4, 4, targetZ), 0.08)
      camera.lookAt(8, 4, targetZ)
    }
  })

  return null
}
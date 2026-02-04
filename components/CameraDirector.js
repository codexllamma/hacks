'use client'

import { useFrame, useThree } from '@react-three/fiber'

import { useAppStore, SPATIAL_STATES } from '../store/useAppStore'

import * as THREE from 'three'

import { useRef, useEffect } from 'react'



export default function CameraDirector() {

const { state, stationIndex, activeEventIndex, events } = useAppStore()

const { camera, controls } = useThree()


// FIX: Restore visualIndex ref for gallery navigation

const visualIndex = useRef(-1)

const vec = new THREE.Vector3()

const lookTarget = new THREE.Vector3()


useEffect(() => {

if (state === SPATIAL_STATES.EVENT_ROOM) {

const activeEvent = events[activeEventIndex]

const isMovie = activeEvent?.theme === 'movie'



if (controls) {

if (isMovie) {

// --- THEATRE VIEW: Optimized for single row of 5 seats ---

camera.position.set(0, 1.5, 5);

controls.target.set(0, 3.3, 1);

controls.enableRotate = false;

controls.enableZoom = false;

} else {

// --- BIRTHDAY MODE: Keep freedom (No changes to Birthday) ---

camera.position.set(0, 4, 8);

controls.target.set(0, 1, 0);

controls.enableRotate = true;

controls.enableZoom = true;

// Apply standard birthday constraints

controls.minPolarAngle = Math.PI / 3;

controls.maxPolarAngle = Math.PI / 2.1;

}

controls.update()

}

}

}, [state, activeEventIndex, events, camera, controls])



// --- GALLERY NAVIGATION ---

const getStationCoords = (index) => {

if (index < 0) return { pos: new THREE.Vector3(0, 1.7, 15), look: new THREE.Vector3(0, 1.7, -50) }

if (index < 0.1) return { pos: new THREE.Vector3(0, 1.7, 10), look: new THREE.Vector3(0, 1.7, -50) }

const adjIndex = index - 1;

const zPos = adjIndex * -15 - 5;

return { pos: new THREE.Vector3(3, 1.7, zPos), look: new THREE.Vector3(7.8, 3.5, zPos) }

}



useFrame((threeState, delta) => {

// Gallery Navigation Logic

if (state === SPATIAL_STATES.MUSEUM_OVERVIEW || state === SPATIAL_STATES.INTRO) {

visualIndex.current = THREE.MathUtils.damp(visualIndex.current, stationIndex, 2.5, delta)

const currentCoords = getStationCoords(visualIndex.current)


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



if (state === SPATIAL_STATES.EVENT_SELECTED || state === SPATIAL_STATES.CREATING_EVENT) {

const targetZ = activeEventIndex * -15 - 5

camera.position.lerp(vec.set(4, 4, targetZ), 0.08)

camera.lookAt(8, 4, targetZ)

}

})



return null

}
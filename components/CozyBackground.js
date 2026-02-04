'use client'
import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const particleVertexShader = `
  uniform float uTime;
  uniform vec2 uMouse;
  uniform float uPixelRatio;
  
  attribute float aScale;
  attribute vec3 aColor;
  
  varying vec3 vColor;

  void main() {
    vec3 pos = position;
    
    // 1. WAVE MOVEMENT
    float time = uTime * 0.2;
    pos.y += sin(time + pos.x * 1.5) * 0.2;
    pos.x += cos(time + pos.y * 1.5) * 0.2;
    
    // 2. MOUSE INTERACTION
    vec3 mousePos = vec3(uMouse * 5.0, 0.0); // Map mouse roughly to world space
    float dist = distance(pos, mousePos);
    float force = smoothstep(3.0, 0.0, dist); // Repel radius
    
    vec3 dir = normalize(pos - mousePos);
    pos += dir * force * 0.8;

    vec4 viewPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * viewPosition;
    
    // 3. SIZE CALCULATION
    // Scale by pixel ratio and inversely by depth (closer = bigger)
    gl_PointSize = aScale * uPixelRatio * (20.0 / -viewPosition.z);
    
    vColor = aColor;
  }
`

const particleFragmentShader = `
  varying vec3 vColor;

  void main() {
    // Create a soft glow circle
    float dist = distance(gl_PointCoord, vec2(0.5));
    float strength = 0.05 / dist - 0.1; // Glow math
    
    // Standard circle clip
    if(dist > 0.5) discard;

    gl_FragColor = vec4(vColor, strength);
  }
`

function InteractiveParticles() {
  const points = useRef()
  
  // 1. GENERATE PARTICLES
  const count = 2500 // Increased count slightly
  
  const { positions, colors, scales } = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    const scales = new Float32Array(count)

    const color1 = new THREE.Color("#d97706") // Amber
    const color2 = new THREE.Color("#be123c") // Rose
    const color3 = new THREE.Color("#ffffff") // Sparkle white

    for (let i = 0; i < count; i++) {
      // Position: Spread widely
      positions[i * 3] = (Math.random() - 0.5) * 15
      positions[i * 3 + 1] = (Math.random() - 0.5) * 15
      positions[i * 3 + 2] = (Math.random() - 0.5) * 8
      
      // Color: Mix Amber/Rose + occasional white sparkle
      const isSparkle = Math.random() > 0.9
      const mixedColor = isSparkle ? color3 : color1.clone().lerp(color2, Math.random())
      
      colors[i * 3] = mixedColor.r
      colors[i * 3 + 1] = mixedColor.g
      colors[i * 3 + 2] = mixedColor.b

      // Scale: Random size variation
      scales[i] = Math.random() * 1.5 + 0.5
    }

    return { positions, colors, scales }
  }, [])

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uMouse: { value: new THREE.Vector2(0, 0) },
    uPixelRatio: { value: typeof window !== 'undefined' ? window.devicePixelRatio : 2 }
  }), [])

  useFrame((state) => {
    const { clock, pointer } = state
    uniforms.uTime.value = clock.getElapsedTime()
    // Smooth mouse movement
    uniforms.uMouse.value.lerp(new THREE.Vector2(pointer.x, pointer.y), 0.1)
  })

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={positions.length / 3} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-aColor" count={colors.length / 3} array={colors} itemSize={3} />
        <bufferAttribute attach="attributes-aScale" count={scales.length} array={scales} itemSize={1} />
      </bufferGeometry>
      <shaderMaterial
        transparent={true} // <--- CRITICAL FIX: Enables alpha blending
        depthWrite={false} // Prevents particles from occluding each other
        blending={THREE.AdditiveBlending} // Makes them glow
        vertexColors={true}
        vertexShader={particleVertexShader}
        fragmentShader={particleFragmentShader}
        uniforms={uniforms}
      />
    </points>
  )
}

export default function CozyBackground() {
  return (
    <div className="absolute inset-0 -z-10 bg-slate-950">
      <Canvas 
        camera={{ position: [0, 0, 8], fov: 60 }} 
        dpr={[1, 2]} 
        gl={{ antialias: false, alpha: false }} // alpha: false improves performance if bg is solid
      >
        <InteractiveParticles />
      </Canvas>
      
      {/* Texture Overlay */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay pointer-events-none"></div>
    </div>
  )
}
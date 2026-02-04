'use client'
import { useEffect, useState } from 'react'
import { useAppStore } from '../store/useAppStore'

export default function IntroDoors() {
  const finishIntro = useAppStore(s => s.finishIntro)
  const [isOpen, setIsOpen] = useState(false)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    // 1. Wait for page load / textures (Small delay for drama)
    const timer1 = setTimeout(() => {
      setIsOpen(true)
    }, 1000)

    // 2. Cleanup after animation completes (2.5s duration)
    const timer2 = setTimeout(() => {
      setIsVisible(false)
      finishIntro() // Unlock the app
    }, 3500)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
    }
  }, [finishIntro])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-[100] flex pointer-events-none">
      {/* LEFT DOOR */}
      <div 
        className={`h-full w-1/2 bg-[#1a100c] relative flex items-center justify-end border-r-4 border-[#3e2723] shadow-2xl transition-transform duration-[2500ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isOpen ? '-translate-x-full' : 'translate-x-0'
        }`}
      >
        {/* Door Handle / Detail */}
        <div className="w-4 h-32 bg-[#b8860b] mr-4 rounded-sm shadow-inner opacity-80" />
      </div>

      {/* RIGHT DOOR */}
      <div 
        className={`h-full w-1/2 bg-[#1a100c] relative flex items-center justify-start border-l-4 border-[#3e2723] shadow-2xl transition-transform duration-[2500ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isOpen ? 'translate-x-full' : 'translate-x-0'
        }`}
      >
        {/* Door Handle / Detail */}
        <div className="w-4 h-32 bg-[#b8860b] ml-4 rounded-sm shadow-inner opacity-80" />
      </div>

      {/* CENTER OVERLAY TEXT (Fades out) */}
      <div 
        className={`absolute inset-0 flex items-center justify-center transition-opacity duration-1000 ${
          isOpen ? 'opacity-0' : 'opacity-100'
        }`}
      >
        <h1 className="text-white font-serif text-3xl tracking-[0.5em] uppercase text-center drop-shadow-lg">
          The<br/>Collection
        </h1>
      </div>
    </div>
  )
}
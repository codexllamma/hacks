'use client'
import { useEffect, useState } from 'react'
import { useAppStore, SPATIAL_STATES } from '../store/useAppStore'

export default function GraffitiTransition() {
  const { state, events, activeEventIndex } = useAppStore()
  const [active, setActive] = useState(false)

  useEffect(() => {
    // Trigger only when entering a Birthday Room
    if (state === SPATIAL_STATES.EVENT_ROOM) {
      const evt = events[activeEventIndex]
      if (evt && evt.theme === 'birthday') {
        setActive(true)
        const t = setTimeout(() => setActive(false), 1500) // Duration of wipe
        return () => clearTimeout(t)
      }
    }
  }, [state, activeEventIndex, events])

  if (!active) return null

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none flex items-center justify-center overflow-hidden">
      {/* The Paint Splash Mask */}
      <div className="absolute inset-0 bg-[#ff0099] mix-blend-multiply animate-graffiti-wipe" 
           style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0% 100%)' }}>
      </div>
      
      <h1 className="relative z-10 text-9xl font-black text-white italic -rotate-12 animate-bounce drop-shadow-[0_10px_0_rgba(0,0,0,1)]">
        PARTY TIME!
      </h1>
      
      <style jsx>{`
        @keyframes graffiti-wipe {
          0% { clip-path: circle(0% at 50% 50%); }
          50% { clip-path: circle(150% at 50% 50%); }
          100% { opacity: 0; }
        }
        .animate-graffiti-wipe {
          animation: graffiti-wipe 1.2s cubic-bezier(0.25, 1, 0.5, 1) forwards;
        }
      `}</style>
    </div>
  )
}
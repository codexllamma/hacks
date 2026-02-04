'use client'
import { useEffect, useState } from 'react'
import { useAppStore, SPATIAL_STATES } from '../store/useAppStore'

export default function GraffitiTransition() {
  const { state, events, activeEventIndex } = useAppStore()
  const [active, setActive] = useState(false)
  const [hasPlayed, setHasPlayed] = useState(false) // FIX: Track if we've already played this session

  useEffect(() => {
    // 1. RESET: If we leave the room, reset the 'hasPlayed' flag so it can play next time
    if (state !== SPATIAL_STATES.EVENT_ROOM) {
      if (hasPlayed) setHasPlayed(false)
      if (active) setActive(false)
      return
    }

    // 2. TRIGGER: Only if in room AND hasn't played yet
    if (state === SPATIAL_STATES.EVENT_ROOM && !hasPlayed) {
      const evt = events[activeEventIndex]
      
      if (evt && evt.theme === 'birthday') {
        setActive(true)
        setHasPlayed(true) // Lock it so payments don't re-trigger it
        
        // FIX: Longer timeout (3s) to let the fade-out finish completely before unmount
        const t = setTimeout(() => setActive(false), 3000) 
        return () => clearTimeout(t)
      }
    }
  }, [state, activeEventIndex, events, hasPlayed, active])

  if (!active) return null

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none flex items-center justify-center">
      
      {/* LAYER 1: White Flash (Added opacity fade out) */}
      <div className="absolute inset-0 bg-white animate-wipe-layer-1" 
           style={{ clipPath: 'circle(0% at 50% 50%)' }} />

      {/* LAYER 2: Gradient Brand Color */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#ff0080] via-[#ff0099] to-[#7928ca] animate-wipe-layer-2"
           style={{ clipPath: 'circle(0% at 50% 50%)' }}>
        
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
          <div className="flex flex-col items-center">
            <h1 className="text-8xl md:text-9xl font-black text-white italic tracking-tighter opacity-0 animate-text-reveal drop-shadow-xl">
              PARTY
            </h1>
            <h1 className="text-8xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50 italic tracking-tighter opacity-0 animate-text-reveal-delayed drop-shadow-lg">
              TIME
            </h1>
          </div>
        </div>
      </div>

      <style jsx>{`
        /* --- ANIMATIONS --- */

        /* FIX: Added opacity: 0 at the end so the white layer dissolves */
        @keyframes wipe-in-1 {
          0% { clip-path: circle(0% at 50% 50%); opacity: 1; }
          40% { clip-path: circle(150% at 50% 50%); opacity: 1; }
          80% { clip-path: circle(150% at 50% 50%); opacity: 1; }
          100% { clip-path: circle(150% at 50% 50%); opacity: 0; }
        }

        /* Layer 2 Fade Out */
        @keyframes wipe-in-2 {
          0% { clip-path: circle(0% at 50% 50%); }
          40% { clip-path: circle(150% at 50% 50%); }
          75% { clip-path: circle(150% at 50% 50%); opacity: 1; }
          100% { clip-path: circle(150% at 50% 50%); opacity: 0; }
        }

        @keyframes text-blur-in {
          0% { 
            opacity: 0; 
            transform: scale(1.5) translateY(20px); 
            filter: blur(20px);
          }
          100% { 
            opacity: 1; 
            transform: scale(1) translateY(0); 
            filter: blur(0px);
          }
        }

        .animate-wipe-layer-1 {
          animation: wipe-in-1 2.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .animate-wipe-layer-2 {
          animation: wipe-in-2 2.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          animation-delay: 0.1s;
        }

        .animate-text-reveal {
          animation: text-blur-in 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards;
          animation-delay: 0.4s;
        }

        .animate-text-reveal-delayed {
          animation: text-blur-in 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards;
          animation-delay: 0.55s;
        }
      `}</style>
    </div>
  )
}
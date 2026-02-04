'use client'
import { useEffect, useState, useRef } from 'react'
import { useAppStore, SPATIAL_STATES } from '../store/useAppStore'

export default function CurtainTransition() {
  const { state, events, activeEventIndex } = useAppStore()
  const [active, setActive] = useState(false)
  
  // Track previous state to ensure we ONLY animate when ENTERING the room
  const prevStateRef = useRef(state)

  useEffect(() => {
    const isEnteringRoom = state === SPATIAL_STATES.EVENT_ROOM && prevStateRef.current !== SPATIAL_STATES.EVENT_ROOM
    
    if (isEnteringRoom) {
      const evt = events[activeEventIndex]
      if (evt && evt.theme === 'movie') {
        setActive(true)
        const t = setTimeout(() => setActive(false), 3000) 
        return () => clearTimeout(t)
      }
    }
    prevStateRef.current = state
  }, [state, activeEventIndex, events])

  if (!active) return null

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none flex overflow-hidden">
      
      {/* LEFT CURTAIN */}
      <div className="w-1/2 h-full bg-red-900 animate-curtain-left relative shadow-[10px_0_50px_rgba(0,0,0,0.5)] z-10">
         {/* Fabric Texture Effect using CSS gradients */}
         <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(0,0,0,0.4)_20%,transparent_40%,rgba(0,0,0,0.4)_60%,transparent_80%)] opacity-50"></div>
         {/* Gold Trim */}
         <div className="absolute right-2 top-0 bottom-0 w-1 bg-yellow-600/50 shadow-[0_0_10px_#ffd700]"></div>
      </div>

      {/* RIGHT CURTAIN */}
      <div className="w-1/2 h-full bg-red-900 animate-curtain-right relative shadow-[-10px_0_50px_rgba(0,0,0,0.5)] z-10">
         <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(0,0,0,0.4)_20%,transparent_40%,rgba(0,0,0,0.4)_60%,transparent_80%)] opacity-50"></div>
         {/* Gold Trim */}
         <div className="absolute left-2 top-0 bottom-0 w-1 bg-yellow-600/50 shadow-[0_0_10px_#ffd700]"></div>
      </div>

      <style jsx>{`
        @keyframes slide-open-left {
          0% { transform: translateX(0); }
          30% { transform: translateX(0); } /* Wait a beat */
          100% { transform: translateX(-100%); }
        }
        @keyframes slide-open-right {
          0% { transform: translateX(0); }
          30% { transform: translateX(0); }
          100% { transform: translateX(100%); }
        }
        .animate-curtain-left {
          animation: slide-open-left 2.5s cubic-bezier(0.65, 0, 0.35, 1) forwards;
        }
        .animate-curtain-right {
          animation: slide-open-right 2.5s cubic-bezier(0.65, 0, 0.35, 1) forwards;
        }
      `}</style>
    </div>
  )
}
'use client'
import { useEffect, useState, useRef } from 'react'
import { useAppStore, SPATIAL_STATES } from '../store/useAppStore'

export default function BriefcaseTransition() {
  const { state, events, activeEventIndex } = useAppStore()
  const [active, setActive] = useState(false)
  const [hasPlayed, setHasPlayed] = useState(false)
  const prevStateRef = useRef(state)

  useEffect(() => {
    // Reset if we leave the room
    if (state !== SPATIAL_STATES.EVENT_ROOM) {
      if (hasPlayed) setHasPlayed(false)
      if (active) setActive(false)
      prevStateRef.current = state
      return
    }

    // Trigger only when entering the room fresh
    const isEntering = state === SPATIAL_STATES.EVENT_ROOM && prevStateRef.current !== SPATIAL_STATES.EVENT_ROOM
    
    if (isEntering && !hasPlayed) {
      const evt = events[activeEventIndex]
      if (evt && evt.theme === 'trip') {
        setActive(true)
        setHasPlayed(true)
        const t = setTimeout(() => setActive(false), 3500) // Duration of animation
        return () => clearTimeout(t)
      }
    }
    prevStateRef.current = state
  }, [state, activeEventIndex, events, hasPlayed, active])

  if (!active) return null

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none flex flex-col items-center justify-center overflow-hidden">
      
      {/* TOP HALF OF BRIEFCASE */}
      <div className="absolute top-0 w-full h-1/2 bg-[#3e2723] z-20 flex items-end justify-center border-b-4 border-[#1a100c] shadow-2xl animate-briefcase-top">
        {/* Leather Texture Pattern */}
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/leather.png')]"></div>
        {/* Handle */}
        <div className="w-32 h-16 border-t-8 border-l-8 border-r-8 border-[#5d4037] rounded-t-2xl mb-[-4px] relative z-10"></div>
        {/* Lock Mechanism */}
        <div className="absolute bottom-0 w-16 h-8 bg-[#ffd700] rounded-t-md shadow-lg flex items-center justify-center">
            <div className="w-2 h-4 bg-black/20 rounded-full"></div>
        </div>
      </div>

      {/* BOTTOM HALF OF BRIEFCASE */}
      <div className="absolute bottom-0 w-full h-1/2 bg-[#3e2723] z-20 flex items-start justify-center border-t-4 border-[#1a100c] shadow-2xl animate-briefcase-bottom">
         <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/leather.png')]"></div>
         {/* Lock Mechanism Bottom */}
         <div className="w-16 h-8 bg-[#ffd700] rounded-b-md shadow-lg flex items-center justify-center">
            <div className="w-2 h-4 bg-black/20 rounded-full"></div>
         </div>
      </div>

      {/* STICKERS (Decoration) */}
      <div className="absolute top-[30%] left-[20%] w-24 h-24 bg-blue-500 rounded-full rotate-[-12deg] z-30 animate-sticker shadow-lg flex items-center justify-center border-4 border-white">
        <span className="text-white font-bold text-xs uppercase">Priority</span>
      </div>
      <div className="absolute bottom-[30%] right-[20%] w-28 h-16 bg-yellow-500 rounded-lg rotate-[5deg] z-30 animate-sticker shadow-lg flex items-center justify-center border-4 border-white">
         <span className="text-black font-bold text-xs uppercase">Fragile</span>
      </div>

      <style jsx>{`
        @keyframes slide-up {
          0% { transform: translateY(0); }
          20% { transform: translateY(10px); } /* Unlock shake */
          100% { transform: translateY(-110%); }
        }
        @keyframes slide-down {
          0% { transform: translateY(0); }
          20% { transform: translateY(-10px); } /* Unlock shake */
          100% { transform: translateY(110%); }
        }
        @keyframes sticker-fade {
          0% { opacity: 1; transform: scale(1) rotate(-12deg); }
          20% { transform: scale(1.1) rotate(-12deg); }
          100% { opacity: 0; transform: translateY(-200px) rotate(-40deg); }
        }

        .animate-briefcase-top {
          animation: slide-up 2s cubic-bezier(0.7, 0, 0.3, 1) forwards;
          animation-delay: 0.5s;
        }
        .animate-briefcase-bottom {
          animation: slide-down 2s cubic-bezier(0.7, 0, 0.3, 1) forwards;
          animation-delay: 0.5s;
        }
        .animate-sticker {
          animation: sticker-fade 1.5s ease-in forwards;
          animation-delay: 0.5s;
        }
      `}</style>
    </div>
  )
}
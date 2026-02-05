'use client'
import { useEffect, useRef } from 'react'
import { useAppStore, SPATIAL_STATES } from '../../store/useAppStore'
import CreateEventOverlay from '../../components/CreateEventOverlay'
import IntroDoors from '../../components/IntroDoors'
import GraffitiTransition from '../../components/GraffitiTransition'
import CurtainTransition from '../../components/CurtainTransition' 
import PaymentModal from '../../components/PaymentModal' 
import BriefcaseTransition from '../../components/BriefcaseTransition'
import ProjectInfo from '../../components/ProjectInfo'
import ActivityLog from '../../components/ActivityLog'

export default function CooperApp() {
  const { state, exitToGallery, nextStation, prevStation } = useAppStore()
  const isLocked = useRef(false)

  // SCROLL LOGIC
  useEffect(() => {
    const handleWheel = (e) => {
      if (state !== SPATIAL_STATES.MUSEUM_OVERVIEW) return
      if (isLocked.current) return

      if (Math.abs(e.deltaY) > 20) {
        e.deltaY > 0 ? nextStation() : prevStation()
        isLocked.current = true
        setTimeout(() => isLocked.current = false, 800)
      }
    }

    const handleKey = (e) => {
      if (state !== SPATIAL_STATES.MUSEUM_OVERVIEW || isLocked.current) return
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        nextStation()
        isLocked.current = true
        setTimeout(() => isLocked.current = false, 800)
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        prevStation()
        isLocked.current = true
        setTimeout(() => isLocked.current = false, 800)
      }
    }

    window.addEventListener('wheel', handleWheel, { passive: true }) 
    window.addEventListener('keydown', handleKey)
    return () => {
      window.removeEventListener('wheel', handleWheel)
      window.removeEventListener('keydown', handleKey)
    }
  }, [state, nextStation, prevStation])

  return (
    <>
      <IntroDoors />
      <GraffitiTransition />
      <CurtainTransition />
      <BriefcaseTransition /> 
      <PaymentModal />

      {/* --- HUD ELEMENTS --- */}
      
      {/* FIX: Only show Project Info in the Museum Gallery */}
      {state === SPATIAL_STATES.MUSEUM_OVERVIEW && <ProjectInfo />}
      
      {/* Activity Log handles its own visibility (Only shows in Event Room) */}
      <ActivityLog />

      {state === SPATIAL_STATES.CREATING_EVENT && <CreateEventOverlay />}

      <div className="fixed inset-0 pointer-events-none z-50 p-10">
        {state === SPATIAL_STATES.EVENT_ROOM && (
           <button 
             className="pointer-events-auto px-8 py-3 rounded-full bg-white/5 backdrop-blur-xl border border-white/20 text-white font-bold tracking-widest uppercase text-xs shadow-lg hover:bg-white/10 hover:scale-105 transition-all"
             onClick={exitToGallery}
           >
             Back to Gallery
           </button>
        )}
        
        <div className="absolute top-10 left-1/2 -translate-x-1/2 text-white font-serif italic text-xl drop-shadow-md transition-opacity duration-1000 mix-blend-difference">
          {state === SPATIAL_STATES.MUSEUM_OVERVIEW && "The Collection"}
          {state === SPATIAL_STATES.CREATING_EVENT && "New Commission"}
        </div>
      </div>
    </>
  )
}
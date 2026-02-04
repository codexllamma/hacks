'use client'
import { useEffect, useRef } from 'react'
import { useAppStore, SPATIAL_STATES } from '../../store/useAppStore'
import CreateEventOverlay from '../../components/CreateEventOverlay'
import IntroDoors from '../../components/IntroDoors'
import GraffitiTransition from '../../components/GraffitiTransition'
import PaymentModal from '../../components/PaymentModal' // NEW IMPORT

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
      <PaymentModal /> {/* Added Payment UI */}

      {state === SPATIAL_STATES.CREATING_EVENT && <CreateEventOverlay />}

      <div className="fixed inset-0 pointer-events-none z-50 p-10">
        {state === SPATIAL_STATES.EVENT_ROOM && (
          <button 
            className="pointer-events-auto bg-white px-4 py-2 shadow-lg rounded hover:bg-gray-50 transition-colors"
            onClick={exitToGallery}
          >
            Back to Gallery
          </button>
        )}
        
        <div className="absolute top-10 left-1/2 -translate-x-1/2 text-black font-serif italic text-xl drop-shadow-md transition-opacity duration-1000">
          {state === SPATIAL_STATES.MUSEUM_OVERVIEW && "The Collection"}
          {state === SPATIAL_STATES.CREATING_EVENT && "New Commission"}
        </div>
      </div>
    </>
  )
}
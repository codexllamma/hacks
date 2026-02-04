'use client';
import { useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useAppStore, SPATIAL_STATES } from '../store/useAppStore';
import MuseumScene from './MuseumScene';
import EventRoomScene from './EventRoomScene';
import CameraDirector from './CameraDirector';
import Stage from './Stage';
import ActivityLog from './ActivityLog'; // <--- IMPORT THIS

export default function Scene() {
  const { state, activeEventIndex, events, resetView } = useAppStore();

  // --- LISTEN FOR ESCAPE KEY ---
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        resetView();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [resetView]);

  const showGallery = 
    state === SPATIAL_STATES.INTRO || 
    state === SPATIAL_STATES.MUSEUM_OVERVIEW || 
    state === SPATIAL_STATES.CREATING_EVENT;

  const isInsideRoom = state === SPATIAL_STATES.EVENT_ROOM;

  return (
    <div className="w-full h-screen fixed top-0 left-0 -z-10 bg-[#d6d3ce]">
      
      {/* UI OVERLAY */}
      <ActivityLog /> 

      <Canvas 
        shadows="soft"
        camera={{ position: [0, 1.7, 15], fov: 50 }} 
        gl={{ antialias: true, powerPreference: "high-performance" }}
      >
        <CameraDirector />
        
        {isInsideRoom && (
          <OrbitControls 
            makeDefault 
            enableZoom={true} 
            enablePan={false}
            enableRotate={true}
            minDistance={3}
            maxDistance={8.5} 
            minPolarAngle={Math.PI / 3} 
            maxPolarAngle={Math.PI / 2.1} 
          />
        )}

        <Stage />

        {showGallery ? (
          <MuseumScene />
        ) : (
          <EventRoomScene event={events[activeEventIndex]} />
        )}
      </Canvas>
    </div>
  );
}
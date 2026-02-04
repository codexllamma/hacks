'use client'
import DetailedBirthdayRoom from './DetailedBirthdayRoom' 
import MovieTheatreRoom from './MovieTheatreRoom'
import TripLoungeRoom from './TripLoungeRoom' // Ensure this is imported
import BucketPool from './BucketPool'
import UserGroup from './UserGroup'

export default function EventRoomScene({ event }) {
  if (!event) return null;

  // 1. BIRTHDAY
  if (event.theme === 'birthday') {
    return <DetailedBirthdayRoom event={event} />
  }

  // 2. MOVIE
  if (event.theme === 'movie') {
    return <MovieTheatreRoom event={event} />
  }

  // 3. TRIP (Must explicit return to avoid fallback duplication)
  if (event.theme === 'trip') {
    return <TripLoungeRoom event={event} />
  }

  // 4. FALLBACK (Standard Room)
  return (
    <group>
      <mesh position={[0, 2.5, 0]}>
        <boxGeometry args={[15, 8, 15]} />
        <meshStandardMaterial color="#f8f9fa" side={2} roughness={1} /> 
      </mesh>
      <group position={[0, 0, 0]}>
         <BucketPool />
      </group>
      <UserGroup variant="circle" />
    </group>
  )
}
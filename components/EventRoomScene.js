'use client'
// Change this import!
import DetailedBirthdayRoom from './DetailedBirthdayRoom' 
import BucketPool from './BucketPool'
import UserGroup from './UserGroup'

export default function EventRoomScene({ event }) {
  if (!event) return null;

  // Render specific room based on theme
  if (event.theme === 'birthday') {
    // Use the new detailed room component
    return <DetailedBirthdayRoom event={event} />
  }

  // Fallback / Other Themes
  return (
    <group>
      <mesh position={[0, 2.5, 0]}>
        <boxGeometry args={[15, 8, 15]} />
        <meshStandardMaterial color="#f8f9fa" side={2} roughness={1} /> 
      </mesh>

      <group position={[0, 0, 0]}>
         <BucketPool />
      </group>

      <UserGroup />
    </group>
  )
}
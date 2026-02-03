import Scene from '@/components/Scene'; // Import the scene

export default function Home() {
  return (
    <main className="relative w-full h-screen">
      {/* 1. The 3D Background */}
      <div className="absolute inset-0 z-0">
        <Scene />
      </div>

      {/* 2. Content Overlay */}
      <div className="relative z-10 p-10 text-white pointer-events-none">
         <h1 className="text-4xl font-bold">Sponsor ki chatke brownie points lenge.</h1>
      </div>
    </main>
  );
}
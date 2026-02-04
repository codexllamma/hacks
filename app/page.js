import Scene from "../components/Scene.js";
import CooperApp from "./pages/main";

export default function Home() {
  return (
    // FIX: overflow-hidden kills the native scrollbar entirely
    <main className="relative w-full h-screen overflow-hidden bg-black">
      <div className="fixed inset-0 z-0">
        <Scene />
      </div>

      <div className="relative z-10 pointer-events-none">
        <CooperApp />
      </div>
    </main>
  );
}
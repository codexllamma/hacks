'use client'
import { useState } from 'react'
import { useAppStore, SPATIAL_STATES } from '../store/useAppStore'

export default function ActivityLog() {
  const { state } = useAppStore()
  const [isOpen, setIsOpen] = useState(false)

  // 1. VISIBILITY CHECK: Only show in Event Rooms
  if (state !== SPATIAL_STATES.EVENT_ROOM) return null

  // 2. MOCK DATA
  const logs = [
    { id: 1, user: "Alex", action: "paid", amount: 150, time: "2m ago", avatar: "A" },
    { id: 2, user: "Sam", action: "paid", amount: 50, time: "15m ago", avatar: "S" },
    { id: 3, user: "Jordan", action: "joined", amount: 0, time: "1h ago", avatar: "J" },
    { id: 4, user: "Casey", action: "paid", amount: 320, time: "2h ago", avatar: "C" },
  ]

  return (
    <div className="fixed top-6 right-6 z-50 flex flex-col items-end pointer-events-none">
      
      {/* --- LIQUID GLASS BUTTON --- */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`
          pointer-events-auto
          w-12 h-12 rounded-full flex items-center justify-center 
          bg-white/5 backdrop-blur-3xl border border-white/20 
          shadow-[0_8px_32px_0_rgba(31,38,135,0.37)]
          hover:bg-white/10 hover:shadow-[0_8px_32px_0_rgba(255,255,255,0.1)] hover:border-white/30
          transition-all duration-300 active:scale-95 group relative overflow-hidden
          ${isOpen ? 'bg-white/15 border-white/40 shadow-[0_0_20px_rgba(255,255,255,0.3)]' : ''}
        `}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-50 pointer-events-none" />

        <div className="flex flex-col gap-1 items-center justify-center relative z-10">
           <div className={`w-5 h-0.5 bg-white/90 rounded-full transition-all duration-300 ${isOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
           <div className={`w-5 h-0.5 bg-white/90 rounded-full transition-all duration-300 ${isOpen ? 'opacity-0' : ''}`} />
           <div className={`w-5 h-0.5 bg-white/90 rounded-full transition-all duration-300 ${isOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
        </div>
      </button>

      {/* --- VISION OS OVERLAY CARD --- */}
      <div 
        className={`
          pointer-events-auto
          absolute top-16 right-0 w-80 
          /* UPDATED TRANSPARENCY: Reduced opacity values */
          bg-gradient-to-b from-white/5 to-black/40
          backdrop-blur-xl
          border-t border-l border-r border-white/10 border-b-black/10
          
          /* SHAPE & SHADOW */
          rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] 
          overflow-hidden
          
          /* ANIMATION */
          origin-top-right transition-all duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)]
          ${isOpen ? 'opacity-100 scale-100 translate-y-0 translate-x-0' : 'opacity-0 scale-90 -translate-y-4 translate-x-4 pointer-events-none'}
        `}
      >
        {/* Glossy Reflection Gradient - Reduced Opacity */}
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />

        {/* Header - More Transparent */}
        <div className="relative px-5 py-4 border-b border-white/5 flex justify-between items-center bg-transparent">
          <span className="text-white/90 font-medium text-sm tracking-wide drop-shadow-md">Recent Activity</span>
          
          <div className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded-full border border-white/5 shadow-inner">
             <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse shadow-[0_0_8px_#4ade80]" />
             <span className="text-[10px] uppercase font-bold text-white/60 tracking-wider">Live</span>
          </div>
        </div>

        {/* Log List */}
        <div className="relative p-2 max-h-64 overflow-y-auto custom-scrollbar">
          {logs.map((log) => (
            <div key={log.id} className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-2xl transition-all duration-200 group border border-transparent hover:border-white/5">
              
              <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white font-bold text-sm shadow-inner group-hover:scale-105 transition-transform">
                {log.avatar}
              </div>

              <div className="flex-1">
                <p className="text-sm text-white/90 leading-tight drop-shadow-sm">
                  <span className="font-semibold text-blue-200 group-hover:text-blue-100 transition-colors">{log.user}</span> 
                  <span className="opacity-70 text-gray-300"> {log.action === 'paid' ? 'contributed' : log.action} </span>
                  {log.amount > 0 && <span className="text-green-300 font-bold ml-1 text-shadow-sm">${log.amount}</span>}
                </p>
                <p className="text-[11px] text-white/40 mt-0.5 font-medium tracking-wide">{log.time}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Glow - Subtler */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      </div>
    </div>
  )
}
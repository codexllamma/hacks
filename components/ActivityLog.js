'use client'
import { useState, useEffect } from 'react'
import { useAppStore, SPATIAL_STATES } from '../store/useAppStore'

export default function ActivityLog() {
  const { state, auditLogs, events, activeEventIndex, fetchAuditLogs } = useAppStore()
  const [isOpen, setIsOpen] = useState(false)

  const activeEvent = events?.[activeEventIndex]
  const isVisible = state === SPATIAL_STATES.EVENT_ROOM

  useEffect(() => {
    if (isVisible && activeEvent?.id) {
        fetchAuditLogs(activeEvent.id);
        const interval = setInterval(() => { fetchAuditLogs(activeEvent.id); }, 3000);
        return () => clearInterval(interval);
    }
  }, [isVisible, activeEvent?.id, fetchAuditLogs]); 

  if (!isVisible) return null

  return (
    <div className="fixed top-6 right-6 z-50 flex flex-col items-end pointer-events-none">
      <button onClick={() => setIsOpen(!isOpen)} className={`pointer-events-auto w-12 h-12 rounded-full flex items-center justify-center bg-white/5 backdrop-blur-3xl border border-white/20 shadow-lg hover:bg-white/10 hover:border-white/30 transition-all duration-300 active:scale-95 group relative overflow-hidden ${isOpen ? 'bg-white/15 border-white/40 shadow-2xl' : ''}`}>
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-50 pointer-events-none" />
        <div className="flex flex-col gap-1 items-center justify-center relative z-10">
           <div className={`w-5 h-0.5 bg-white/90 rounded-full transition-all duration-300 ${isOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
           <div className={`w-5 h-0.5 bg-white/90 rounded-full transition-all duration-300 ${isOpen ? 'opacity-0' : ''}`} />
           <div className={`w-5 h-0.5 bg-white/90 rounded-full transition-all duration-300 ${isOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
        </div>
      </button>

      <div className={`pointer-events-auto absolute top-16 right-0 w-80 bg-gradient-to-b from-white/5 to-black/40 backdrop-blur-xl border-t border-l border-r border-white/10 border-b-black/10 rounded-3xl shadow-xl overflow-hidden origin-top-right transition-all duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${isOpen ? 'opacity-100 scale-100 translate-y-0 translate-x-0' : 'opacity-0 scale-90 -translate-y-4 translate-x-4 pointer-events-none'}`}>
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
        <div className="relative px-5 py-4 border-b border-white/5 flex justify-between items-center bg-transparent">
          <span className="text-white/90 font-medium text-sm tracking-wide drop-shadow-md">Recent Activity</span>
          <div className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded-full border border-white/5 shadow-inner">
             <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse shadow-[0_0_8px_#4ade80]" />
             <span className="text-[10px] uppercase font-bold text-white/60 tracking-wider">Live</span>
          </div>
        </div>

        <div className="relative p-2 max-h-64 overflow-y-auto custom-scrollbar">
          {auditLogs.length === 0 ? (
             <div className="p-4 text-center text-white/40 text-xs italic">No transactions yet</div>
          ) : (
             auditLogs.map((log) => {
                const amount = Number(log.amount);
                const isNegative = amount < 0;
                const absAmount = Math.abs(amount);
                
                // Identify Vendor based on name (Case Insensitive)
                const userName = log.user?.name || "User";
                const isVendor = userName.toLowerCase() == 'external vendor';

                // Determine Text and Color
                let actionText = "paid";
                let amountColor = "text-blue-300"; // Default Positive = Blue

                if (isNegative) {
                    if (isVendor) {
                        actionText = "paid to vendor";
                        amountColor = "text-red-400"; // Vendor Expense = Red
                    } else {
                        actionText = "got refunded";
                        amountColor = "text-green-300"; // User Refund = Green
                    }
                }

                return (
                  <div key={log.id} className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-2xl transition-all duration-200 group border border-transparent hover:border-white/5">
                    <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white font-bold text-sm shadow-inner group-hover:scale-105 transition-transform">
                      {log.user?.name?.charAt(0) || "U"}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-white/90 leading-tight drop-shadow-sm">
                        <span className="font-semibold text-blue-200 group-hover:text-blue-100 transition-colors">{userName}</span> 
                        
                        <span className="opacity-70 text-gray-300"> {actionText} </span>
                        
                        <span className={`${amountColor} font-bold ml-1 text-shadow-sm`}>
                          ${absAmount.toFixed(2)}
                        </span>
                        
                        <span className="opacity-60 text-xs ml-1 text-gray-400 block">for {log.ExpenseCategory?.name || "General Pool"}</span>
                      </p>
                      <p className="text-[11px] text-white/40 mt-0.5 font-medium tracking-wide">
                          {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                )
             })
          )}
        </div>
        <div className="h-px w-full bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      </div>
    </div>
  )
}
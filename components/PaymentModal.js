'use client'
import { useState, useEffect } from 'react'
import { useAppStore } from '../store/useAppStore'

export default function PaymentModal() {
  const { paymentTargetUserId, events, activeEventIndex, contribute, setPaymentTarget } = useAppStore()
  
  // 1. Hooks (Always run at the top)
  const [amount, setAmount] = useState(0)

  // Safe data extraction
  const event = events[activeEventIndex]
  const user = event?.participants?.find(u => u.id === paymentTargetUserId)
  
  // Recommendation Logic: Goal / Count (Avoid division by zero)
  const totalUsers = event?.participants?.length || 1
  const recommended = event ? Math.ceil(event.budgetGoal / totalUsers) : 0

  // 2. Effect: Reset slider to 'Recommended' when modal opens
  useEffect(() => {
    if (paymentTargetUserId) {
      setAmount(recommended)
    }
  }, [paymentTargetUserId, recommended])

  // 3. Smart Color Logic
  const isGenerous = amount >= recommended
  const themeColor = isGenerous ? 'green' : 'red'
  
  // Dynamic classes based on amount
  const trackBg = isGenerous ? 'bg-green-100' : 'bg-red-100'
  const accentColor = isGenerous ? '#10b981' : '#ef4444' // Hex for green-500 / red-500
  const textColor = isGenerous ? 'text-green-600' : 'text-red-500'
  const btnColor = isGenerous ? 'bg-green-500' : 'bg-red-500'

  // 4. Early return if closed
  if (!paymentTargetUserId || !user) return null;

  return (
    // FIX: 'pointer-events-auto' restores clickability
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm pointer-events-auto">
      
      <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full border border-gray-100 animate-in zoom-in duration-200">
        
        {/* HEADER */}
        <div className="text-center mb-6">
          <h3 className="text-2xl font-black italic text-gray-900">CONTRIBUTE</h3>
          <p className="text-sm text-gray-500">for {user.name}</p>
        </div>

        {/* STATS ROW */}
        <div className="flex justify-between text-xs font-bold uppercase text-gray-400 mb-2 px-1">
          <span>Goal: ${event.budgetGoal}</span>
          <span>Recommended: ${recommended}</span>
        </div>

        {/* SLIDER SECTION */}
        <div className="mb-8 relative">
          <input 
            type="range" 
            min="0" 
            max={event.budgetGoal} 
            value={amount} 
            onChange={(e) => setAmount(Number(e.target.value))}
            className={`w-full h-4 rounded-lg appearance-none cursor-pointer transition-colors duration-300 ${trackBg}`}
            style={{ accentColor: accentColor }}
          />
          
          {/* Amount Display */}
          <div className={`mt-4 text-center text-4xl font-mono font-bold transition-colors duration-300 ${textColor}`}>
            ${amount}
          </div>
          
          {/* Feedback Text */}
          <p className={`text-center text-[10px] font-black uppercase tracking-widest mt-2 transition-colors duration-300 ${isGenerous ? 'text-green-400' : 'text-red-300'}`}>
            {isGenerous ? "✨ Fair Share Met ✨" : "Below Recommendation"}
          </p>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex gap-3">
          <button 
            onClick={() => setPaymentTarget(null)}
            className="flex-1 py-4 text-gray-500 font-bold hover:bg-gray-50 rounded-xl transition-colors"
          >
            CANCEL
          </button>
          <button 
            onClick={() => contribute(event.id, user.id, amount)}
            className={`flex-1 py-4 text-white font-bold rounded-xl shadow-lg hover:scale-105 transition-transform ${btnColor}`}
          >
            PAY NOW
          </button>
        </div>

      </div>
    </div>
  )
}
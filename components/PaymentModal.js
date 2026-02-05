'use client'
import { useState, useEffect, useMemo } from 'react'
import { useAppStore } from '../store/useAppStore'

export default function PaymentModal() {
  const { paymentTargetUserId, events, activeEventIndex, contribute, setPaymentTarget, auditLogs } = useAppStore() // Added auditLogs
  
  const [selectedCategories, setSelectedCategories] = useState({})
  const [isPaying, setIsPaying] = useState(false)

  const event = events[activeEventIndex]
  const user = event?.participants?.find(u => u.id === paymentTargetUserId)
  const categories = event?.rawCategories || []

  // --- 1. IDENTIFY PAID CATEGORIES ---
  // Check audit logs to see if this user has already contributed to specific categories
  const paidCategories = useMemo(() => {
    const paid = new Set();
    if (auditLogs && Array.isArray(auditLogs)) {
        auditLogs.forEach(log => {
            // Check if log belongs to this user, is a payment (not refund), and has a category
            if (log.userId === paymentTargetUserId && Number(log.amount) > 0 && log.categoryId) {
                paid.add(log.categoryId);
            }
        });
    }
    return paid;
  }, [auditLogs, paymentTargetUserId]);

  // --- 2. INTELLIGENT SELECTION (Strict Opt-In & Unpaid) ---
  useEffect(() => {
    if (paymentTargetUserId && categories.length > 0) {
      const initialSelection = {}
      categories.forEach(cat => {
        // If already paid, DO NOT select
        if (paidCategories.has(cat.id)) return;

        // If category has specific members, only select if user is one of them
        if (cat.members && cat.members.length > 0) {
             const isMember = cat.members.some(m => m.userId === paymentTargetUserId);
             if (isMember) initialSelection[cat.id] = true;
        } else {
             // Global Pool (no specific members) -> Everyone pays
             initialSelection[cat.id] = true;
        }
      })
      setSelectedCategories(initialSelection)
    }
  }, [paymentTargetUserId, categories, paidCategories]) 

  // --- 3. CALCULATE STRICT TOTAL DUE ---
  const totalDue = useMemo(() => {
    if (!event) return 0;
    
    let total = 0;
    categories.forEach(cat => {
        if (selectedCategories[cat.id]) {
            const memberCount = (cat.members && cat.members.length > 0) 
                ? cat.members.length 
                : (event.participants?.length || 1);

            total += (cat.spendingLimit / memberCount);
        }
    });
    return total;
  }, [selectedCategories, event, categories]);

  const handlePay = async () => {
    if (totalDue <= 0) return;
    setIsPaying(true);

    const promises = Object.keys(selectedCategories).map(catId => {
        if (selectedCategories[catId]) {
            const cat = categories.find(c => c.id === catId);
            
            const memberCount = (cat.members && cat.members.length > 0) 
                ? cat.members.length 
                : (event.participants?.length || 1);

            const exactShare = cat.spendingLimit / memberCount;

            if (exactShare > 0 && isFinite(exactShare)) {
                 return contribute(event.id, user.id, catId, exactShare);
            }
        }
    });

    await Promise.all(promises);
    setIsPaying(false);
  }

  if (!paymentTargetUserId || !user) return null;

  // Check if everything possible is paid to show a "All Settled" state
  const isFullySettled = totalDue === 0 && Object.keys(selectedCategories).length === 0;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm pointer-events-auto">
      
      <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-md w-full border border-gray-100 animate-in zoom-in duration-200">
        
        <div className="text-center mb-6">
          <h3 className="text-2xl font-black italic text-gray-900">SETTLE UP</h3>
          <p className="text-sm text-gray-500">for {user.name}</p>
        </div>

        {/* CATEGORY SELECTION */}
        <div className="mb-8 space-y-2">
            <div className="flex justify-between items-end mb-2">
                <p className="text-[10px] font-black uppercase text-gray-400">Your Splits</p>
                <p className="text-[10px] font-bold text-gray-300">Auto-Calculated</p>
            </div>
            
            <div className="max-h-40 overflow-y-auto pr-2 custom-scrollbar space-y-2">
                {categories.map(cat => {
                    // Membership Check
                    const isMember = cat.members && cat.members.length > 0
                        ? cat.members.some(m => m.userId === paymentTargetUserId)
                        : true; 
                    
                    // Paid Check
                    const isPaid = paidCategories.has(cat.id);
                    const isDisabled = !isMember || isPaid;

                    const memberCount = (cat.members && cat.members.length > 0) ? cat.members.length : (event.participants?.length || 1);
                    const share = (parseFloat(cat.spendingLimit) || 0) / memberCount;

                    return (
                        <label 
                            key={cat.id} 
                            className={`
                                flex items-center justify-between p-3 rounded-xl transition-all border
                                ${isDisabled ? 'bg-gray-50 border-transparent opacity-60 cursor-not-allowed' : 'cursor-pointer hover:border-gray-200'}
                                ${selectedCategories[cat.id] ? 'bg-blue-50 border-blue-200' : 'bg-white border-transparent'}
                            `}
                        >
                            <div className="flex flex-col">
                                <span className={`text-xs font-bold ${isDisabled ? 'text-gray-400' : 'text-gray-800'}`}>
                                    {cat.name}
                                </span>
                                {/* STATUS BADGES */}
                                {!isMember && <span className="text-[9px] text-red-400 font-bold uppercase">Not Opted In</span>}
                                {isPaid && <span className="text-[9px] text-green-500 font-black uppercase tracking-wider">✔ Paid</span>}
                            </div>
                            
                            <div className="flex items-center gap-3">
                                <span className={`text-xs font-mono font-bold ${isPaid ? 'text-green-500 line-through' : 'text-gray-500'}`}>
                                    ${share.toFixed(2)}
                                </span>
                                <input 
                                    type="checkbox"
                                    className="w-4 h-4 accent-black rounded disabled:opacity-0"
                                    checked={!!selectedCategories[cat.id]}
                                    disabled={isDisabled}
                                    onChange={(e) => setSelectedCategories(prev => ({...prev, [cat.id]: e.target.checked}))}
                                />
                            </div>
                        </label>
                    )
                })}
            </div>
        </div>

        {/* TOTAL DISPLAY */}
        <div className="mb-8 text-center bg-gray-50 rounded-2xl p-6 border border-gray-100">
          {isFullySettled ? (
             <div className="flex flex-col items-center gap-2">
                <span className="text-3xl">🎉</span>
                <p className="text-lg font-bold text-gray-400">All Settled Up!</p>
             </div>
          ) : (
             <>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Total Due</p>
                <div className="text-5xl font-black text-gray-900 tracking-tighter">
                    ${totalDue.toFixed(2)}
                </div>
             </>
          )}
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex gap-3">
          <button 
            onClick={() => setPaymentTarget(null)}
            className="flex-1 py-4 text-gray-500 font-bold hover:bg-gray-50 rounded-xl transition-colors text-xs uppercase tracking-wider"
          >
            Close
          </button>
          <button 
            onClick={handlePay}
            disabled={isPaying || totalDue <= 0}
            className={`
                flex-1 py-4 font-black rounded-xl shadow-xl hover:scale-105 transition-all 
                text-xs uppercase tracking-wider
                ${totalDue <= 0 ? 'bg-gray-200 text-gray-400 shadow-none' : 'bg-black text-white'}
                disabled:opacity-50 disabled:scale-100 disabled:shadow-none
            `}
          >
            {isPaying ? "Processing..." : totalDue <= 0 ? "Nothing Due" : `Pay $${Math.ceil(totalDue)}`}
          </button>
        </div>

      </div>
    </div>
  )
}
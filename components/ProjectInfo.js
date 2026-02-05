'use client'
import { useState, useRef } from 'react'
import { motion, AnimatePresence, useMotionTemplate, useMotionValue } from 'framer-motion'

export default function ProjectInfo() {
  const [isOpen, setIsOpen] = useState(false)
  
  // --- MOUSE TRACKING FOR SPOTLIGHT EFFECT ---
  const cardRef = useRef(null)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  function handleMouseMove({ currentTarget, clientX, clientY }) {
    const { left, top } = currentTarget.getBoundingClientRect()
    mouseX.set(clientX - left)
    mouseY.set(clientY - top)
  }

  // White spotlight for the "shine" effect
  const spotlight = useMotionTemplate`
    radial-gradient(
      650px circle at ${mouseX}px ${mouseY}px,
      rgba(255, 255, 255, 0.1),
      transparent 80%
    )
  `

  // DATA
  const tableData = [
    { req: "1. Create groups or events", sol: "Automated via AI Concierge" },
    { req: "2. Add/remove participants", sol: "Dynamic User Management System" },
    { req: "3. Deposit funds into shared pool", sol: "The Shared Basket (Escrow Model)" },
    { req: "4. Set payment conditions", sol: "The Pipeline (Strict Opt-In Logic)" },
    { req: "5. Join/leave expense categories", sol: "Toggle-based Payment Modal" },
    { req: "6. Automatic real-time settlement", sol: "OCR Scan & Auto-Refund" },
    { req: "7. Real-Time Visibility", sol: "Glass HUD Overlay" }
  ]

  return (
    <>
      {/* --- 1. TRIGGER BUTTON (Fixed Top-Left) --- */}
      <div className="fixed top-6 left-6 z-50 pointer-events-auto">
        <motion.button 
          onClick={() => setIsOpen(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`
            w-12 h-12 rounded-full flex items-center justify-center 
            bg-white/10 backdrop-blur-md border border-white/30 
            shadow-[0_8px_32px_0_rgba(31,38,135,0.2)]
            hover:bg-white/20 hover:border-white/50
            transition-colors duration-300 group relative overflow-hidden
          `}
        >
          {/* Button Shine */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent opacity-50 pointer-events-none" />
          <span className="relative z-10 font-serif italic text-xl font-bold text-white group-hover:scale-110 transition-transform">
            i
          </span>
        </motion.button>
      </div>

      {/* --- 2. ANIMATED MODAL --- */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            
            {/* Backdrop - NO BLUR, just dimming */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 bg-black/30" 
              onClick={() => setIsOpen(false)}
            />

            {/* The Reactive Frosted Glass Card */}
            <motion.div 
              ref={cardRef}
              onMouseMove={handleMouseMove}
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.4, ease: "easeOut" }} 
              className="relative w-full max-w-5xl rounded-3xl border border-white/20 overflow-hidden shadow-2xl group pointer-events-auto"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.05)', // Kept the crystal clear glass
                backdropFilter: 'blur(20px)',                  
                boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
              }}
            >
              {/* SPOTLIGHT LAYER */}
              <motion.div
                className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition duration-300 group-hover:opacity-100"
                style={{ background: spotlight }}
              />

              {/* Glossy Reflection (Top) */}
              <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />

              {/* Header */}
              <div className="relative px-8 py-6 border-b border-white/10 flex justify-between items-center">
                {/* Made Header Bolder */}
                <h2 className="text-3xl font-serif font-bold text-white tracking-wide drop-shadow-lg">
                  Meeting the Challenge Requirements
                </h2>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors z-20 font-bold"
                >
                  ✕
                </button>
              </div>

              {/* Table Content */}
              <div className="relative p-8 overflow-x-auto z-10">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/20">
                      {/* Increased font size and weight for headers */}
                      <th className="pb-5 pl-4 text-lg font-black text-green-400 uppercase tracking-wider w-1/2 drop-shadow-md">
                        Requirement
                      </th>
                      <th className="pb-5 pl-4 text-lg font-black text-blue-300 uppercase tracking-wider w-1/2 drop-shadow-md">
                        Cooper Solution
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {tableData.map((row, index) => (
                      <motion.tr 
                        key={index} 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 + 0.2 }}
                        className="group/row hover:bg-white/10 transition-colors duration-200 cursor-default"
                      >
                        {/* Requirement Column */}
                        <td className="py-5 pl-4 align-top">
                          <div className="flex items-start gap-4">
                            <div className="mt-1 flex-shrink-0 w-6 h-6 rounded-full bg-green-500/20 border border-green-400/50 flex items-center justify-center shadow-[0_0_15px_rgba(74,222,128,0.4)]">
                              <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                            {/* Made Text Larger, Bolder, and Solid White */}
                            <span className="text-white text-lg font-bold leading-snug drop-shadow-md group-hover/row:text-white transition-colors">
                              {row.req}
                            </span>
                          </div>
                        </td>

                        {/* Solution Column */}
                        <td className="py-5 pl-4 align-top">
                          <div className="flex items-start gap-4">
                             <div className="mt-2 w-2 h-2 bg-blue-400 rounded-full shadow-[0_0_10px_#60a5fa] group-hover/row:scale-125 transition-transform" />
                             {/* Made Text Larger, Bolder, and Solid Blue-White */}
                             <span className="text-blue-50 text-lg font-bold leading-snug drop-shadow-md group-hover/row:text-white transition-colors">
                               {row.sol}
                             </span>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Bottom Edge Glow */}
              <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
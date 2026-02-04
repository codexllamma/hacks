'use client'
import { useState } from 'react'
import { useAppStore } from '../store/useAppStore'

export default function CreateEventOverlay() {
  const { addEvent, exitToGallery } = useAppStore()
  const [formData, setFormData] = useState({
    title: '',
    theme: 'birthday',
    budgetGoal: 1000
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.title) return
    addEvent(formData)
  }

  return (
    // FIX: Added 'pointer-events-auto' so the form allows clicking/typing
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm pointer-events-auto">
      <div className="bg-white/90 p-8 rounded-xl shadow-2xl max-w-md w-full border border-white/50 backdrop-blur-md animate-in fade-in zoom-in duration-300">
        
        <h2 className="text-2xl font-serif italic mb-6 text-center text-gray-800">New Collection</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 1. NAME */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Event Name</label>
            <input 
              type="text" 
              placeholder="e.g. Goa Trip 2026"
              className="w-full bg-gray-50 border-b-2 border-gray-200 p-2 text-black focus:outline-none focus:border-black transition-colors"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              autoFocus
            />
          </div>

          {/* 2. THEME SELECTOR */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Theme</label>
            <div className="grid grid-cols-2 gap-3">
              {['birthday', 'dineout', 'movie', 'trip'].map((theme) => (
                <button
                  key={theme}
                  type="button"
                  onClick={() => setFormData({...formData, theme})}
                  className={`py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                    formData.theme === theme 
                      ? 'bg-black text-white shadow-lg scale-105' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {theme.charAt(0).toUpperCase() + theme.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* 3. BUDGET GOAL */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Budget Goal</label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-400">$</span>
              <input 
                type="number" 
                className="w-full bg-gray-50 border-b-2 border-gray-200 p-2 pl-8 text-black focus:outline-none focus:border-black transition-colors"
                value={formData.budgetGoal}
                onChange={(e) => setFormData({...formData, budgetGoal: parseInt(e.target.value) || 0})}
              />
            </div>
          </div>

          {/* ACTIONS */}
          <div className="flex gap-4 pt-4">
            <button 
              type="button" 
              onClick={exitToGallery}
              className="flex-1 py-3 text-gray-500 hover:text-black transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="flex-1 py-3 bg-black text-white rounded-lg font-bold hover:bg-gray-800 transition-transform hover:scale-105 shadow-xl"
            >
              Create Event
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}
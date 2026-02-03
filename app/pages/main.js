"use client";
import { useState, useEffect } from 'react';

const MOCK_USERS = [
  { id: 'u1', name: 'Alice' }, { id: 'u2', name: 'Bob' },
  { id: 'u3', name: 'Charlie' }, { id: 'u4', name: 'David' },
  { id: 'u5', name: 'Eve' }, { id: 'u6', name: 'Frank' },
  { id: 'u7', name: 'Grace' }, { id: 'u8', name: 'Heidi' },
];

export default function CooperApp() {
  const [events, setEvents] = useState([]);
  const [activeEventId, setActiveEventId] = useState(null);
  const [newEventName, setNewEventName] = useState("");
  const [newBudget, setNewBudget] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  
  // Local state for custom deposit amounts in the UI
  const [depositAmounts, setDepositAmounts] = useState({});

  useEffect(() => {
    const saved = localStorage.getItem('cooper_events');
    if (saved) setEvents(JSON.parse(saved));
  }, []);

  const saveAndSync = (updated) => {
    setEvents(updated);
    localStorage.setItem('cooper_events', JSON.stringify(updated));
  };

  const deleteEvent = (id) => {
    if (confirm("Permanently delete this basket?")) {
      saveAndSync(events.filter(ev => ev.id !== id));
      setActiveEventId(null);
    }
  };

  const handleDeposit = (eventId, userId) => {
    const amount = parseFloat(depositAmounts[userId]) || 0;
    if (amount <= 0) return;

    const updated = events.map(ev => {
      if (ev.id === eventId) {
        // Double check goal isn't hit
        if (ev.totalPool >= ev.budgetGoal) return ev;

        const updatedParticipants = ev.participants.map(p => 
          p.id === userId ? { ...p, deposit: p.deposit + amount } : p
        );
        return { ...ev, participants: updatedParticipants, totalPool: ev.totalPool + amount };
      }
      return ev;
    });

    saveAndSync(updated);
    setDepositAmounts(prev => ({ ...prev, [userId]: "" })); // Clear input
  };

  const createEvent = (e) => {
    e.preventDefault();
    if (!newEventName || selectedUsers.length === 0) return alert("Details missing!");

    const newEvent = {
      id: Date.now().toString(),
      title: newEventName,
      budgetGoal: parseFloat(newBudget) || 0,
      createdAt: new Date().toISOString(),
      totalPool: 0,
      participants: MOCK_USERS.filter(u => selectedUsers.includes(u.id)).map(u => ({
        ...u, deposit: 0, spent: 0
      })),
    };

    saveAndSync([...events, newEvent]);
    setNewEventName(""); setNewBudget(""); setSelectedUsers([]);
  };

  const activeEvent = events.find(e => e.id === activeEventId);

  // --- VIEW: EVENT DETAIL ---
  if (activeEvent) {
    const isGoalMet = activeEvent.totalPool >= activeEvent.budgetGoal;
    const progress = activeEvent.budgetGoal > 0 
      ? Math.min((activeEvent.totalPool / activeEvent.budgetGoal) * 100, 100) 
      : 0;

    return (
      <div className="p-8 max-w-5xl mx-auto font-sans text-black animate-in fade-in duration-500">
        <div className="flex justify-between items-center mb-6">
          <button onClick={() => setActiveEventId(null)} className="text-indigo-600 font-bold hover:underline">← Dashboard</button>
          <button onClick={() => deleteEvent(activeEvent.id)} className="bg-red-50 text-red-600 px-4 py-2 rounded-lg font-bold hover:bg-red-500 hover:text-white transition-all">Nuke Basket</button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <header className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
              <h1 className="text-5xl font-black italic uppercase tracking-tighter mb-4">{activeEvent.title}</h1>
              <div className="flex items-center gap-4">
                <div className="flex-grow bg-gray-100 h-6 rounded-full overflow-hidden p-1 border">
                  <div className={`h-full rounded-full transition-all duration-700 ${isGoalMet ? 'bg-green-500' : 'bg-red-500'}`} style={{ width: `${progress}%` }}></div>
                </div>
                <span className={`font-black ${isGoalMet ? 'text-green-600' : 'text-red-600'}`}>{Math.round(progress)}%</span>
              </div>
            </header>

            <section className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <h2 className="text-xl font-bold mb-6">Participants</h2>
              <div className="space-y-4">
                {activeEvent.participants.map(p => (
                  <div key={p.id} className="p-4 bg-gray-50 rounded-2xl flex items-center justify-between border border-transparent hover:border-indigo-100 transition-all">
                    <div>
                      <p className="font-bold text-gray-800">{p.name}</p>
                      <p className="text-xs font-mono text-gray-400 uppercase tracking-widest">In Vault: <span className="text-indigo-600 font-bold">${p.deposit}</span></p>
                    </div>
                    
                    {!isGoalMet ? (
                      <div className="flex gap-2">
                        <input 
                          type="number" 
                          placeholder="Amount"
                          className="w-24 bg-white border border-gray-200 rounded-xl px-3 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500"
                          value={depositAmounts[p.id] || ""}
                          onChange={(e) => setDepositAmounts({...depositAmounts, [p.id]: e.target.value})}
                        />
                        <button 
                          onClick={() => handleDeposit(activeEvent.id, p.id)}
                          className="px-4 py-2 bg-black text-white rounded-xl text-xs font-black uppercase hover:bg-indigo-600 transition-all"
                        >
                          Deposit
                        </button>
                      </div>
                    ) : (
                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border border-green-200">
                        Pool Locked
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            <div className={`${isGoalMet ? 'bg-green-600' : 'bg-gray-900'} text-white p-8 rounded-[2.5rem] shadow-2xl transition-colors duration-500 relative overflow-hidden`}>
              <div className="relative z-10">
                <p className="text-white/50 text-xs font-black uppercase tracking-widest mb-2">Total Pool</p>
                <h2 className="text-6xl font-black mb-6">${activeEvent.totalPool}</h2>
                <div className="border-t border-white/10 pt-4">
                  <p className="text-xs text-white/50 mb-1 font-bold italic">GOAL: ${activeEvent.budgetGoal}</p>
                  {isGoalMet && <p className="text-xs font-black uppercase animate-pulse">✓ Ready for spending</p>}
                </div>
              </div>
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white rounded-full blur-[80px] opacity-10"></div>
            </div>

            {isGoalMet && (
              <div className="p-6 bg-green-50 rounded-2xl border border-green-100 animate-in slide-in-from-bottom duration-500">
                <p className="text-xs font-bold text-green-700 uppercase mb-2">Programmable Rule Triggered</p>
                <p className="text-sm text-green-900 leading-relaxed italic">
                  "Basket full. Automated payment categories are now active."
                </p>
              </div>
            )}
          </aside>
        </div>
      </div>
    );
  }

  // --- DASHBOARD REMAINS SAME AS PREVIOUS ---
  return (
    <div className="p-8 max-w-5xl mx-auto font-sans bg-gray-50 min-h-screen text-black">
      <div className="mb-12">
        <h1 className="text-7xl font-black text-indigo-700 italic tracking-tighter leading-none">COOPER.</h1>
        <p className="text-gray-400 font-bold ml-1">v1.0 // Collective Control</p>
      </div>
      
      {/* Creation form */}
      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-200 mb-12">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Launch New Event</h2>
        <form onSubmit={createEvent} className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-6">
            <input type="text" placeholder="Event Name" className="w-full bg-gray-50 p-4 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold" value={newEventName} onChange={(e) => setNewEventName(e.target.value)} />
            <input type="number" placeholder="Budget Goal ($)" className="w-full bg-gray-50 p-4 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold" value={newBudget} onChange={(e) => setNewBudget(e.target.value)} />
          </div>
          <div>
            <div className="flex flex-wrap gap-2">
              {MOCK_USERS.map(user => (
                <button key={user.id} type="button" onClick={() => setSelectedUsers(prev => prev.includes(user.id) ? prev.filter(id => id !== user.id) : [...prev, user.id])} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border-2 ${selectedUsers.includes(user.id) ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-gray-100 text-gray-400 hover:border-indigo-200'}`}>{user.name}</button>
              ))}
            </div>
            <button className="w-full bg-black text-white font-black py-5 rounded-2xl mt-8 hover:bg-indigo-700 transition-all active:scale-95">INITIALIZE BASKET</button>
          </div>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {events.map(event => (
          <div key={event.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all group">
            <h3 className="text-2xl font-black text-gray-800 mb-4">{event.title}</h3>
            <div className="flex justify-between items-center mb-6">
              <span className={`font-black ${event.totalPool >= event.budgetGoal ? 'text-green-600' : 'text-red-600'}`}>${event.totalPool} / ${event.budgetGoal}</span>
              <div className="w-12 bg-gray-100 h-2 rounded-full overflow-hidden">
                <div className={`h-full ${event.totalPool >= event.budgetGoal ? 'bg-green-500' : 'bg-red-500'}`} style={{ width: `${(event.totalPool/event.budgetGoal)*100}%` }}></div>
              </div>
            </div>
            <button onClick={() => setActiveEventId(event.id)} className="w-full bg-gray-900 py-4 rounded-2xl font-bold text-white hover:bg-indigo-600">Open Basket</button>
          </div>
        ))}
      </div>
    </div>
  );
}
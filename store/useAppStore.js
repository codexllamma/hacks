import { create } from 'zustand';

export const SPATIAL_STATES = {
  INTRO: 'INTRO',
  MUSEUM_OVERVIEW: 'MUSEUM_OVERVIEW',
  EVENT_SELECTED: 'EVENT_SELECTED',
  EVENT_ROOM: 'EVENT_ROOM',
  CREATING_EVENT: 'CREATING_EVENT'
};

export const useAppStore = create((set, get) => ({
  state: SPATIAL_STATES.INTRO,
  events: [
    { 
      id: '1', 
      title: "Alice's 25th", 
      theme: 'birthday', 
      budgetGoal: 500, 
      totalPool: 0, // Starts empty
      participants: [
        { id: 'u1', name: 'Alice', deposit: 0 },
        { id: 'u2', name: 'Bob', deposit: 0 },
        { id: 'u3', name: 'Charlie', deposit: 0 },
        { id: 'u4', name: 'Diana', deposit: 0 },
      ] 
    },
    { id: '2', title: 'Ski Trip 2026', theme: 'trip', budgetGoal: 5000, totalPool: 1200, participants: [] }
  ],
  
  stationIndex: 0, 
  activeEventIndex: 0,
  needsScrollReset: false,
  // Track which user is currently being paid for
  paymentTargetUserId: null, 

  setState: (state) => set({ state }),
  
  // ACTIONS
  contribute: (eventId, userId, amount) => set((state) => {
    const updatedEvents = state.events.map(ev => {
      if (ev.id !== eventId) return ev;
      
      // Update Participant
      const updatedParticipants = ev.participants.map(p => 
        p.id === userId ? { ...p, deposit: p.deposit + amount } : p
      );

      // Update Total Pool
      const newTotal = updatedParticipants.reduce((sum, p) => sum + p.deposit, 0);
      
      return { ...ev, participants: updatedParticipants, totalPool: newTotal };
    });

    return { events: updatedEvents, paymentTargetUserId: null }; // Close modal after pay
  }),

  setPaymentTarget: (userId) => set({ paymentTargetUserId: userId }),

  // ... (Keep existing navigation/intro logic)
  finishIntro: () => set({ state: SPATIAL_STATES.MUSEUM_OVERVIEW }),
  
  nextStation: () => {
    const { events, stationIndex } = get();
    if (stationIndex < events.length + 1) set({ stationIndex: stationIndex + 1 });
  },
  
  prevStation: () => {
    const { stationIndex } = get();
    if (stationIndex > 0) set({ stationIndex: stationIndex - 1 });
  },

  selectEvent: (index) => set({ 
    activeEventIndex: index, 
    state: SPATIAL_STATES.EVENT_ROOM 
  }),

  startCreating: () => set((state) => ({
    state: SPATIAL_STATES.CREATING_EVENT,
    activeEventIndex: state.events.length 
  })),

  addEvent: (newEvent) => set((state) => ({
    events: [...state.events, { ...newEvent, id: Date.now().toString(), totalPool: 0, participants: [] }],
    state: SPATIAL_STATES.MUSEUM_OVERVIEW,
    stationIndex: state.events.length + 1,
    activeEventIndex: state.events.length,
    needsScrollReset: true 
  })),

  exitToGallery: () => set({ 
    state: SPATIAL_STATES.MUSEUM_OVERVIEW,
    activeEventIndex: 0,
    paymentTargetUserId: null
  }),

  clearScrollReset: () => set({ needsScrollReset: false })
}));
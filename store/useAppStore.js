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
      totalPool: 0,
      participants: [
        { id: 'u1', name: 'Alice', deposit: 0 },
        { id: 'u2', name: 'Bob', deposit: 0 },
        { id: 'u3', name: 'Charlie', deposit: 0 },
        { id: 'u4', name: 'Diana', deposit: 0 },
        { id: 'u5', name: 'Shivam', deposit: 0 }
        
      ] 
    },
    { id: '2', title: 'Ski Trip 2026', theme: 'trip', budgetGoal: 5000, totalPool: 1200, participants: [] },
    { 
      id: '3', 
      title: "Movie Night", 
      theme: 'movie', 
      budgetGoal: 1000, 
      totalPool: 0, // Added some initial pool for visible progress
      participants: [
        { id: 'u1', name: 'Alice', deposit: 0 },
        { id: 'u2', name: 'Bob', deposit: 0 },
        { id: 'u3', name: 'Charlie', deposit: 0 },
        { id: 'u4', name: 'Diana', deposit: 0 },
        { id: 'u5', name: 'Eve', deposit: 0 },
        { id: 'u6', name: 'Shivam', deposit: 0 },
      ] 
    }
  ],
  
  stationIndex: 0, 
  activeEventIndex: 0,
  needsScrollReset: false,
  paymentTargetUserId: null, 

  setState: (state) => set({ state }),
  
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
    events: [...state.events, { 
      ...newEvent, 
      id: Date.now().toString(), 
      totalPool: 0, 
      participants: Array.from({ length: 5 }, (_, i) => ({ id: `u${i+1}`, name: `User ${i+1}`, deposit: 0 })) // Default 5 users
    }],
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

  clearScrollReset: () => set({ needsScrollReset: false }),

  setPaymentTarget: (userId) => set({ paymentTargetUserId: userId }),

  contribute: (eventId, userId, amount) => set((state) => {
    const events = [...state.events];
    const eventIndex = events.findIndex(e => e.id === eventId);
    if (eventIndex > -1) {
      const event = { ...events[eventIndex] };
      const userIndex = event.participants.findIndex(u => u.id === userId);
      if (userIndex > -1) {
        event.participants = [...event.participants];
        event.participants[userIndex] = { ...event.participants[userIndex], deposit: event.participants[userIndex].deposit + amount };
        event.totalPool += amount;
        events[eventIndex] = event;
      }
    }
    return { events, paymentTargetUserId: null };
  }),

  finishIntro: () => set({ state: SPATIAL_STATES.MUSEUM_OVERVIEW })
}));
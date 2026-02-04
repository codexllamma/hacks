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
  
  // Loading State for smooth transitions
  isLoading: true, 
  events: [], 
  availableUsers: [], 

  stationIndex: 0, 
  activeEventIndex: 0,
  needsScrollReset: false,
  paymentTargetUserId: null, 

  setState: (state) => set({ state }),

  // --- NEW ACTION: RESET TO START ---
  resetView: () => set({ 
    state: SPATIAL_STATES.MUSEUM_OVERVIEW,
    stationIndex: 0,
    activeEventIndex: 0,
    needsScrollReset: false,
    paymentTargetUserId: null
  }),

  fetchEvents: async () => {
    set({ isLoading: true });

    try {
      // A. Fetch Users
      const userRes = await fetch('/api/groups/users');
      if (userRes.ok) {
        const userData = await userRes.json();
        if (userData.users) set({ availableUsers: userData.users });
      }

      // B. Fetch Events
      const res = await fetch('/api/events');
      if (!res.ok) {
        console.error("API Error (Events):", await res.text()); 
        set({ isLoading: false });
        return;
      }

      const dbEvents = await res.json();

      if (Array.isArray(dbEvents)) {
        const mappedEvents = dbEvents.map(e => {
          const lowerName = e.name.toLowerCase();
          let theme = 'trip'; 
          if (lowerName.includes('birthday')) theme = 'birthday';
          if (lowerName.includes('movie')) theme = 'movie';
          if (lowerName.includes('dine') || lowerName.includes('food')) theme = 'dineout';

          const budget = parseFloat(e.budgetGoal) || 0;
          const pool = parseFloat(e.totalPooled) || 0;

          return {
            id: e.id,
            title: e.name,
            theme: theme,
            budgetGoal: budget,
            totalPool: pool,
            percentage: budget > 0 ? Math.min(100, Math.floor((pool / budget) * 100)) : 0,
            participants: e.participants.map(p => ({
              id: p.user.id,
              name: p.user.name,
              deposit: 0 
            })),
            rawCategories: e.categories.map(c => ({
              id: c.id,
              name: c.name,
              totalPooled: parseFloat(c.totalPooled) || 0,
              spendingLimit: parseFloat(c.spendingLimit) || 0
            }))
          };
        });

        set({ events: mappedEvents, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (err) {
      console.error("Failed to load events:", err);
      set({ isLoading: false });
    }
  },
  
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

  addEvent: async (newEvent) => {
    const { availableUsers, fetchEvents } = get();
    try {
      const allUserIds = availableUsers.map(u => u.id);
      const res = await fetch('/api/create-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newEvent.title,
          groupId: "g1", 
          selectedUserIds: allUserIds, 
          categories: [{ 
            name: "General Pool", 
            spendingLimit: newEvent.budgetGoal 
          }] 
        })
      });

      if (!res.ok) {
        console.error("Create Event Failed:", await res.text());
        return;
      }

      await fetchEvents();

      set((state) => ({
        state: SPATIAL_STATES.MUSEUM_OVERVIEW,
        stationIndex: state.events.length,
        activeEventIndex: state.events.length,
        needsScrollReset: true 
      }));

    } catch (err) {
      console.error("Create event error:", err);
    }
  },

  exitToGallery: () => set({ 
    state: SPATIAL_STATES.MUSEUM_OVERVIEW,
    activeEventIndex: 0,
    paymentTargetUserId: null
  }),

  clearScrollReset: () => set({ needsScrollReset: false }),

  setPaymentTarget: (userId) => set({ paymentTargetUserId: userId }),

  contribute: async (eventId, userId, amount) => {
    const { events, fetchEvents } = get();
    const event = events.find(e => e.id === eventId);
    
    if (!event || !event.rawCategories || event.rawCategories.length === 0) {
      console.error("No category found for this event");
      return;
    }

    const categoryId = event.rawCategories[0].id;

    try {
      const res = await fetch('/api/categories/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId,
          categoryId: categoryId,
          amount: amount
        })
      });

      if (!res.ok) {
        console.error("Contribution Failed:", await res.text());
        return;
      }

      await fetchEvents();
      set({ paymentTargetUserId: null });

    } catch (err) {
      console.error("Contribution error:", err);
    }
  },

  finishIntro: () => {
    set({ state: SPATIAL_STATES.MUSEUM_OVERVIEW });
  }
}));
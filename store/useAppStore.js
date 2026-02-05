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
  
  isLoading: true, 
  events: [], 
  availableUsers: [], 
  auditLogs: [], 

  stationIndex: 0, 
  activeEventIndex: 0,
  needsScrollReset: false,
  paymentTargetUserId: null, 

  setState: (state) => set({ state }),

  resetView: () => set({ 
    state: SPATIAL_STATES.MUSEUM_OVERVIEW,
    stationIndex: 0,
    activeEventIndex: 0,
    needsScrollReset: false,
    paymentTargetUserId: null,
    auditLogs: [] 
  }),

  // --- FETCH EVENTS ---
  fetchEvents: async (silent = false) => {
    if (!silent) set({ isLoading: true });

    try {
      const userRes = await fetch('/api/groups/users');
      if (userRes.ok) {
        const userData = await userRes.json();
        if (userData.users) set({ availableUsers: userData.users });
      }

      const res = await fetch('/api/events');
      if (!res.ok) {
        console.error("API Error (Events):", await res.text()); 
        if (!silent) set({ isLoading: false });
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

          // 1. ROBUST BUDGET CALCULATION
          // If DB has 0, sum up the categories manually
          let budget = parseFloat(e.budgetGoal) || 0;
          const pool = parseFloat(e.totalPooled) || 0;
          
          const rawCategories = e.categories.map(c => ({
              id: c.id,
              name: c.name,
              totalPooled: parseFloat(c.totalPooled) || 0,
              spendingLimit: parseFloat(c.spendingLimit) || 0,
              members: c.members || []
          }));

          if (budget === 0 && rawCategories.length > 0) {
             budget = rawCategories.reduce((acc, cat) => acc + cat.spendingLimit, 0);
          }

          // Safe Percentage
          const percentage = budget > 0 ? Math.min(100, Math.floor((pool / budget) * 100)) : 0;

          return {
            id: e.id,
            title: e.name,
            theme: theme,
            budgetGoal: budget, // Now guaranteed to be correct
            totalPool: pool,
            percentage: percentage,
            participants: e.participants.map(p => ({
              id: p.user.id,
              name: p.user.name,
              deposit: 0 
            })),
            rawCategories: rawCategories
          };
        });

        set({ events: mappedEvents, isLoading: false });
      } else {
        if (!silent) set({ isLoading: false });
      }
    } catch (err) {
      console.error("Failed to load events:", err);
      if (!silent) set({ isLoading: false });
    }
  },

  // --- FETCH AUDIT LOGS ---
  fetchAuditLogs: async (eventId) => {
    if (!eventId) return;
    try {
      const res = await fetch(`/api/events/${eventId}/audit`); 
      if (!res.ok) return;
      const logs = await res.json();
      if (Array.isArray(logs)) {
          set({ auditLogs: logs });
      }
    } catch (err) {
      console.error("Failed to fetch logs", err);
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

  selectEvent: (index) => {
    const { events } = get();
    const event = events[index];
    set({ activeEventIndex: index, state: SPATIAL_STATES.EVENT_ROOM });
    if (event) get().fetchAuditLogs(event.id);
  },

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

      if (!res.ok) return;

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
    paymentTargetUserId: null,
    auditLogs: [] 
  }),

  clearScrollReset: () => set({ needsScrollReset: false }),

  setPaymentTarget: (userId) => set({ paymentTargetUserId: userId }),

  // --- UPDATED CONTRIBUTE ACTION (Fixes 400 Error) ---
  contribute: async (eventId, userId, categoryId, amount) => {
    const { fetchEvents, fetchAuditLogs } = get();
    
    // 1. NAN / NULL PROTECTION
    // If amount is not a valid number, stop here.
    if (!eventId || !userId || !categoryId || isNaN(amount) || amount <= 0) {
      console.error("Contribute aborted: Invalid Payload", { eventId, userId, categoryId, amount });
      return; 
    }

    try {
      const res = await fetch('/api/categories/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId,
          categoryId: categoryId,
          amount: parseFloat(amount) // Ensure float
        })
      });

      if (!res.ok) {
        console.error("API Deposit Failed:", await res.text());
        return;
      }

      await Promise.all([
        fetchEvents(),
        fetchAuditLogs(eventId)
      ]);
      set({ paymentTargetUserId: null });

    } catch (err) {
      console.error("Contribution network error:", err);
    }
  },

  finishIntro: () => {
    set({ state: SPATIAL_STATES.MUSEUM_OVERVIEW });
  }
}));
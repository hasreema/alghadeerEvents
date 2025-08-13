import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import eventService, { Event, EventsListParams, EventStatsOverview } from '../services/events/eventService';
import { getAccessToken } from '../services/api';

interface EventState {
  // State
  events: Event[];
  selectedEvent: Event | null;
  stats: EventStatsOverview | null;
  loading: boolean;
  loadingStats: boolean;
  error: string | null;
  totalEvents: number;
  currentPage: number;
  pageSize: number;
  filters: EventsListParams;

  // Actions
  fetchEvents: (params?: EventsListParams) => Promise<void>;
  fetchEvent: (id: string) => Promise<void>;
  createEvent: (data: any) => Promise<Event>;
  updateEvent: (id: string, data: any) => Promise<Event>;
  deleteEvent: (id: string) => Promise<void>;
  fetchStats: () => Promise<void>;
  setFilters: (filters: EventsListParams) => void;
  setPage: (page: number) => void;
  clearError: () => void;
  
  // Real-time update handlers
  handleEventCreated: (event: Event) => void;
  handleEventUpdated: (event: Event) => void;
  handleEventDeleted: (eventId: string) => void;
  
  // WebSocket
  initializeWebSocket: () => void;
  disconnectWebSocket: () => void;
}

const useEventStore = create<EventState>()(
  devtools(
    (set, get) => ({
      // Initial state
      events: [],
      selectedEvent: null,
      stats: null,
      loading: false,
      loadingStats: false,
      error: null,
      totalEvents: 0,
      currentPage: 1,
      pageSize: 10,
      filters: {},

      // Fetch events with loading state
      fetchEvents: async (params) => {
        set({ loading: true, error: null });
        try {
          const response = await eventService.getEvents({
            ...get().filters,
            ...params,
            page: get().currentPage,
            page_size: get().pageSize,
          });
          const items = (response as any)?.items ?? (response as any)?.data ?? [];
          const total = (response as any)?.total ?? (Array.isArray(items) ? items.length : 0);
          set({
            events: items as any,
            totalEvents: total,
            loading: false,
          });
        } catch (error: any) {
          set({
            error: error.message || 'Failed to fetch events',
            loading: false,
          });
        }
      },

      // Fetch single event
      fetchEvent: async (id) => {
        set({ loading: true, error: null });
        try {
          const event = await eventService.getEvent(id);
          set({
            selectedEvent: event,
            loading: false,
          });
        } catch (error: any) {
          set({
            error: error.message || 'Failed to fetch event',
            loading: false,
          });
        }
      },

      // Create event
      createEvent: async (data) => {
        set({ loading: true, error: null });
        try {
          const event = await eventService.createEvent(data);
          set((state) => ({
            events: [event, ...state.events],
            loading: false,
          }));
          return event;
        } catch (error: any) {
          set({
            error: error.message || 'Failed to create event',
            loading: false,
          });
          throw error;
        }
      },

      // Update event
      updateEvent: async (id, data) => {
        set({ loading: true, error: null });
        try {
          const updatedEvent = await eventService.updateEvent(id, data);
          set((state) => ({
            events: state.events.map((e) => (e.id === id ? updatedEvent : e)),
            selectedEvent: state.selectedEvent?.id === id ? updatedEvent : state.selectedEvent,
            loading: false,
          }));
          return updatedEvent;
        } catch (error: any) {
          set({
            error: error.message || 'Failed to update event',
            loading: false,
          });
          throw error;
        }
      },

      // Delete event
      deleteEvent: async (id) => {
        set({ loading: true, error: null });
        try {
          await eventService.deleteEvent(id);
          set((state) => ({
            events: state.events.filter((e) => e.id !== id),
            selectedEvent: state.selectedEvent?.id === id ? null : state.selectedEvent,
            loading: false,
          }));
        } catch (error: any) {
          set({
            error: error.message || 'Failed to delete event',
            loading: false,
          });
          throw error;
        }
      },

      // Fetch statistics
      fetchStats: async () => {
        set({ loadingStats: true, error: null });
        try {
          const stats = await eventService.getEventStats();
          set({
            stats,
            loadingStats: false,
          });
        } catch (error: any) {
          set({
            error: error.message || 'Failed to fetch statistics',
            loadingStats: false,
          });
        }
      },

      // Set filters
      setFilters: (filters) => {
        set({ filters, currentPage: 1 });
        get().fetchEvents();
      },

      // Set page
      setPage: (page) => {
        set({ currentPage: page });
        get().fetchEvents();
      },

      // Clear error
      clearError: () => {
        set({ error: null });
      },

      // Real-time update handlers
      handleEventCreated: (event) => {
        set((state) => ({
          events: [event, ...state.events],
          totalEvents: state.totalEvents + 1,
        }));
      },

      handleEventUpdated: (event) => {
        set((state) => ({
          events: state.events.map((e) => (e.id === event.id ? event : e)),
          selectedEvent: state.selectedEvent?.id === event.id ? event : state.selectedEvent,
        }));
      },

      handleEventDeleted: (eventId) => {
        set((state) => ({
          events: state.events.filter((e) => e.id !== eventId),
          selectedEvent: state.selectedEvent?.id === eventId ? null : state.selectedEvent,
          totalEvents: state.totalEvents - 1,
        }));
      },

      // Initialize WebSocket connection
      initializeWebSocket: () => {
        const token = getAccessToken();
        if (token) {
          eventService.initializeSocket(token);
          
          // Subscribe to real-time updates
          eventService.subscribe('event:created', get().handleEventCreated);
          eventService.subscribe('event:updated', get().handleEventUpdated);
          eventService.subscribe('event:deleted', get().handleEventDeleted);
        }
      },

      // Disconnect WebSocket
      disconnectWebSocket: () => {
        eventService.disconnectSocket();
      },
    }),
    {
      name: 'event-store',
    }
  )
);

export default useEventStore;
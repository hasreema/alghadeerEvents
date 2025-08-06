import api from '../api';
import { io, Socket } from 'socket.io-client';

export interface EventPricing {
  base_price: number;
  extras_price: number;
  discount_amount: number;
  discount_percentage: number;
  final_price: number;
  notes?: string;
}

export interface EventContact {
  name: string;
  phone: string;
  email?: string;
  role: string;
}

export interface Event {
  id: string;
  event_name: string;
  event_type: string;
  event_date: string;
  start_time: string;
  end_time: string;
  guest_count: number;
  location: string;
  hall_number?: string;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  customer_address?: string;
  pricing: EventPricing;
  payment_status: 'pending' | 'partial' | 'paid' | 'overdue';
  total_paid: number;
  balance_due: number;
  notes?: string;
  special_requests?: string;
  menu_details?: string;
  decoration_details?: string;
  contacts: EventContact[];
  assigned_employees: string[];
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface CreateEventRequest {
  event_name: string;
  event_type: string;
  event_date: string;
  start_time: string;
  end_time: string;
  guest_count: number;
  location: string;
  hall_number?: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  customer_address?: string;
  pricing: Omit<EventPricing, 'final_price'>;
  notes?: string;
  special_requests?: string;
  menu_details?: string;
  decoration_details?: string;
  contacts?: EventContact[];
}

export interface UpdateEventRequest extends Partial<CreateEventRequest> {
  status?: Event['status'];
  payment_status?: Event['payment_status'];
  assigned_employees?: string[];
}

export interface EventsListParams {
  page?: number;
  limit?: number;
  status?: string;
  event_type?: string;
  location?: string;
  search?: string;
  start_date?: string;
  end_date?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface EventsListResponse {
  data: Event[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface EventStats {
  total_events: number;
  upcoming_events: number;
  completed_events: number;
  cancelled_events: number;
  total_revenue: number;
  pending_payments: number;
  monthly_stats: {
    month: string;
    events: number;
    revenue: number;
  }[];
}

class EventService {
  private socket: Socket | null = null;
  private listeners: Map<string, Set<Function>> = new Map();

  // Initialize WebSocket connection for real-time updates
  initializeSocket(token: string) {
    if (this.socket) return;

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000';
    
    this.socket = io(wsUrl, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      console.log('Connected to WebSocket');
    });

    this.socket.on('event:created', (event: Event) => {
      this.notifyListeners('event:created', event);
    });

    this.socket.on('event:updated', (event: Event) => {
      this.notifyListeners('event:updated', event);
    });

    this.socket.on('event:deleted', (eventId: string) => {
      this.notifyListeners('event:deleted', eventId);
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket');
    });
  }

  disconnectSocket() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.listeners.clear();
  }

  // Subscribe to real-time updates
  subscribe(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.listeners.get(event);
      if (callbacks) {
        callbacks.delete(callback);
      }
    };
  }

  private notifyListeners(event: string, data: any) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }

  // API Methods
  async getEvents(params?: EventsListParams): Promise<EventsListResponse> {
    const response = await api.get<EventsListResponse>('/events', { params });
    return response.data;
  }

  async getEvent(id: string): Promise<Event> {
    const response = await api.get<Event>(`/events/${id}`);
    return response.data;
  }

  async createEvent(data: CreateEventRequest): Promise<Event> {
    const response = await api.post<Event>('/events', data);
    return response.data;
  }

  async updateEvent(id: string, data: UpdateEventRequest): Promise<Event> {
    const response = await api.put<Event>(`/events/${id}`, data);
    return response.data;
  }

  async deleteEvent(id: string): Promise<void> {
    await api.delete(`/events/${id}`);
  }

  async getEventStats(): Promise<EventStats> {
    const response = await api.get<EventStats>('/events/stats/overview');
    return response.data;
  }

  async duplicateEvent(id: string): Promise<Event> {
    const response = await api.post<Event>(`/events/${id}/duplicate`);
    return response.data;
  }

  async exportEvents(params?: EventsListParams): Promise<Blob> {
    const response = await api.get('/events/export', {
      params,
      responseType: 'blob',
    });
    return response.data;
  }

  // Calendar specific methods
  async getCalendarEvents(start: string, end: string): Promise<Event[]> {
    const response = await api.get<Event[]>('/events/calendar', {
      params: { start_date: start, end_date: end },
    });
    return response.data;
  }

  async updateEventDate(id: string, newDate: string, newStartTime?: string, newEndTime?: string): Promise<Event> {
    const response = await api.patch<Event>(`/events/${id}/reschedule`, {
      event_date: newDate,
      start_time: newStartTime,
      end_time: newEndTime,
    });
    return response.data;
  }
}

export default new EventService();
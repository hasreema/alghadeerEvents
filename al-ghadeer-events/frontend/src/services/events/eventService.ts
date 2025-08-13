import api from '../api';
import { io, Socket } from 'socket.io-client';
import { WS_URL } from '../../config';

export interface EventContact {
  name: string;
  phone: string;
  email?: string;
  relation?: string;
  is_primary?: boolean;
}

export interface EventPricing {
  base_price: number;
  additional_services: Record<string, number>;
  discounts: number;
  taxes: number;
  total_price: number;
}

export interface Event {
  id: string;
  event_name: string;
  event_type: string;
  event_type_other?: string | null;
  location: string;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  event_date: string; // ISO datetime
  start_time: string;
  end_time: string;
  expected_guests: number;
  actual_guests?: number | null;
  guest_gender: string;
  contacts: EventContact[];
  services: Record<string, boolean>;
  pricing: EventPricing;
  payment_status: 'pending' | 'partial' | 'paid' | 'overdue';
  deposit_amount: number;
  deposit_paid: boolean;
  outstanding_balance: number;
  assigned_employees: string[];
  labor_cost: number;
  total_revenue: number;
  total_expenses: number;
  profit: number;
  profit_margin: number;
  created_at: string;
  updated_at: string;
}

export interface CreateEventRequest {
  event_name: string;
  event_type: string;
  event_type_other?: string;
  location: string;
  event_date: string; // ISO datetime
  start_time: string;
  end_time: string;
  setup_time?: string;
  cleanup_time?: string;
  expected_guests: number;
  guest_gender: string;
  contacts: EventContact[];
  services: Record<string, boolean>;
  special_requests?: string;
  decoration_type?: string;
  decoration_details?: string;
  menu_selections?: Record<string, string[]>;
  dietary_restrictions?: string[];
  pricing: EventPricing;
  deposit_amount?: number;
  internal_notes?: string;
}

export interface UpdateEventRequest extends Partial<CreateEventRequest> {
  status?: Event['status'];
  assigned_employees?: string[];
}

export interface EventsListParams {
  page?: number;
  page_size?: number;
  status?: string;
  event_type?: string;
  location?: string;
  search?: string;
  start_date?: string;
  end_date?: string;
}

export interface EventsListResponse {
  items: Event[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface EventStatsOverview {
  total_events: number;
  total_revenue: number;
  total_expenses: number;
  total_profit: number;
  average_profit_margin: number;
  status_breakdown: Record<string, number>;
  type_breakdown: Record<string, number>;
  upcoming_events: number;
}

class EventService {
  private socket: Socket | null = null;
  private listeners: Map<string, Set<Function>> = new Map();

  initializeSocket(token: string) {
    if (this.socket) return;

    const wsUrl = WS_URL;

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

  subscribe(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

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

  async getEventStats(): Promise<EventStatsOverview> {
    const response = await api.get<EventStatsOverview>('/events/stats/overview');
    return response.data;
  }
}

export default new EventService();
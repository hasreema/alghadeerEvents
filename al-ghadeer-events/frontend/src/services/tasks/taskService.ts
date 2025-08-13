import api from '../api';

export type TaskStatus = 'todo' | 'in_progress' | 'completed' | 'cancelled';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigned_to?: string;
  assigned_to_name?: string;
  event_id?: string;
  event_name?: string;
  due_date?: string; // ISO
  progress_percentage: number;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface TaskCreateRequest {
  title: string;
  description?: string;
  priority?: TaskPriority;
  assigned_to?: string;
  event_id?: string;
  due_date?: string;
  tags?: string[];
  category?: string;
  reminder_enabled?: boolean;
  reminder_before_hours?: number;
}

export interface TaskUpdateRequest extends Partial<TaskCreateRequest> {
  status?: TaskStatus;
  progress_percentage?: number;
}

export interface TaskListParams {
  page?: number;
  page_size?: number;
  status?: TaskStatus;
  priority?: TaskPriority;
  assigned_to?: string;
  event_id?: string;
  overdue?: boolean;
}

export interface TaskListResponse {
  items: Task[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

class TaskService {
  async list(params?: TaskListParams): Promise<TaskListResponse> {
    const res = await api.get<TaskListResponse>('/tasks', { params });
    return res.data;
  }

  async get(taskId: string): Promise<Task> {
    const res = await api.get<Task>(`/tasks/${taskId}`);
    return res.data;
  }

  async create(data: TaskCreateRequest): Promise<Task> {
    const res = await api.post<Task>('/tasks', data);
    return res.data;
  }

  async update(taskId: string, data: TaskUpdateRequest): Promise<Task> {
    const res = await api.put<Task>(`/tasks/${taskId}`, data);
    return res.data;
  }

  async remove(taskId: string): Promise<void> {
    await api.delete(`/tasks/${taskId}`);
  }
}

export default new TaskService();
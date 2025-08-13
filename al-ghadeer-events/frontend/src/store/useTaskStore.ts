import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import taskService, { Task, TaskListParams } from '../services/tasks/taskService';

interface TaskState {
  tasks: Task[];
  selectedTask: Task | null;
  loading: boolean;
  error: string | null;
  totalTasks: number;
  currentPage: number;
  pageSize: number;
  filters: TaskListParams;

  fetchTasks: (params?: TaskListParams) => Promise<void>;
  fetchTask: (id: string) => Promise<void>;
  createTask: (data: any) => Promise<Task>;
  updateTask: (id: string, data: any) => Promise<Task>;
  deleteTask: (id: string) => Promise<void>;
  setFilters: (filters: TaskListParams) => void;
  setPage: (page: number) => void;
  clearError: () => void;
}

const useTaskStore = create<TaskState>()(
  devtools(
    (set, get) => ({
      tasks: [],
      selectedTask: null,
      loading: false,
      error: null,
      totalTasks: 0,
      currentPage: 1,
      pageSize: 10,
      filters: {},

      fetchTasks: async (params) => {
        set({ loading: true, error: null });
        try {
          const response = await taskService.list({
            ...get().filters,
            ...params,
            page: get().currentPage,
            page_size: get().pageSize,
          });
          const items = (response as any)?.items ?? (response as any)?.data ?? [];
          const total = (response as any)?.total ?? (Array.isArray(items) ? items.length : 0);
          set({ tasks: items as any, totalTasks: total, loading: false });
        } catch (error: any) {
          set({ error: error.message || 'Failed to fetch tasks', loading: false });
        }
      },

      fetchTask: async (id) => {
        set({ loading: true, error: null });
        try {
          const task = await taskService.get(id);
          set({ selectedTask: task, loading: false });
        } catch (error: any) {
          set({ error: error.message || 'Failed to fetch task', loading: false });
        }
      },

      createTask: async (data) => {
        set({ loading: true, error: null });
        try {
          const task = await taskService.create(data);
          set((state) => ({ tasks: [task, ...state.tasks], loading: false }));
          return task;
        } catch (error: any) {
          set({ error: error.message || 'Failed to create task', loading: false });
          throw error;
        }
      },

      updateTask: async (id, data) => {
        set({ loading: true, error: null });
        try {
          const updated = await taskService.update(id, data);
          set((state) => ({
            tasks: state.tasks.map((t) => (t.id === id ? updated : t)),
            selectedTask: state.selectedTask?.id === id ? updated : state.selectedTask,
            loading: false,
          }));
          return updated;
        } catch (error: any) {
          set({ error: error.message || 'Failed to update task', loading: false });
          throw error;
        }
      },

      deleteTask: async (id) => {
        set({ loading: true, error: null });
        try {
          await taskService.remove(id);
          set((state) => ({
            tasks: state.tasks.filter((t) => t.id !== id),
            selectedTask: state.selectedTask?.id === id ? null : state.selectedTask,
            loading: false,
          }));
        } catch (error: any) {
          set({ error: error.message || 'Failed to delete task', loading: false });
          throw error;
        }
      },

      setFilters: (filters) => {
        set({ filters, currentPage: 1 });
        get().fetchTasks();
      },

      setPage: (page) => {
        set({ currentPage: page });
        get().fetchTasks();
      },

      clearError: () => set({ error: null }),
    }),
    { name: 'task-store' }
  )
);

export default useTaskStore;
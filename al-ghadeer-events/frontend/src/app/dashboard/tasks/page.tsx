"use client";

import { useEffect, useState } from "react";
import useTaskStore from "../../../store/useTaskStore";

export default function TasksListPage() {
  const {
    tasks,
    totalTasks,
    loading,
    fetchTasks,
    setFilters,
    setPage,
    currentPage,
    pageSize,
  } = useTaskStore();

  const [status, setStatus] = useState<string | undefined>(undefined);
  const [priority, setPriority] = useState<string | undefined>(undefined);
  const [eventId, setEventId] = useState<string | undefined>(undefined);
  const [overdue, setOverdue] = useState<boolean>(false);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const applyFilters = () => {
    setFilters({ status: status as any, priority: priority as any, event_id: eventId, overdue });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-2">
        <select
          className="border rounded px-3 py-2"
          value={status || ""}
          onChange={(e) => setStatus(e.target.value || undefined)}
        >
          <option value="">All Status</option>
          <option value="todo">To Do</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select
          className="border rounded px-3 py-2"
          value={priority || ""}
          onChange={(e) => setPriority(e.target.value || undefined)}
        >
          <option value="">All Priority</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>
        <input
          className="border rounded px-3 py-2"
          placeholder="Filter by Event ID"
          value={eventId || ""}
          onChange={(e) => setEventId(e.target.value || undefined)}
        />
        <label className="inline-flex items-center gap-2 text-sm">
          <input type="checkbox" checked={overdue} onChange={(e) => setOverdue(e.target.checked)} />
          Overdue only
        </label>
        <button className="px-4 py-2 bg-primary text-white rounded" onClick={applyFilters}>Filter</button>
      </div>

      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left">Title</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Priority</th>
              <th className="px-4 py-2 text-left">Event</th>
              <th className="px-4 py-2 text-left">Due</th>
              <th className="px-4 py-2 text-left">Assigned</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((t) => (
              <tr key={t.id} className="border-t">
                <td className="px-4 py-2">
                  <a className="text-primary underline" href={`/dashboard/tasks/${t.id}`}>{t.title}</a>
                </td>
                <td className="px-4 py-2"><span className="px-2 py-1 text-xs rounded bg-gray-100">{t.status}</span></td>
                <td className="px-4 py-2">{t.priority}</td>
                <td className="px-4 py-2">
                  {t.event_name ? (
                    <a className="text-primary underline" href={`/dashboard/events/${t.event_id}`}>{t.event_name}</a>
                  ) : (
                    '-' 
                  )}
                </td>
                <td className="px-4 py-2">{t.due_date ? new Date(t.due_date).toLocaleString() : '-'}</td>
                <td className="px-4 py-2">{t.assigned_to_name || '-'}</td>
              </tr>
            ))}
            {tasks.length === 0 && !loading && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-gray-500">No tasks found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">Total: {totalTasks}</div>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1 border rounded disabled:opacity-50" onClick={() => setPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1}>Prev</button>
          <span>Page {currentPage}</span>
          <button className="px-3 py-1 border rounded disabled:opacity-50" onClick={() => setPage(currentPage + 1)} disabled={tasks.length < pageSize}>Next</button>
        </div>
      </div>
    </div>
  );
}
"use client";

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import useTaskStore from '../../../../store/useTaskStore';

export default function TaskCreatePage() {
  const router = useRouter();
  const search = useSearchParams();
  const eventIdFromQuery = search?.get('event_id') || '';
  const { createTask, loading } = useTaskStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [eventId, setEventId] = useState(eventIdFromQuery);
  const [dueDate, setDueDate] = useState('');

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data: any = { title, description, priority };
    if (eventId) data.event_id = eventId;
    if (dueDate) data.due_date = new Date(dueDate).toISOString();
    const created = await createTask(data);
    if (created) router.push('/dashboard/tasks');
  };

  return (
    <div className="max-w-xl bg-white rounded shadow p-4">
      <h1 className="text-xl font-semibold mb-4">Create Task</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <label className="block text-sm mb-1">Title</label>
          <input className="border rounded px-3 py-2 w-full" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm mb-1">Description</label>
          <textarea className="border rounded px-3 py-2 w-full" value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm mb-1">Priority</label>
            <select className="border rounded px-3 py-2 w-full" value={priority} onChange={(e) => setPriority(e.target.value)}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1">Connect to Event ID</label>
            <input className="border rounded px-3 py-2 w-full" value={eventId} onChange={(e) => setEventId(e.target.value)} placeholder="Optional" />
          </div>
        </div>
        <div>
          <label className="block text-sm mb-1">Due Date</label>
          <input type="datetime-local" className="border rounded px-3 py-2 w-full" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </div>
        <div className="pt-2">
          <button type="submit" disabled={loading} className="px-4 py-2 bg-primary text-white rounded disabled:opacity-50">Create</button>
        </div>
      </form>
    </div>
  );
}
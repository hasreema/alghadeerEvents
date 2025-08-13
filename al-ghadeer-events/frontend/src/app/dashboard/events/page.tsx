"use client";

import { useEffect, useState } from "react";
import useEventStore from "../../../store/useEventStore";

export default function EventsListPage() {
  const {
    events,
    totalEvents,
    loading,
    fetchEvents,
    setFilters,
    setPage,
    currentPage,
    pageSize,
  } = useEventStore();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [eventType, setEventType] = useState<string | undefined>(undefined);
  const [location, setLocation] = useState<string | undefined>(undefined);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const applyFilters = () => {
    setFilters({ search, status, event_type: eventType, location });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-2">
        <input
          className="border rounded px-3 py-2 w-full md:w-1/3"
          placeholder="Search events..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="border rounded px-3 py-2"
          value={status || ""}
          onChange={(e) => setStatus(e.target.value || undefined)}
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <input
          className="border rounded px-3 py-2"
          placeholder="Event type"
          value={eventType || ""}
          onChange={(e) => setEventType(e.target.value || undefined)}
        />
        <input
          className="border rounded px-3 py-2"
          placeholder="Location"
          value={location || ""}
          onChange={(e) => setLocation(e.target.value || undefined)}
        />
        <button
          onClick={applyFilters}
          className="px-4 py-2 bg-primary text-white rounded"
        >
          Filter
        </button>
      </div>

      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left">Event</th>
              <th className="px-4 py-2 text-left">Date</th>
              <th className="px-4 py-2 text-left">Type</th>
              <th className="px-4 py-2 text-left">Location</th>
              <th className="px-4 py-2 text-left">Guests</th>
              <th className="px-4 py-2 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {events.map((e) => (
              <tr key={e.id} className="border-t">
                <td className="px-4 py-2">
                  <a className="text-primary underline" href={`/dashboard/events/${e.id}`}>{e.event_name}</a>
                </td>
                <td className="px-4 py-2">{new Date(e.event_date).toLocaleString()}</td>
                <td className="px-4 py-2">{e.event_type}</td>
                <td className="px-4 py-2">{e.location}</td>
                <td className="px-4 py-2">{e.expected_guests}</td>
                <td className="px-4 py-2">
                  <span className="px-2 py-1 text-xs rounded bg-gray-100">{e.status}</span>
                </td>
              </tr>
            ))}
            {events.length === 0 && !loading && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
                  No events found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">Total: {totalEvents}</div>
        <div className="flex items-center gap-2">
          <button
            className="px-3 py-1 border rounded disabled:opacity-50"
            onClick={() => setPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            Prev
          </button>
          <span>Page {currentPage}</span>
          <button
            className="px-3 py-1 border rounded disabled:opacity-50"
            onClick={() => setPage(currentPage + 1)}
            disabled={events.length < pageSize}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
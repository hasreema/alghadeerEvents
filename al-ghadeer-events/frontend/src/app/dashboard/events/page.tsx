"use client";

import Link from "next/link";
import { useEffect } from "react";
import useEventStore from "../../../store/useEventStore";
import EventCalendar from "../../../components/calendar/EventCalendar";

export default function EventsCalendarPage() {
  const { fetchEvents } = useEventStore();

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Events Calendar</h1>
          <p className="text-gray-600 text-sm">Click a date to create an event, or click an event to view details.</p>
        </div>
        <Link href="/dashboard/events/create" className="px-4 py-2 bg-primary text-white rounded">
          New Event
        </Link>
      </div>

      <EventCalendar />
    </div>
  );
}
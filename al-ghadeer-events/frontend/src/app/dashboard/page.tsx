'use client';

import EventCalendar from '../../components/calendar/EventCalendar';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Calendar view of events</p>
      </div>
      <EventCalendar />
    </div>
  );
}
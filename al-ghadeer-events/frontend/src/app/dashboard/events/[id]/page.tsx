"use client";

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import useEventStore from '../../../../store/useEventStore';

export default function EventDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const { selectedEvent, fetchEvent, loading } = useEventStore();

  useEffect(() => {
    if (id) fetchEvent(id);
  }, [id, fetchEvent]);

  if (loading || !selectedEvent) {
    return <div className="p-4">Loading...</div>;
  }

  const e = selectedEvent;

  return (
    <div className="space-y-4">
      <div className="bg-white rounded shadow p-4">
        <h1 className="text-xl font-semibold">{e.event_name}</h1>
        <div className="grid md:grid-cols-2 gap-4 mt-4">
          <div>
            <div><span className="text-gray-500">Date:</span> {new Date(e.event_date).toLocaleString()}</div>
            <div><span className="text-gray-500">Type:</span> {e.event_type}</div>
            <div><span className="text-gray-500">Location:</span> {e.location}</div>
            <div><span className="text-gray-500">Guests:</span> {e.expected_guests}</div>
            <div><span className="text-gray-500">Status:</span> {e.status}</div>
          </div>
          <div>
            <div><span className="text-gray-500">Total Price:</span> {e.pricing.total_price}</div>
            <div><span className="text-gray-500">Deposit:</span> {e.deposit_amount}</div>
            <div><span className="text-gray-500">Outstanding:</span> {e.outstanding_balance}</div>
            <div><span className="text-gray-500">Profit:</span> {e.profit}</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded shadow p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Related Tasks</h2>
          <a className="px-3 py-1 bg-primary text-white rounded" href={`/dashboard/tasks/create?event_id=${e.id}`}>New Task</a>
        </div>
        <p className="text-gray-500 text-sm mt-2">Tasks list will appear here (connect tasks service/state or fetch by event).</p>
      </div>
    </div>
  );
}
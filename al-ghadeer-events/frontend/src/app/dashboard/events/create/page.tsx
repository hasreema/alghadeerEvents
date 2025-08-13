"use client";

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import useEventStore from '../../../../store/useEventStore';

export default function EventCreatePage() {
  const router = useRouter();
  const search = useSearchParams();
  const dateFromQuery = search?.get('date') || '';
  const { createEvent, loading } = useEventStore();

  const [event_name, setEventName] = useState('New Event');
  const [event_type, setEventType] = useState('Wedding');
  const [location, setLocation] = useState('Hall Floor 0');
  const [event_date, setEventDate] = useState('');
  const [start_time, setStartTime] = useState('18:00');
  const [end_time, setEndTime] = useState('23:00');
  const [expected_guests, setExpectedGuests] = useState(100);
  const [guest_gender, setGuestGender] = useState('mixed');
  const [deposit_amount, setDepositAmount] = useState(0);

  useEffect(() => {
    if (dateFromQuery && !event_date) {
      try {
        const d = new Date(dateFromQuery);
        if (!isNaN(d.getTime())) setEventDate(d.toISOString().slice(0, 16));
      } catch {}
    }
  }, [dateFromQuery, event_date]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload: any = {
      event_name,
      event_type,
      location,
      event_date: new Date(event_date).toISOString(),
      start_time,
      end_time,
      expected_guests,
      guest_gender,
      contacts: [],
      services: {},
      pricing: {
        base_price: 0,
        additional_services: {},
        discounts: 0,
        taxes: 0,
        total_price: 0,
      },
      deposit_amount,
      decoration_type: 'standard',
      menu_selections: {},
      dietary_restrictions: [],
    };

    const created = await createEvent(payload);
    if (created) router.push(`/dashboard/events/${created.id}`);
  };

  return (
    <div className="max-w-2xl bg-white rounded shadow p-4">
      <h1 className="text-xl font-semibold mb-4">Create Event</h1>
      <form onSubmit={onSubmit} className="grid gap-3 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="block text-sm mb-1">Event Name</label>
          <input className="border rounded px-3 py-2 w-full" value={event_name} onChange={(e) => setEventName(e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm mb-1">Event Type</label>
          <select className="border rounded px-3 py-2 w-full" value={event_type} onChange={(e) => setEventType(e.target.value)}>
            <option>Wedding</option>
            <option>Henna</option>
            <option>Engagement</option>
            <option>Graduation</option>
            <option>Other</option>
          </select>
        </div>
        <div>
          <label className="block text-sm mb-1">Location</label>
          <select className="border rounded px-3 py-2 w-full" value={location} onChange={(e) => setLocation(e.target.value)}>
            <option>Hall Floor 0</option>
            <option>Hall Floor 1</option>
            <option>Garden</option>
            <option>Waterfall</option>
          </select>
        </div>
        <div>
          <label className="block text-sm mb-1">Event Date</label>
          <input type="datetime-local" className="border rounded px-3 py-2 w-full" value={event_date} onChange={(e) => setEventDate(e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm mb-1">Start Time</label>
          <input className="border rounded px-3 py-2 w-full" value={start_time} onChange={(e) => setStartTime(e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm mb-1">End Time</label>
          <input className="border rounded px-3 py-2 w-full" value={end_time} onChange={(e) => setEndTime(e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm mb-1">Expected Guests</label>
          <input type="number" className="border rounded px-3 py-2 w-full" value={expected_guests} onChange={(e) => setExpectedGuests(parseInt(e.target.value || '0', 10))} required />
        </div>
        <div>
          <label className="block text-sm mb-1">Gender</label>
          <select className="border rounded px-3 py-2 w-full" value={guest_gender} onChange={(e) => setGuestGender(e.target.value)}>
            <option value="mixed">Mixed</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm mb-1">Deposit Amount</label>
          <input type="number" className="border rounded px-3 py-2 w-full" value={deposit_amount} onChange={(e) => setDepositAmount(parseFloat(e.target.value || '0'))} />
        </div>
        <div className="md:col-span-2 pt-2">
          <button type="submit" disabled={loading} className="px-4 py-2 bg-primary text-white rounded disabled:opacity-50">Create Event</button>
        </div>
      </form>
    </div>
  );
}
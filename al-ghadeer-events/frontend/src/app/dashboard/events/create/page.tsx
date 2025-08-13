"use client";

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import useEventStore from '../../../../store/useEventStore';

type Provider = 'Hall' | 'Client';

interface RequestItem {
  key: string; // sanitized key for mapping
  label: string;
  selected: boolean;
  cost: number;
  provider: Provider;
  quantity?: number; // for Cake
}

const DEFAULT_REQUESTS: RequestItem[] = [
  { key: 'dj', label: 'DJ', selected: false, cost: 0, provider: 'Hall' },
  { key: 'cake', label: 'Cake', selected: false, cost: 0, provider: 'Hall', quantity: 1 },
  { key: 'fruits', label: 'Fruits', selected: false, cost: 0, provider: 'Hall' },
  { key: 'nuts', label: 'Nuts', selected: false, cost: 0, provider: 'Hall' },
];

const sanitizeKey = (label: string) =>
  label.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');

export default function EventCreatePage() {
  const router = useRouter();
  const search = useSearchParams();
  const dateFromQuery = search?.get('date') || '';
  const { createEvent, loading, error } = useEventStore();

  // Core fields
  const [event_name, setEventName] = useState('New Event');
  const [event_type, setEventType] = useState('Wedding');
  const [event_type_other, setEventTypeOther] = useState('');

  const LOCATIONS = ['Hall Floor 0', 'Hall Floor 1', 'Garden', 'Waterfall'];
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [customLocation, setCustomLocation] = useState('');

  const [event_date, setEventDate] = useState('');
  const [start_time, setStartTime] = useState('18:00');
  const [end_time, setEndTime] = useState('23:00');
  const [expected_guests, setExpectedGuests] = useState(100);
  const [guest_gender, setGuestGender] = useState('mixed');

  // Contacts (multiple phones)
  const [phoneNumbers, setPhoneNumbers] = useState<string[]>(['']);

  // Pricing / Deposits (ILS)
  const [base_price, setBasePrice] = useState(0);
  const [deposit_total, setDepositTotal] = useState(0);
  const [paid_deposit_amount, setPaidDepositAmount] = useState(0);

  // Special requests
  const [requests, setRequests] = useState<RequestItem[]>(DEFAULT_REQUESTS);
  const [customRequests, setCustomRequests] = useState<RequestItem[]>([]);

  // Description
  const [description, setDescription] = useState('');

  // Expected guests per location or total fallback
  const [expectedGuestsTotal, setExpectedGuestsTotal] = useState(100);
  const [expectedGuestsByLocation, setExpectedGuestsByLocation] = useState<Record<string, number>>({});
  const perLocationKeys = useMemo(
    () => [...selectedLocations, ...(customLocation ? [customLocation] : [])],
    [selectedLocations, customLocation]
  );
  const setGuestsForLocation = (loc: string, val: number) =>
    setExpectedGuestsByLocation((prev) => ({ ...prev, [loc]: val }));
  const perLocationTotal = useMemo(
    () => perLocationKeys.reduce((sum, loc) => sum + (expectedGuestsByLocation[loc] || 0), 0),
    [perLocationKeys, expectedGuestsByLocation]
  );

  const allRequests = useMemo(() => [...requests, ...customRequests], [requests, customRequests]);

  useEffect(() => {
    if (dateFromQuery && !event_date) {
      try {
        const d = new Date(dateFromQuery);
        if (!isNaN(d.getTime())) setEventDate(d.toISOString().slice(0, 16));
      } catch {}
    }
  }, [dateFromQuery, event_date]);

  const toggleRequest = (arr: RequestItem[], idx: number, patch: Partial<RequestItem>, isCustom: boolean) => {
    const copy = [...arr];
    copy[idx] = { ...copy[idx], ...patch } as RequestItem;
    (isCustom ? setCustomRequests : setRequests)(copy);
  };

  const addCustomRequest = () => {
    const label = prompt('Enter custom request name');
    if (!label) return;
    const item: RequestItem = {
      key: sanitizeKey(label),
      label,
      selected: true,
      cost: 0,
      provider: 'Hall',
    };
    setCustomRequests((prev) => [...prev, item]);
  };

  const addPhone = () => setPhoneNumbers((p) => [...p, '']);
  const removePhone = (i: number) => setPhoneNumbers((p) => p.filter((_, idx) => idx !== i));
  const changePhone = (i: number, v: string) => setPhoneNumbers((p) => p.map((x, idx) => (idx === i ? v : x)));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Build services flags and additional service costs
    const services: Record<string, boolean> = {};
    const additional_services: Record<string, number> = {};

    const parts: string[] = [];

    allRequests.forEach((r) => {
      if (r.selected) {
        services[r.key] = true;
        if (r.cost && r.cost > 0) additional_services[r.key] = r.cost;
        let line = `${r.label}: ${r.provider}`;
        if (typeof r.quantity === 'number') line += `, Qty: ${r.quantity}`;
        if (r.cost && r.cost > 0) line += `, Cost: ${r.cost}₪`;
        parts.push(line);
      }
    });

    if (paid_deposit_amount > 0) parts.push(`Paid deposit: ${paid_deposit_amount}₪`);
    if (description.trim()) parts.push(`Notes: ${description.trim()}`);

    const locationStr = [...selectedLocations, customLocation].filter(Boolean).join(', ');

    const expectedGuests = perLocationKeys.length > 0 ? perLocationTotal : expectedGuestsTotal;

    const perLocationLines = perLocationKeys.length
      ? [`Guests per location: ${perLocationKeys.map((loc) => `${loc}: ${expectedGuestsByLocation[loc] || 0}`).join('; ')}`]
      : [];

    const payload: any = {
      event_name,
      event_type,
      ...(event_type === 'Other' && event_type_other ? { event_type_other } : {}),
      location: locationStr || 'Hall Floor 0',
      event_date: new Date(event_date).toISOString(),
      start_time,
      end_time,
      expected_guests: expectedGuests,
      guest_gender,
      contacts: phoneNumbers
        .filter((p) => p && p.trim())
        .map((p, idx) => ({ name: '', phone: p.trim(), is_primary: idx === 0 })),
      services,
      special_requests: parts.join(' | '),
      decoration_type: 'standard',
      menu_selections: {},
      dietary_restrictions: [],
      pricing: {
        base_price: base_price || 0,
        additional_services,
        discounts: 0,
        taxes: 0,
        total_price: (base_price || 0) + Object.values(additional_services).reduce((a, b) => a + b, 0),
      },
      deposit_amount: deposit_total || 0,
      internal_notes: perLocationLines.join(' | '),
    };

    const created = await createEvent(payload);
    if (created) router.push(`/dashboard/events/${created.id}`);
  };

  return (
    <div className="max-w-3xl bg-white rounded shadow p-4">
      <h1 className="text-xl font-semibold mb-4">Create Event</h1>
      <form onSubmit={onSubmit} className="grid gap-4 md:grid-cols-2">
        {/* Event name */}
        <div className="md:col-span-2">
          <label className="block text-sm mb-1">Event Name</label>
          <input className="border rounded px-3 py-2 w-full" value={event_name} onChange={(e) => setEventName(e.target.value)} required />
        </div>

        {/* Event type */}
        <div>
          <label className="block text-sm mb-1">Event Type</label>
          <select className="border rounded px-3 py-2 w-full" value={event_type} onChange={(e) => setEventType(e.target.value)}>
            <option>Wedding</option>
            <option>Henna</option>
            <option>Engagement</option>
            <option>Graduation</option>
            <option>Other</option>
          </select>
          {event_type === 'Other' && (
            <input className="mt-2 border rounded px-3 py-2 w-full" placeholder="Enter custom type" value={event_type_other} onChange={(e) => setEventTypeOther(e.target.value)} />
          )}
        </div>

        {/* Locations multi-select + custom */}
        <div>
          <label className="block text-sm mb-1">Location(s)</label>
          <select multiple className="border rounded px-3 py-2 w-full h-28" value={selectedLocations} onChange={(e) => setSelectedLocations(Array.from(e.target.selectedOptions).map((o) => o.value))}>
            {LOCATIONS.map((loc) => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
          <input className="mt-2 border rounded px-3 py-2 w-full" placeholder="Custom location (optional)" value={customLocation} onChange={(e) => setCustomLocation(e.target.value)} />
        </div>

        {/* Date & Time */}
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

        {/* Guests & Gender */}
        {perLocationKeys.length > 0 ? (
          <div className="md:col-span-2">
            <label className="block text-sm mb-1">Expected Guests per Location</label>
            <div className="grid gap-2">
              {perLocationKeys.map((loc) => (
                <div key={loc} className="flex items-center gap-2">
                  <span className="text-sm text-gray-700 w-40 truncate" title={loc}>{loc}</span>
                  <input
                    type="number"
                    className="border rounded px-3 py-2 w-full"
                    value={expectedGuestsByLocation[loc] || 0}
                    onChange={(e) => setGuestsForLocation(loc, parseInt(e.target.value || '0', 10))}
                  />
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-600 mt-2">Total Expected Guests: {perLocationTotal}</p>
          </div>
        ) : (
          <div>
            <label className="block text-sm mb-1">Expected Guests (Total)</label>
            <input
              type="number"
              className="border rounded px-3 py-2 w-full"
              value={expectedGuestsTotal}
              onChange={(e) => setExpectedGuestsTotal(parseInt(e.target.value || '0', 10))}
              required
            />
          </div>
        )}
        <div>
          <label className="block text-sm mb-1">Gender</label>
          <select className="border rounded px-3 py-2 w-full" value={guest_gender} onChange={(e) => setGuestGender(e.target.value)}>
            <option value="mixed">Mixed</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>

        {/* Phones */}
        <div className="md:col-span-2">
          <label className="block text-sm mb-1">Phone Numbers</label>
          <div className="space-y-2">
            {phoneNumbers.map((p, idx) => (
              <div key={idx} className="flex gap-2">
                <input className="border rounded px-3 py-2 w-full" placeholder="Phone number" value={p} onChange={(e) => changePhone(idx, e.target.value)} />
                {phoneNumbers.length > 1 && (
                  <button type="button" className="px-3 py-2 border rounded" onClick={() => removePhone(idx)}>Remove</button>
                )}
              </div>
            ))}
            <button type="button" className="px-3 py-2 border rounded" onClick={addPhone}>Add Phone</button>
          </div>
        </div>

        {/* Pricing / Deposits */}
        <div>
          <label className="block text-sm mb-1">Base Price (₪)</label>
          <input type="number" className="border rounded px-3 py-2 w-full" value={base_price} onChange={(e) => setBasePrice(parseFloat(e.target.value || '0'))} />
        </div>
        <div>
          <label className="block text-sm mb-1">Total Deposit (₪)</label>
          <input type="number" className="border rounded px-3 py-2 w-full" value={deposit_total} onChange={(e) => setDepositTotal(parseFloat(e.target.value || '0'))} />
        </div>
        <div>
          <label className="block text-sm mb-1">Paid Deposit (₪)</label>
          <input type="number" className="border rounded px-3 py-2 w-full" value={paid_deposit_amount} onChange={(e) => setPaidDepositAmount(parseFloat(e.target.value || '0'))} />
        </div>

        {/* Special Requests */}
        <div className="md:col-span-2">
          <label className="block text-sm mb-2">Special Requests / Additions</label>
          <div className="grid gap-3">
            {requests.map((r, idx) => (
              <div key={r.key} className="border rounded p-3">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={r.selected} onChange={(e) => toggleRequest(requests, idx, { selected: e.target.checked }, false)} />
                  <span>{r.label}</span>
                </label>
                {r.selected && (
                  <div className="mt-2 grid gap-2 md:grid-cols-3">
                    {r.label === 'Cake' && (
                      <div>
                        <span className="block text-xs text-gray-600 mb-1">Quantity</span>
                        <input type="number" className="border rounded px-2 py-1 w-full" value={r.quantity || 1} onChange={(e) => toggleRequest(requests, idx, { quantity: parseInt(e.target.value || '1', 10) }, false)} />
                      </div>
                    )}
                    <div>
                      <span className="block text-xs text-gray-600 mb-1">Cost (₪)</span>
                      <input type="number" className="border rounded px-2 py-1 w-full" value={r.cost} onChange={(e) => toggleRequest(requests, idx, { cost: parseFloat(e.target.value || '0') }, false)} />
                    </div>
                    <div>
                      <span className="block text-xs text-gray-600 mb-1">Provider</span>
                      <select className="border rounded px-2 py-1 w-full" value={r.provider} onChange={(e) => toggleRequest(requests, idx, { provider: e.target.value as Provider }, false)}>
                        <option value="Hall">Hall</option>
                        <option value="Client">Client</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {customRequests.map((r, idx) => (
              <div key={`custom_${idx}`} className="border rounded p-3">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={r.selected} onChange={(e) => toggleRequest(customRequests, idx, { selected: e.target.checked }, true)} />
                  <input className="border rounded px-2 py-1 flex-1" value={r.label} onChange={(e) => toggleRequest(customRequests, idx, { label: e.target.value, key: sanitizeKey(e.target.value) }, true)} />
                </label>
                {r.selected && (
                  <div className="mt-2 grid gap-2 md:grid-cols-2">
                    <div>
                      <span className="block text-xs text-gray-600 mb-1">Cost (₪)</span>
                      <input type="number" className="border rounded px-2 py-1 w-full" value={r.cost} onChange={(e) => toggleRequest(customRequests, idx, { cost: parseFloat(e.target.value || '0') }, true)} />
                    </div>
                    <div>
                      <span className="block text-xs text-gray-600 mb-1">Provider</span>
                      <select className="border rounded px-2 py-1 w-full" value={r.provider} onChange={(e) => toggleRequest(customRequests, idx, { provider: e.target.value as Provider }, true)}>
                        <option value="Hall">Hall</option>
                        <option value="Client">Client</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            ))}

            <button type="button" className="px-3 py-2 border rounded" onClick={addCustomRequest}>Add Custom Request</button>
          </div>
        </div>

        {/* Description */}
        <div className="md:col-span-2">
          <label className="block text-sm mb-1">Description / Notes</label>
          <textarea className="border rounded px-3 py-2 w-full" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>

        {/* Submit */}
        <div className="md:col-span-2 pt-2">
          <button type="submit" disabled={loading} className="px-4 py-2 bg-primary text-white rounded disabled:opacity-50 w-full md:w-auto">Create Event</button>
        </div>

        {/* Error */}
        {error && (
          <div className="md:col-span-2 text-sm text-red-600">{error}</div>
        )}
      </form>
    </div>
  );
}
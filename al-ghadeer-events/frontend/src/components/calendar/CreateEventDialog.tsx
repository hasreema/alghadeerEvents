"use client";

import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import Link from 'next/link';

export default function CreateEventDialog({ open, onClose, defaultDate }: { open: boolean; onClose: () => void; defaultDate: Date | null; }) {
  const dateParam = defaultDate ? `?date=${encodeURIComponent(defaultDate.toISOString())}` : '';
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Create Event</DialogTitle>
      <DialogContent>
        <p>Proceed to create a new event for the selected date.</p>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button component={Link as any} href={`/dashboard/events/create${dateParam}`} variant="contained">Continue</Button>
      </DialogActions>
    </Dialog>
  );
}
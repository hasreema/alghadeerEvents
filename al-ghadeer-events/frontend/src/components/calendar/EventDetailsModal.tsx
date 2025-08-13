"use client";

import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import Link from 'next/link';

export default function EventDetailsModal({ eventId, open, onClose }: { eventId: string; open: boolean; onClose: () => void; }) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Event Details</DialogTitle>
      <DialogContent>
        <p>View full details or edit the event.</p>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button component={Link as any} href={`/dashboard/events/${eventId}`} variant="contained">Open</Button>
      </DialogActions>
    </Dialog>
  );
}
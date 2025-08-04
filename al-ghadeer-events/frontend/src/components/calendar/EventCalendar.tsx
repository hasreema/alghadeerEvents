'use client';

import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { EventDropArg, EventClickArg, DateSelectArg } from '@fullcalendar/core';
import { Box, Paper, Typography, Chip, CircularProgress, Alert } from '@mui/material';
import { format } from 'date-fns';
import useEventStore from '../../store/useEventStore';
import eventService from '../../services/events/eventService';
import EventDetailsModal from './EventDetailsModal';
import CreateEventDialog from './CreateEventDialog';

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  backgroundColor?: string;
  borderColor?: string;
  extendedProps: {
    status: string;
    location: string;
    guestCount: number;
    customerName: string;
    paymentStatus: string;
  };
}

const statusColors = {
  pending: '#FFA726',
  confirmed: '#66BB6A',
  in_progress: '#42A5F5',
  completed: '#9E9E9E',
  cancelled: '#EF5350',
};

const EventCalendar: React.FC = () => {
  const { events, loading, error, fetchEvents } = useEventStore();
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [updating, setUpdating] = useState(false);

  // Convert events to calendar format
  useEffect(() => {
    const formattedEvents: CalendarEvent[] = events.map(event => ({
      id: event.id,
      title: `${event.event_name} - ${event.customer_name}`,
      start: `${event.event_date}T${event.start_time}`,
      end: `${event.event_date}T${event.end_time}`,
      backgroundColor: statusColors[event.status],
      borderColor: statusColors[event.status],
      extendedProps: {
        status: event.status,
        location: event.location,
        guestCount: event.guest_count,
        customerName: event.customer_name,
        paymentStatus: event.payment_status,
      },
    }));
    setCalendarEvents(formattedEvents);
  }, [events]);

  // Handle event drop (drag & drop)
  const handleEventDrop = async (info: EventDropArg) => {
    const { event } = info;
    const newDate = format(event.start!, 'yyyy-MM-dd');
    const newStartTime = format(event.start!, 'HH:mm:ss');
    const newEndTime = format(event.end!, 'HH:mm:ss');

    setUpdating(true);
    try {
      await eventService.updateEventDate(
        event.id,
        newDate,
        newStartTime,
        newEndTime
      );
      
      // Refresh events
      await fetchEvents();
    } catch (error) {
      // Revert the change
      info.revert();
      console.error('Failed to update event date:', error);
    } finally {
      setUpdating(false);
    }
  };

  // Handle event click
  const handleEventClick = (info: EventClickArg) => {
    setSelectedEvent(info.event.id);
  };

  // Handle date selection
  const handleDateSelect = (info: DateSelectArg) => {
    setSelectedDate(info.start);
    setCreateDialogOpen(true);
  };

  // Event content renderer
  const renderEventContent = (eventInfo: any) => {
    const { event } = eventInfo;
    return (
      <Box sx={{ p: 0.5, overflow: 'hidden' }}>
        <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block' }}>
          {event.extendedProps.customerName}
        </Typography>
        <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
          {event.extendedProps.location} • {event.extendedProps.guestCount} guests
        </Typography>
        {event.extendedProps.paymentStatus === 'overdue' && (
          <Chip 
            label="Payment Due" 
            size="small" 
            color="error" 
            sx={{ height: 16, fontSize: '0.65rem', mt: 0.5 }}
          />
        )}
      </Box>
    );
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="600px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 3, height: 'calc(100vh - 200px)' }}>
      {updating && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            zIndex: 1000,
          }}
        >
          <CircularProgress />
        </Box>
      )}
      
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        }}
        events={calendarEvents}
        editable={true}
        droppable={true}
        selectable={true}
        selectMirror={true}
        eventDrop={handleEventDrop}
        eventClick={handleEventClick}
        select={handleDateSelect}
        eventContent={renderEventContent}
        height="100%"
        eventDisplay="block"
        dayMaxEvents={3}
        weekends={true}
        businessHours={{
          daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
          startTime: '08:00',
          endTime: '23:00',
        }}
        slotMinTime="06:00"
        slotMaxTime="24:00"
        slotDuration="00:30:00"
        nowIndicator={true}
        eventTimeFormat={{
          hour: '2-digit',
          minute: '2-digit',
          meridiem: 'short',
        }}
      />

      {/* Event Details Modal */}
      {selectedEvent && (
        <EventDetailsModal
          eventId={selectedEvent}
          open={!!selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}

      {/* Create Event Dialog */}
      <CreateEventDialog
        open={createDialogOpen}
        onClose={() => {
          setCreateDialogOpen(false);
          setSelectedDate(null);
        }}
        defaultDate={selectedDate}
      />
    </Paper>
  );
};

export default EventCalendar;
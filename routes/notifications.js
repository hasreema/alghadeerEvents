const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const { sendEmail } = require('../services/emailService');
const { sendWhatsApp } = require('../services/whatsappService');
const { sendPushNotification } = require('../services/pushNotificationService');

// Send email notification
router.post('/email', [
  body('to').isEmail().withMessage('Valid email address is required'),
  body('subject').notEmpty().withMessage('Subject is required'),
  body('body').notEmpty().withMessage('Email body is required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { to, subject, body, attachments } = req.body;
    
    const result = await sendEmail({
      to,
      subject,
      body,
      attachments
    });
    
    res.json({
      message: 'Email sent successfully',
      result
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Send WhatsApp notification
router.post('/whatsapp', [
  body('to').notEmpty().withMessage('Phone number is required'),
  body('message').notEmpty().withMessage('Message is required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { to, message } = req.body;
    
    const result = await sendWhatsApp({
      to,
      message
    });
    
    res.json({
      message: 'WhatsApp message sent successfully',
      result
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Send push notification
router.post('/push', [
  body('title').notEmpty().withMessage('Notification title is required'),
  body('body').notEmpty().withMessage('Notification body is required'),
  body('recipients').isArray().withMessage('Recipients must be an array'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { title, body, recipients, data } = req.body;
    
    const result = await sendPushNotification({
      title,
      body,
      recipients,
      data
    });
    
    res.json({
      message: 'Push notification sent successfully',
      result
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Send payment reminder
router.post('/payment-reminder', [
  body('eventId').isMongoId().withMessage('Valid event ID is required'),
  body('type').isIn(['email', 'whatsapp', 'push', 'all']).withMessage('Invalid notification type'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { eventId, type, customMessage } = req.body;
    
    // Get event details
    const Event = require('../models/Event');
    const Payment = require('../models/Payment');
    
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    const payments = await Payment.find({ eventId });
    const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
    const outstandingBalance = event.totalCost - totalPaid;
    
    if (outstandingBalance <= 0) {
      return res.status(400).json({ error: 'No outstanding balance for this event' });
    }
    
    const message = customMessage || `Reminder: Outstanding balance of ₪${outstandingBalance.toLocaleString()} for event "${event.eventName}"`;
    
    const results = {};
    
    if (type === 'email' || type === 'all') {
      try {
        results.email = await sendEmail({
          to: 'alghadeerevents@gmail.com',
          subject: `Payment Reminder - ${event.eventName}`,
          body: `
            Event: ${event.eventName}
            Date: ${event.eventDate.toLocaleDateString()}
            Outstanding Balance: ₪${outstandingBalance.toLocaleString()}
            Total Cost: ₪${event.totalCost.toLocaleString()}
            Amount Paid: ₪${totalPaid.toLocaleString()}
            
            ${message}
          `
        });
      } catch (error) {
        results.email = { error: error.message };
      }
    }
    
    if (type === 'whatsapp' || type === 'all') {
      try {
        results.whatsapp = await sendWhatsApp({
          to: '+970595781722',
          message: `Payment Reminder: ${event.eventName} - Outstanding: ₪${outstandingBalance.toLocaleString()}`
        });
      } catch (error) {
        results.whatsapp = { error: error.message };
      }
    }
    
    if (type === 'push' || type === 'all') {
      try {
        results.push = await sendPushNotification({
          title: 'Payment Reminder',
          body: message,
          recipients: ['all'], // Would be configured based on user preferences
          data: {
            eventId,
            outstandingBalance,
            eventName: event.eventName
          }
        });
      } catch (error) {
        results.push = { error: error.message };
      }
    }
    
    res.json({
      message: 'Payment reminder sent successfully',
      results,
      event: {
        eventName: event.eventName,
        eventDate: event.eventDate,
        totalCost: event.totalCost,
        totalPaid,
        outstandingBalance
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Send reminder notification
router.post('/reminder-notification', [
  body('reminderId').isMongoId().withMessage('Valid reminder ID is required'),
  body('type').isIn(['email', 'whatsapp', 'push', 'all']).withMessage('Invalid notification type'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { reminderId, type, customMessage } = req.body;
    
    // Get reminder details
    const Reminder = require('../models/Reminder');
    
    const reminder = await Reminder.findById(reminderId).populate('eventId');
    if (!reminder) {
      return res.status(404).json({ error: 'Reminder not found' });
    }
    
    const message = customMessage || `Reminder: ${reminder.title} - ${reminder.description || ''}`;
    
    const results = {};
    
    if (type === 'email' || type === 'all') {
      try {
        results.email = await sendEmail({
          to: 'alghadeerevents@gmail.com',
          subject: `Reminder: ${reminder.title}`,
          body: `
            Reminder: ${reminder.title}
            Description: ${reminder.description || 'No description'}
            Assignee: ${reminder.assignee}
            Due Date: ${reminder.reminderDate.toLocaleDateString()}
            ${reminder.eventId ? `Event: ${reminder.eventId.eventName}` : ''}
            
            ${message}
          `
        });
      } catch (error) {
        results.email = { error: error.message };
      }
    }
    
    if (type === 'whatsapp' || type === 'all') {
      try {
        results.whatsapp = await sendWhatsApp({
          to: '+970595781722',
          message: `Reminder: ${reminder.title} - Due: ${reminder.reminderDate.toLocaleDateString()}`
        });
      } catch (error) {
        results.whatsapp = { error: error.message };
      }
    }
    
    if (type === 'push' || type === 'all') {
      try {
        results.push = await sendPushNotification({
          title: 'Reminder',
          body: message,
          recipients: ['all'], // Would be configured based on user preferences
          data: {
            reminderId,
            title: reminder.title,
            assignee: reminder.assignee
          }
        });
      } catch (error) {
        results.push = { error: error.message };
      }
    }
    
    res.json({
      message: 'Reminder notification sent successfully',
      results,
      reminder: {
        title: reminder.title,
        description: reminder.description,
        assignee: reminder.assignee,
        reminderDate: reminder.reminderDate,
        eventName: reminder.eventId ? reminder.eventId.eventName : null
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Send event notification
router.post('/event-notification', [
  body('eventId').isMongoId().withMessage('Valid event ID is required'),
  body('type').isIn(['email', 'whatsapp', 'push', 'all']).withMessage('Invalid notification type'),
  body('notificationType').isIn(['upcoming', 'completed', 'cancelled']).withMessage('Invalid notification type'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { eventId, type, notificationType, customMessage } = req.body;
    
    // Get event details
    const Event = require('../models/Event');
    
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    let title, message;
    
    switch (notificationType) {
      case 'upcoming':
        title = 'Upcoming Event';
        message = customMessage || `Reminder: Event "${event.eventName}" is scheduled for ${event.eventDate.toLocaleDateString()}`;
        break;
      case 'completed':
        title = 'Event Completed';
        message = customMessage || `Event "${event.eventName}" has been completed successfully`;
        break;
      case 'cancelled':
        title = 'Event Cancelled';
        message = customMessage || `Event "${event.eventName}" has been cancelled`;
        break;
    }
    
    const results = {};
    
    if (type === 'email' || type === 'all') {
      try {
        results.email = await sendEmail({
          to: 'alghadeerevents@gmail.com',
          subject: `${title} - ${event.eventName}`,
          body: `
            ${title}: ${event.eventName}
            Date: ${event.eventDate.toLocaleDateString()}
            Location: ${event.location}
            Type: ${event.eventType}
            Guest Count: ${event.guestCount}
            
            ${message}
          `
        });
      } catch (error) {
        results.email = { error: error.message };
      }
    }
    
    if (type === 'whatsapp' || type === 'all') {
      try {
        results.whatsapp = await sendWhatsApp({
          to: '+970595781722',
          message: `${title}: ${event.eventName} - ${event.eventDate.toLocaleDateString()}`
        });
      } catch (error) {
        results.whatsapp = { error: error.message };
      }
    }
    
    if (type === 'push' || type === 'all') {
      try {
        results.push = await sendPushNotification({
          title,
          body: message,
          recipients: ['all'], // Would be configured based on user preferences
          data: {
            eventId,
            eventName: event.eventName,
            eventDate: event.eventDate,
            notificationType
          }
        });
      } catch (error) {
        results.push = { error: error.message };
      }
    }
    
    res.json({
      message: 'Event notification sent successfully',
      results,
      event: {
        eventName: event.eventName,
        eventDate: event.eventDate,
        location: event.location,
        eventType: event.eventType,
        guestCount: event.guestCount
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get notification history
router.get('/history', async (req, res) => {
  try {
    const { page = 1, limit = 10, type, startDate, endDate } = req.query;
    
    // This would typically query a notification history collection
    // For now, return a mock response
    const notifications = [
      {
        id: '1',
        type: 'email',
        title: 'Payment Reminder',
        recipient: 'alghadeerevents@gmail.com',
        status: 'sent',
        sentAt: new Date(),
        eventName: 'Sample Event'
      }
    ];
    
    res.json({
      notifications,
      totalPages: 1,
      currentPage: page,
      total: notifications.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Test notification service
router.post('/test', async (req, res) => {
  try {
    const { type } = req.body;
    
    const results = {};
    
    if (type === 'email' || type === 'all') {
      try {
        results.email = await sendEmail({
          to: 'alghadeerevents@gmail.com',
          subject: 'Test Notification - Al Ghadeer Events',
          body: 'This is a test notification from the Al Ghadeer Events Management System.'
        });
      } catch (error) {
        results.email = { error: error.message };
      }
    }
    
    if (type === 'whatsapp' || type === 'all') {
      try {
        results.whatsapp = await sendWhatsApp({
          to: '+970595781722',
          message: 'Test notification from Al Ghadeer Events Management System'
        });
      } catch (error) {
        results.whatsapp = { error: error.message };
      }
    }
    
    if (type === 'push' || type === 'all') {
      try {
        results.push = await sendPushNotification({
          title: 'Test Notification',
          body: 'This is a test push notification',
          recipients: ['all'],
          data: { test: true }
        });
      } catch (error) {
        results.push = { error: error.message };
      }
    }
    
    res.json({
      message: 'Test notifications sent',
      results
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
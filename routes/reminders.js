const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const Reminder = require('../models/Reminder');

// Get all reminders
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, status, assignee, eventId, dateFrom, dateTo } = req.query;
    
    let query = {};
    
    if (status) query.status = status;
    if (assignee) query.assignee = { $regex: assignee, $options: 'i' };
    if (eventId) query.eventId = eventId;
    if (dateFrom || dateTo) {
      query.reminderDate = {};
      if (dateFrom) query.reminderDate.$gte = new Date(dateFrom);
      if (dateTo) query.reminderDate.$lte = new Date(dateTo);
    }
    
    const reminders = await Reminder.find(query)
      .populate('eventId', 'eventName eventDate')
      .sort({ reminderDate: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Reminder.countDocuments(query);
    
    res.json({
      reminders,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single reminder
router.get('/:id', async (req, res) => {
  try {
    const reminder = await Reminder.findById(req.params.id)
      .populate('eventId', 'eventName eventDate');
    
    if (!reminder) {
      return res.status(404).json({ error: 'Reminder not found' });
    }
    
    res.json(reminder);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new reminder
router.post('/', [
  body('title').notEmpty().withMessage('Reminder title is required'),
  body('description').optional().notEmpty().withMessage('Description cannot be empty if provided'),
  body('eventId').optional().isMongoId().withMessage('Valid event ID is required if provided'),
  body('reminderDate').isISO8601().withMessage('Valid reminder date is required'),
  body('assignee').notEmpty().withMessage('Assignee is required'),
  body('reminderType').isIn(['one-time', 'recurring']).withMessage('Invalid reminder type'),
  body('recurrencePattern').optional().isIn(['daily', 'weekly', 'monthly', 'yearly']).withMessage('Invalid recurrence pattern'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const {
      title,
      description,
      eventId,
      reminderDate,
      assignee,
      reminderType,
      recurrencePattern,
      notes
    } = req.body;
    
    // Validate eventId if provided
    if (eventId) {
      const Event = require('../models/Event');
      const event = await Event.findById(eventId);
      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }
    }
    
    // Validate recurrence pattern for recurring reminders
    if (reminderType === 'recurring' && !recurrencePattern) {
      return res.status(400).json({ error: 'Recurrence pattern is required for recurring reminders' });
    }
    
    const reminder = new Reminder({
      title,
      description,
      eventId,
      reminderDate: new Date(reminderDate),
      assignee,
      reminderType,
      recurrencePattern,
      notes,
      status: 'pending'
    });
    
    await reminder.save();
    
    // Populate event details for response
    if (eventId) {
      await reminder.populate('eventId', 'eventName eventDate');
    }
    
    res.status(201).json(reminder);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update reminder
router.put('/:id', [
  body('title').optional().notEmpty().withMessage('Reminder title cannot be empty'),
  body('description').optional().notEmpty().withMessage('Description cannot be empty if provided'),
  body('reminderDate').optional().isISO8601().withMessage('Valid reminder date is required'),
  body('assignee').optional().notEmpty().withMessage('Assignee cannot be empty'),
  body('recurrencePattern').optional().isIn(['daily', 'weekly', 'monthly', 'yearly']).withMessage('Invalid recurrence pattern'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const reminder = await Reminder.findById(req.params.id);
    if (!reminder) {
      return res.status(404).json({ error: 'Reminder not found' });
    }
    
    // Update fields
    Object.keys(req.body).forEach(key => {
      if (key !== 'status') { // Don't allow direct status updates
        reminder[key] = req.body[key];
      }
    });
    
    await reminder.save();
    
    // Populate event details for response
    if (reminder.eventId) {
      await reminder.populate('eventId', 'eventName eventDate');
    }
    
    res.json(reminder);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mark reminder as completed
router.patch('/:id/complete', async (req, res) => {
  try {
    const reminder = await Reminder.findById(req.params.id);
    if (!reminder) {
      return res.status(404).json({ error: 'Reminder not found' });
    }
    
    reminder.status = 'completed';
    reminder.completedAt = new Date();
    await reminder.save();
    
    // Populate event details for response
    if (reminder.eventId) {
      await reminder.populate('eventId', 'eventName eventDate');
    }
    
    res.json({
      message: 'Reminder marked as completed successfully',
      reminder
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mark reminder as cancelled
router.patch('/:id/cancel', async (req, res) => {
  try {
    const reminder = await Reminder.findById(req.params.id);
    if (!reminder) {
      return res.status(404).json({ error: 'Reminder not found' });
    }
    
    reminder.status = 'cancelled';
    reminder.cancelledAt = new Date();
    await reminder.save();
    
    // Populate event details for response
    if (reminder.eventId) {
      await reminder.populate('eventId', 'eventName eventDate');
    }
    
    res.json({
      message: 'Reminder cancelled successfully',
      reminder
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete reminder
router.delete('/:id', async (req, res) => {
  try {
    const reminder = await Reminder.findById(req.params.id);
    if (!reminder) {
      return res.status(404).json({ error: 'Reminder not found' });
    }
    
    await Reminder.findByIdAndDelete(req.params.id);
    res.json({ message: 'Reminder deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get reminders by event
router.get('/event/:eventId', async (req, res) => {
  try {
    const reminders = await Reminder.find({ eventId: req.params.eventId })
      .populate('eventId', 'eventName eventDate')
      .sort({ reminderDate: 1 });
    
    const pendingCount = reminders.filter(r => r.status === 'pending').length;
    const completedCount = reminders.filter(r => r.status === 'completed').length;
    const cancelledCount = reminders.filter(r => r.status === 'cancelled').length;
    
    res.json({
      reminders,
      summary: {
        total: reminders.length,
        pending: pendingCount,
        completed: completedCount,
        cancelled: cancelledCount
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get overdue reminders
router.get('/overdue/reminders', async (req, res) => {
  try {
    const overdueReminders = await Reminder.find({
      reminderDate: { $lt: new Date() },
      status: 'pending'
    }).populate('eventId', 'eventName eventDate');
    
    res.json(overdueReminders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get upcoming reminders
router.get('/upcoming/reminders', async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + parseInt(days));
    
    const upcomingReminders = await Reminder.find({
      reminderDate: {
        $gte: new Date(),
        $lte: futureDate
      },
      status: 'pending'
    }).populate('eventId', 'eventName eventDate');
    
    res.json(upcomingReminders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get reminders by assignee
router.get('/assignee/:assignee', async (req, res) => {
  try {
    const reminders = await Reminder.find({
      assignee: { $regex: req.params.assignee, $options: 'i' }
    })
    .populate('eventId', 'eventName eventDate')
    .sort({ reminderDate: 1 });
    
    res.json(reminders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get reminder statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter.reminderDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const stats = await Reminder.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: null,
          totalReminders: { $sum: 1 },
          pendingCount: {
            $sum: {
              $cond: [{ $eq: ['$status', 'pending'] }, 1, 0]
            }
          },
          completedCount: {
            $sum: {
              $cond: [{ $eq: ['$status', 'completed'] }, 1, 0]
            }
          },
          cancelledCount: {
            $sum: {
              $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0]
            }
          },
          overdueCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $lt: ['$reminderDate', new Date()] },
                    { $eq: ['$status', 'pending'] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      }
    ]);
    
    res.json(stats[0] || {
      totalReminders: 0,
      pendingCount: 0,
      completedCount: 0,
      cancelledCount: 0,
      overdueCount: 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
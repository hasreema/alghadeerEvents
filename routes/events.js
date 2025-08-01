const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const Event = require('../models/Event');
const Payment = require('../models/Payment');
const Employee = require('../models/Employee');

// Get all events
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, status, type, location, dateFrom, dateTo } = req.query;
    
    let query = {};
    
    if (status) query.status = status;
    if (type) query.eventType = type;
    if (location) query.location = location;
    if (dateFrom || dateTo) {
      query.eventDate = {};
      if (dateFrom) query.eventDate.$gte = new Date(dateFrom);
      if (dateTo) query.eventDate.$lte = new Date(dateTo);
    }
    
    const events = await Event.find(query)
      .sort({ eventDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('payments')
      .populate('employees');
    
    const total = await Event.countDocuments(query);
    
    res.json({
      events,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single event with full details
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('payments')
      .populate('employees');
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    // Calculate profitability
    const totalIncome = event.payments.reduce((sum, payment) => sum + payment.amount, 0);
    const totalLaborCost = event.employees.reduce((sum, emp) => sum + emp.wage, 0);
    const totalExtrasCost = event.additionalRequests.reduce((sum, req) => {
      return sum + (req.providedBy === 'hall' ? req.cost : 0);
    }, 0);
    const decorationCost = event.decoration.type === 'customized' ? event.decoration.cost : 0;
    
    const totalExpenses = totalLaborCost + totalExtrasCost + decorationCost;
    const netProfit = totalIncome - totalExpenses;
    const profitabilityPercentage = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0;
    
    const eventWithProfitability = {
      ...event.toObject(),
      profitability: {
        totalIncome,
        totalExpenses,
        netProfit,
        profitabilityPercentage: Math.round(profitabilityPercentage * 100) / 100
      }
    };
    
    res.json(eventWithProfitability);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new event
router.post('/', [
  body('eventName').notEmpty().withMessage('Event name is required'),
  body('eventType').isIn(['wedding', 'henna', 'engagement', 'graduation', 'other']).withMessage('Invalid event type'),
  body('eventDate').isISO8601().withMessage('Valid event date is required'),
  body('location').isIn(['Hall Floor 0', 'Hall Floor 1', 'Garden', 'Waterfall']).withMessage('Invalid location'),
  body('gender').isIn(['Men', 'Women', 'Mixed']).withMessage('Invalid gender selection'),
  body('guestCount').isInt({ min: 1 }).withMessage('Guest count must be at least 1'),
  body('basePrice').isFloat({ min: 0 }).withMessage('Base price must be positive'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const {
      eventName,
      eventType,
      eventDate,
      location,
      gender,
      guestCount,
      basePrice,
      additionalRequests = [],
      decoration = { type: 'standard', cost: 0 },
      notes = ''
    } = req.body;
    
    // Calculate total cost
    const additionalCosts = additionalRequests.reduce((sum, req) => sum + req.cost, 0);
    const decorationCost = decoration.type === 'customized' ? decoration.cost : 0;
    const totalCost = basePrice + additionalCosts + decorationCost;
    
    const event = new Event({
      eventName,
      eventType,
      eventDate: new Date(eventDate),
      location,
      gender,
      guestCount,
      basePrice,
      totalCost,
      additionalRequests,
      decoration,
      notes,
      status: 'scheduled'
    });
    
    await event.save();
    
    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update event
router.put('/:id', [
  body('eventName').optional().notEmpty().withMessage('Event name cannot be empty'),
  body('eventType').optional().isIn(['wedding', 'henna', 'engagement', 'graduation', 'other']).withMessage('Invalid event type'),
  body('eventDate').optional().isISO8601().withMessage('Valid event date is required'),
  body('location').optional().isIn(['Hall Floor 0', 'Hall Floor 1', 'Garden', 'Waterfall']).withMessage('Invalid location'),
  body('gender').optional().isIn(['Men', 'Women', 'Mixed']).withMessage('Invalid gender selection'),
  body('guestCount').optional().isInt({ min: 1 }).withMessage('Guest count must be at least 1'),
  body('basePrice').optional().isFloat({ min: 0 }).withMessage('Base price must be positive'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    // Update fields
    Object.keys(req.body).forEach(key => {
      if (key !== 'totalCost') { // Don't allow direct totalCost updates
        event[key] = req.body[key];
      }
    });
    
    // Recalculate total cost if pricing changed
    if (req.body.basePrice || req.body.additionalRequests || req.body.decoration) {
      const additionalCosts = event.additionalRequests.reduce((sum, req) => sum + req.cost, 0);
      const decorationCost = event.decoration.type === 'customized' ? event.decoration.cost : 0;
      event.totalCost = event.basePrice + additionalCosts + decorationCost;
    }
    
    await event.save();
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete event
router.delete('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    // Check if event has payments
    const payments = await Payment.find({ eventId: req.params.id });
    if (payments.length > 0) {
      return res.status(400).json({ error: 'Cannot delete event with existing payments' });
    }
    
    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get event statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        eventDate: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      };
    }
    
    const events = await Event.find(dateFilter).populate('payments');
    
    const stats = {
      totalEvents: events.length,
      totalRevenue: 0,
      totalExpenses: 0,
      totalProfit: 0,
      eventsByType: {},
      eventsByLocation: {},
      upcomingEvents: 0,
      completedEvents: 0
    };
    
    events.forEach(event => {
      const payments = event.payments || [];
      const totalIncome = payments.reduce((sum, payment) => sum + payment.amount, 0);
      stats.totalRevenue += totalIncome;
      
      // Calculate expenses (simplified - would need employee data)
      const estimatedExpenses = event.totalCost * 0.6; // Rough estimate
      stats.totalExpenses += estimatedExpenses;
      
      // Count by type
      stats.eventsByType[event.eventType] = (stats.eventsByType[event.eventType] || 0) + 1;
      
      // Count by location
      stats.eventsByLocation[event.location] = (stats.eventsByLocation[event.location] || 0) + 1;
      
      // Count upcoming vs completed
      if (event.eventDate > new Date()) {
        stats.upcomingEvents++;
      } else {
        stats.completedEvents++;
      }
    });
    
    stats.totalProfit = stats.totalRevenue - stats.totalExpenses;
    
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
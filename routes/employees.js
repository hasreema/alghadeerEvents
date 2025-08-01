const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const Employee = require('../models/Employee');
const Event = require('../models/Event');

// Get all employees
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, eventId, status, role, dateFrom, dateTo } = req.query;
    
    let query = {};
    
    if (eventId) query.eventId = eventId;
    if (status) query.paymentStatus = status;
    if (role) query.role = { $regex: role, $options: 'i' };
    if (dateFrom || dateTo) {
      query.paymentDate = {};
      if (dateFrom) query.paymentDate.$gte = new Date(dateFrom);
      if (dateTo) query.paymentDate.$lte = new Date(dateTo);
    }
    
    const employees = await Employee.find(query)
      .populate('eventId', 'eventName eventDate')
      .sort({ paymentDate: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Employee.countDocuments(query);
    
    res.json({
      employees,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single employee
router.get('/:id', async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id)
      .populate('eventId', 'eventName eventDate totalCost');
    
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    
    res.json(employee);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new employee
router.post('/', [
  body('eventId').isMongoId().withMessage('Valid event ID is required'),
  body('name').notEmpty().withMessage('Employee name is required'),
  body('role').notEmpty().withMessage('Employee role is required'),
  body('wage').isFloat({ min: 0 }).withMessage('Wage must be a positive number'),
  body('paymentDate').isISO8601().withMessage('Valid payment date is required'),
  body('phoneNumber').optional().matches(/^[\+]?[1-9][\d]{0,15}$/).withMessage('Please enter a valid phone number'),
  body('email').optional().isEmail().withMessage('Please enter a valid email address'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const {
      eventId,
      name,
      role,
      wage,
      paymentDate,
      phoneNumber,
      email,
      notes
    } = req.body;
    
    // Check if event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    const employee = new Employee({
      eventId,
      name,
      role,
      wage,
      paymentDate: new Date(paymentDate),
      phoneNumber,
      email,
      notes
    });
    
    await employee.save();
    
    // Populate event details for response
    await employee.populate('eventId', 'eventName eventDate');
    
    res.status(201).json(employee);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update employee
router.put('/:id', [
  body('name').optional().notEmpty().withMessage('Employee name cannot be empty'),
  body('role').optional().notEmpty().withMessage('Employee role cannot be empty'),
  body('wage').optional().isFloat({ min: 0 }).withMessage('Wage must be a positive number'),
  body('paymentDate').optional().isISO8601().withMessage('Valid payment date is required'),
  body('phoneNumber').optional().matches(/^[\+]?[1-9][\d]{0,15}$/).withMessage('Please enter a valid phone number'),
  body('email').optional().isEmail().withMessage('Please enter a valid email address'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    
    // Update fields
    Object.keys(req.body).forEach(key => {
      if (key !== 'paymentStatus') { // Don't allow direct payment status updates
        employee[key] = req.body[key];
      }
    });
    
    await employee.save();
    await employee.populate('eventId', 'eventName eventDate');
    
    res.json(employee);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mark employee as paid
router.patch('/:id/mark-paid', async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    
    await employee.markAsPaid();
    await employee.populate('eventId', 'eventName eventDate');
    
    res.json({
      message: 'Employee marked as paid successfully',
      employee
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete employee
router.delete('/:id', async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    
    await Employee.findByIdAndDelete(req.params.id);
    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get employees by event
router.get('/event/:eventId', async (req, res) => {
  try {
    const employees = await Employee.getEmployeesByEvent(req.params.eventId);
    
    // Calculate totals
    const totalLaborCost = employees.reduce((sum, emp) => sum + emp.wage, 0);
    const paidCount = employees.filter(emp => emp.paymentStatus === 'paid').length;
    const pendingCount = employees.filter(emp => emp.paymentStatus === 'pending').length;
    const overdueCount = employees.filter(emp => emp.paymentStatus === 'overdue').length;
    
    res.json({
      employees,
      summary: {
        totalEmployees: employees.length,
        totalLaborCost,
        paidCount,
        pendingCount,
        overdueCount
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get overdue payments
router.get('/overdue/payments', async (req, res) => {
  try {
    const overduePayments = await Employee.getOverduePayments();
    res.json(overduePayments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get upcoming payments
router.get('/upcoming/payments', async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const upcomingPayments = await Employee.getUpcomingPayments(parseInt(days));
    res.json(upcomingPayments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get total labor cost by event
router.get('/event/:eventId/labor-cost', async (req, res) => {
  try {
    const laborCost = await Employee.getTotalLaborCostByEvent(req.params.eventId);
    res.json(laborCost[0] || {
      totalCost: 0,
      employeeCount: 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get employee statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const stats = await Employee.getEmployeeStats(startDate, endDate);
    res.json(stats[0] || {
      totalEmployees: 0,
      totalWages: 0,
      averageWage: 0,
      paidCount: 0,
      pendingCount: 0,
      overdueCount: 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get employees by role
router.get('/stats/by-role', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter.paymentDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const roleStats = await Employee.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 },
          totalWages: { $sum: '$wage' },
          averageWage: { $avg: '$wage' }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    res.json(roleStats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
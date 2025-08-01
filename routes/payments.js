const express = require('express');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const Payment = require('../models/Payment');
const Event = require('../models/Event');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/receipts';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'receipt-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image and PDF files are allowed'));
    }
  }
});

// Get all payments
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, eventId, status, method, dateFrom, dateTo } = req.query;
    
    let query = {};
    
    if (eventId) query.eventId = eventId;
    if (status) query.paymentStatus = status;
    if (method) query.paymentMethod = method;
    if (dateFrom || dateTo) {
      query.paymentDate = {};
      if (dateFrom) query.paymentDate.$gte = new Date(dateFrom);
      if (dateTo) query.paymentDate.$lte = new Date(dateTo);
    }
    
    const payments = await Payment.find(query)
      .populate('eventId', 'eventName eventDate')
      .sort({ paymentDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Payment.countDocuments(query);
    
    res.json({
      payments,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single payment
router.get('/:id', async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('eventId', 'eventName eventDate totalCost');
    
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    
    res.json(payment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new payment
router.post('/', [
  body('eventId').isMongoId().withMessage('Valid event ID is required'),
  body('amount').isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
  body('paymentMethod').isIn(['cash', 'bank_transfer', 'check', 'credit_card', 'other']).withMessage('Invalid payment method'),
  body('paymentDate').optional().isISO8601().withMessage('Valid payment date is required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { eventId, amount, paymentMethod, paymentDate, notes } = req.body;
    
    // Check if event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    const payment = new Payment({
      eventId,
      amount,
      paymentMethod,
      paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
      notes
    });
    
    await payment.save();
    
    // Populate event details for response
    await payment.populate('eventId', 'eventName eventDate totalCost');
    
    res.status(201).json(payment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update payment
router.put('/:id', [
  body('amount').optional().isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
  body('paymentMethod').optional().isIn(['cash', 'bank_transfer', 'check', 'credit_card', 'other']).withMessage('Invalid payment method'),
  body('paymentDate').optional().isISO8601().withMessage('Valid payment date is required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    
    // Update fields
    Object.keys(req.body).forEach(key => {
      if (key !== 'receiptNumber' && key !== 'receiptFile') { // Don't allow direct updates to these fields
        payment[key] = req.body[key];
      }
    });
    
    await payment.save();
    await payment.populate('eventId', 'eventName eventDate totalCost');
    
    res.json(payment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Upload receipt file
router.post('/:id/receipt', upload.single('receipt'), async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    // Update payment with file information
    payment.receiptFile = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: req.file.path,
      mimetype: req.file.mimetype,
      size: req.file.size
    };
    
    await payment.save();
    
    res.json({
      message: 'Receipt uploaded successfully',
      receiptFile: payment.receiptFile
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Download receipt file
router.get('/:id/receipt', async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    
    if (!payment.receiptFile || !payment.receiptFile.path) {
      return res.status(404).json({ error: 'Receipt file not found' });
    }
    
    const filePath = payment.receiptFile.path;
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Receipt file not found on server' });
    }
    
    res.download(filePath, payment.receiptFile.originalName);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete payment
router.delete('/:id', async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    
    // Delete receipt file if exists
    if (payment.receiptFile && payment.receiptFile.path) {
      if (fs.existsSync(payment.receiptFile.path)) {
        fs.unlinkSync(payment.receiptFile.path);
      }
    }
    
    await Payment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Payment deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get outstanding balances
router.get('/outstanding/balances', async (req, res) => {
  try {
    const outstandingBalances = await Payment.getOutstandingBalances();
    res.json(outstandingBalances);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get payment statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const stats = await Payment.getPaymentStats(startDate, endDate);
    res.json(stats[0] || {
      totalPayments: 0,
      totalAmount: 0,
      averageAmount: 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get payments by event
router.get('/event/:eventId', async (req, res) => {
  try {
    const payments = await Payment.getPaymentsByEvent(req.params.eventId);
    
    // Calculate totals
    const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
    const event = await Event.findById(req.params.eventId);
    const outstandingBalance = event ? event.totalCost - totalPaid : 0;
    
    res.json({
      payments,
      totalPaid,
      outstandingBalance,
      event: event ? {
        eventName: event.eventName,
        totalCost: event.totalCost
      } : null
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
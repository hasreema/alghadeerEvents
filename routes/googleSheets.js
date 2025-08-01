const express = require('express');
const { google } = require('googleapis');
const router = express.Router();
const Event = require('../models/Event');
const Payment = require('../models/Payment');
const Employee = require('../models/Employee');
const Reminder = require('../models/Reminder');

// Initialize Google Sheets API
const auth = new google.auth.GoogleAuth({
  keyFile: process.env.GOOGLE_SERVICE_ACCOUNT_KEY_FILE || 'google-credentials.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

// Sync events to Google Sheets
router.post('/sync/events', async (req, res) => {
  try {
    const { spreadsheetId, range = 'Events!A:Z' } = req.body;
    
    if (!spreadsheetId) {
      return res.status(400).json({ error: 'Spreadsheet ID is required' });
    }
    
    // Get all events
    const events = await Event.find().populate('payments').populate('employees');
    
    // Prepare data for Google Sheets
    const eventData = events.map(event => [
      event._id.toString(),
      event.eventName,
      event.eventType,
      event.eventTypeOther || '',
      event.eventDate.toISOString().split('T')[0],
      event.eventTime,
      event.location,
      event.gender,
      event.guestCount,
      event.basePrice,
      event.totalCost,
      event.status,
      event.notes || '',
      event.createdAt.toISOString().split('T')[0],
      event.updatedAt.toISOString().split('T')[0]
    ]);
    
    // Add headers
    const headers = [
      'ID',
      'Event Name',
      'Event Type',
      'Event Type Other',
      'Event Date',
      'Event Time',
      'Location',
      'Gender',
      'Guest Count',
      'Base Price',
      'Total Cost',
      'Status',
      'Notes',
      'Created At',
      'Updated At'
    ];
    
    const dataToWrite = [headers, ...eventData];
    
    // Clear existing data and write new data
    await sheets.spreadsheets.values.clear({
      spreadsheetId,
      range,
    });
    
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range,
      valueInputOption: 'RAW',
      resource: {
        values: dataToWrite,
      },
    });
    
    res.json({
      message: 'Events synced to Google Sheets successfully',
      eventsCount: events.length,
      spreadsheetId,
      range
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Sync payments to Google Sheets
router.post('/sync/payments', async (req, res) => {
  try {
    const { spreadsheetId, range = 'Payments!A:Z' } = req.body;
    
    if (!spreadsheetId) {
      return res.status(400).json({ error: 'Spreadsheet ID is required' });
    }
    
    // Get all payments
    const payments = await Payment.find().populate('eventId');
    
    // Prepare data for Google Sheets
    const paymentData = payments.map(payment => [
      payment._id.toString(),
      payment.eventId ? payment.eventId._id.toString() : '',
      payment.eventId ? payment.eventId.eventName : '',
      payment.amount,
      payment.paymentDate.toISOString().split('T')[0],
      payment.paymentMethod,
      payment.paymentStatus,
      payment.receiptNumber || '',
      payment.notes || '',
      payment.createdAt.toISOString().split('T')[0]
    ]);
    
    // Add headers
    const headers = [
      'ID',
      'Event ID',
      'Event Name',
      'Amount',
      'Payment Date',
      'Payment Method',
      'Payment Status',
      'Receipt Number',
      'Notes',
      'Created At'
    ];
    
    const dataToWrite = [headers, ...paymentData];
    
    // Clear existing data and write new data
    await sheets.spreadsheets.values.clear({
      spreadsheetId,
      range,
    });
    
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range,
      valueInputOption: 'RAW',
      resource: {
        values: dataToWrite,
      },
    });
    
    res.json({
      message: 'Payments synced to Google Sheets successfully',
      paymentsCount: payments.length,
      spreadsheetId,
      range
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Sync employees to Google Sheets
router.post('/sync/employees', async (req, res) => {
  try {
    const { spreadsheetId, range = 'EmployeesPayments!A:Z' } = req.body;
    
    if (!spreadsheetId) {
      return res.status(400).json({ error: 'Spreadsheet ID is required' });
    }
    
    // Get all employees
    const employees = await Employee.find().populate('eventId');
    
    // Prepare data for Google Sheets
    const employeeData = employees.map(employee => [
      employee._id.toString(),
      employee.eventId ? employee.eventId._id.toString() : '',
      employee.eventId ? employee.eventId.eventName : '',
      employee.name,
      employee.role,
      employee.wage,
      employee.paymentDate.toISOString().split('T')[0],
      employee.paymentStatus,
      employee.phoneNumber || '',
      employee.email || '',
      employee.notes || '',
      employee.createdAt.toISOString().split('T')[0]
    ]);
    
    // Add headers
    const headers = [
      'ID',
      'Event ID',
      'Event Name',
      'Name',
      'Role',
      'Wage',
      'Payment Date',
      'Payment Status',
      'Phone Number',
      'Email',
      'Notes',
      'Created At'
    ];
    
    const dataToWrite = [headers, ...employeeData];
    
    // Clear existing data and write new data
    await sheets.spreadsheets.values.clear({
      spreadsheetId,
      range,
    });
    
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range,
      valueInputOption: 'RAW',
      resource: {
        values: dataToWrite,
      },
    });
    
    res.json({
      message: 'Employees synced to Google Sheets successfully',
      employeesCount: employees.length,
      spreadsheetId,
      range
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Sync reminders to Google Sheets
router.post('/sync/reminders', async (req, res) => {
  try {
    const { spreadsheetId, range = 'Reminders!A:Z' } = req.body;
    
    if (!spreadsheetId) {
      return res.status(400).json({ error: 'Spreadsheet ID is required' });
    }
    
    // Get all reminders
    const reminders = await Reminder.find().populate('eventId');
    
    // Prepare data for Google Sheets
    const reminderData = reminders.map(reminder => [
      reminder._id.toString(),
      reminder.eventId ? reminder.eventId._id.toString() : '',
      reminder.eventId ? reminder.eventId.eventName : '',
      reminder.title,
      reminder.description || '',
      reminder.reminderDate.toISOString().split('T')[0],
      reminder.assignee,
      reminder.reminderType,
      reminder.recurrencePattern || '',
      reminder.status,
      reminder.notes || '',
      reminder.createdAt.toISOString().split('T')[0]
    ]);
    
    // Add headers
    const headers = [
      'ID',
      'Event ID',
      'Event Name',
      'Title',
      'Description',
      'Reminder Date',
      'Assignee',
      'Reminder Type',
      'Recurrence Pattern',
      'Status',
      'Notes',
      'Created At'
    ];
    
    const dataToWrite = [headers, ...reminderData];
    
    // Clear existing data and write new data
    await sheets.spreadsheets.values.clear({
      spreadsheetId,
      range,
    });
    
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range,
      valueInputOption: 'RAW',
      resource: {
        values: dataToWrite,
      },
    });
    
    res.json({
      message: 'Reminders synced to Google Sheets successfully',
      remindersCount: reminders.length,
      spreadsheetId,
      range
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Sync all data to Google Sheets
router.post('/sync/all', async (req, res) => {
  try {
    const { spreadsheetId } = req.body;
    
    if (!spreadsheetId) {
      return res.status(400).json({ error: 'Spreadsheet ID is required' });
    }
    
    const results = {};
    
    // Sync events
    try {
      const events = await Event.find().populate('payments').populate('employees');
      const eventData = events.map(event => [
        event._id.toString(),
        event.eventName,
        event.eventType,
        event.eventDate.toISOString().split('T')[0],
        event.location,
        event.gender,
        event.guestCount,
        event.basePrice,
        event.totalCost,
        event.status
      ]);
      
      const eventHeaders = ['ID', 'Event Name', 'Event Type', 'Event Date', 'Location', 'Gender', 'Guest Count', 'Base Price', 'Total Cost', 'Status'];
      const eventDataToWrite = [eventHeaders, ...eventData];
      
      await sheets.spreadsheets.values.clear({
        spreadsheetId,
        range: 'Events!A:Z',
      });
      
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: 'Events!A:Z',
        valueInputOption: 'RAW',
        resource: { values: eventDataToWrite },
      });
      
      results.events = { count: events.length, success: true };
    } catch (error) {
      results.events = { error: error.message, success: false };
    }
    
    // Sync payments
    try {
      const payments = await Payment.find().populate('eventId');
      const paymentData = payments.map(payment => [
        payment._id.toString(),
        payment.eventId ? payment.eventId.eventName : '',
        payment.amount,
        payment.paymentDate.toISOString().split('T')[0],
        payment.paymentMethod,
        payment.paymentStatus
      ]);
      
      const paymentHeaders = ['ID', 'Event Name', 'Amount', 'Payment Date', 'Payment Method', 'Payment Status'];
      const paymentDataToWrite = [paymentHeaders, ...paymentData];
      
      await sheets.spreadsheets.values.clear({
        spreadsheetId,
        range: 'Payments!A:Z',
      });
      
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: 'Payments!A:Z',
        valueInputOption: 'RAW',
        resource: { values: paymentDataToWrite },
      });
      
      results.payments = { count: payments.length, success: true };
    } catch (error) {
      results.payments = { error: error.message, success: false };
    }
    
    // Sync employees
    try {
      const employees = await Employee.find().populate('eventId');
      const employeeData = employees.map(employee => [
        employee._id.toString(),
        employee.eventId ? employee.eventId.eventName : '',
        employee.name,
        employee.role,
        employee.wage,
        employee.paymentDate.toISOString().split('T')[0],
        employee.paymentStatus
      ]);
      
      const employeeHeaders = ['ID', 'Event Name', 'Name', 'Role', 'Wage', 'Payment Date', 'Payment Status'];
      const employeeDataToWrite = [employeeHeaders, ...employeeData];
      
      await sheets.spreadsheets.values.clear({
        spreadsheetId,
        range: 'EmployeesPayments!A:Z',
      });
      
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: 'EmployeesPayments!A:Z',
        valueInputOption: 'RAW',
        resource: { values: employeeDataToWrite },
      });
      
      results.employees = { count: employees.length, success: true };
    } catch (error) {
      results.employees = { error: error.message, success: false };
    }
    
    // Sync reminders
    try {
      const reminders = await Reminder.find().populate('eventId');
      const reminderData = reminders.map(reminder => [
        reminder._id.toString(),
        reminder.eventId ? reminder.eventId.eventName : '',
        reminder.title,
        reminder.reminderDate.toISOString().split('T')[0],
        reminder.assignee,
        reminder.status
      ]);
      
      const reminderHeaders = ['ID', 'Event Name', 'Title', 'Reminder Date', 'Assignee', 'Status'];
      const reminderDataToWrite = [reminderHeaders, ...reminderData];
      
      await sheets.spreadsheets.values.clear({
        spreadsheetId,
        range: 'Reminders!A:Z',
      });
      
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: 'Reminders!A:Z',
        valueInputOption: 'RAW',
        resource: { values: reminderDataToWrite },
      });
      
      results.reminders = { count: reminders.length, success: true };
    } catch (error) {
      results.reminders = { error: error.message, success: false };
    }
    
    res.json({
      message: 'All data synced to Google Sheets',
      results,
      spreadsheetId
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get data from Google Sheets
router.get('/read/:sheetName', async (req, res) => {
  try {
    const { spreadsheetId, range } = req.query;
    const { sheetName } = req.params;
    
    if (!spreadsheetId) {
      return res.status(400).json({ error: 'Spreadsheet ID is required' });
    }
    
    const sheetRange = range || `${sheetName}!A:Z`;
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: sheetRange,
    });
    
    const rows = response.data.values;
    
    if (!rows || rows.length === 0) {
      return res.json({ data: [], message: 'No data found' });
    }
    
    // Convert to objects with headers
    const headers = rows[0];
    const data = rows.slice(1).map(row => {
      const obj = {};
      headers.forEach((header, index) => {
        obj[header] = row[index] || '';
      });
      return obj;
    });
    
    res.json({
      data,
      headers,
      totalRows: data.length,
      sheetName,
      range: sheetRange
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Test Google Sheets connection
router.get('/test-connection', async (req, res) => {
  try {
    const { spreadsheetId } = req.query;
    
    if (!spreadsheetId) {
      return res.status(400).json({ error: 'Spreadsheet ID is required' });
    }
    
    // Try to read the first sheet to test connection
    const response = await sheets.spreadsheets.get({
      spreadsheetId,
    });
    
    res.json({
      message: 'Google Sheets connection successful',
      spreadsheet: {
        title: response.data.properties.title,
        sheets: response.data.sheets.map(sheet => sheet.properties.title),
        spreadsheetId
      }
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Google Sheets connection failed',
      details: error.message 
    });
  }
});

module.exports = router;
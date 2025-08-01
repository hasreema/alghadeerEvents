const express = require('express');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const Event = require('../models/Event');
const Payment = require('../models/Payment');
const Employee = require('../models/Employee');
const Reminder = require('../models/Reminder');
const { sendEmail } = require('../services/emailService');
const { sendWhatsApp } = require('../services/whatsappService');

// Generate monthly report
router.post('/monthly', async (req, res) => {
  try {
    const { month, year, sendEmail: shouldSendEmail, sendWhatsApp: shouldSendWhatsApp } = req.body;
    
    const reportMonth = month || new Date().getMonth() + 1;
    const reportYear = year || new Date().getFullYear();
    
    // Calculate date range for the month
    const startDate = new Date(reportYear, reportMonth - 1, 1);
    const endDate = new Date(reportYear, reportMonth, 0, 23, 59, 59);
    
    // Get all data for the month
    const events = await Event.find({
      eventDate: { $gte: startDate, $lte: endDate }
    }).populate('payments').populate('employees');
    
    const payments = await Payment.find({
      paymentDate: { $gte: startDate, $lte: endDate }
    }).populate('eventId');
    
    const employees = await Employee.find({
      paymentDate: { $gte: startDate, $lte: endDate }
    }).populate('eventId');
    
    const reminders = await Reminder.find({
      reminderDate: { $gte: startDate, $lte: endDate }
    }).populate('eventId');
    
    // Calculate statistics
    const stats = calculateMonthlyStats(events, payments, employees, reminders);
    
    // Generate PDF report
    const pdfPath = await generateMonthlyPDF(stats, reportMonth, reportYear);
    
    // Send notifications if requested
    if (shouldSendEmail) {
      await sendMonthlyReportEmail(pdfPath, reportMonth, reportYear);
    }
    
    if (shouldSendWhatsApp) {
      await sendMonthlyReportWhatsApp(pdfPath, reportMonth, reportYear);
    }
    
    res.json({
      message: 'Monthly report generated successfully',
      stats,
      pdfPath,
      sentEmail: shouldSendEmail,
      sentWhatsApp: shouldSendWhatsApp
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get dashboard statistics
router.get('/dashboard', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter.eventDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    // Get events
    const events = await Event.find(dateFilter).populate('payments').populate('employees');
    
    // Get payments
    const payments = await Payment.find(dateFilter).populate('eventId');
    
    // Get employees
    const employees = await Employee.find(dateFilter).populate('eventId');
    
    // Get reminders
    const reminders = await Reminder.find(dateFilter).populate('eventId');
    
    // Calculate dashboard stats
    const dashboardStats = calculateDashboardStats(events, payments, employees, reminders);
    
    res.json(dashboardStats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get profitability report
router.get('/profitability', async (req, res) => {
  try {
    const { startDate, endDate, groupBy = 'event' } = req.query;
    
    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter.eventDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const events = await Event.find(dateFilter).populate('payments').populate('employees');
    
    let profitabilityData;
    
    switch (groupBy) {
      case 'type':
        profitabilityData = groupProfitabilityByType(events);
        break;
      case 'location':
        profitabilityData = groupProfitabilityByLocation(events);
        break;
      case 'month':
        profitabilityData = groupProfitabilityByMonth(events);
        break;
      default:
        profitabilityData = groupProfitabilityByEvent(events);
    }
    
    res.json(profitabilityData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get outstanding balances report
router.get('/outstanding-balances', async (req, res) => {
  try {
    const outstandingBalances = await Payment.getOutstandingBalances();
    
    const totalOutstanding = outstandingBalances.reduce((sum, item) => sum + item.outstandingBalance, 0);
    const eventCount = outstandingBalances.length;
    
    res.json({
      outstandingBalances,
      summary: {
        totalOutstanding,
        eventCount,
        averageOutstanding: eventCount > 0 ? totalOutstanding / eventCount : 0
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Helper function to calculate monthly statistics
function calculateMonthlyStats(events, payments, employees, reminders) {
  const totalEvents = events.length;
  const totalRevenue = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const totalLaborCost = employees.reduce((sum, emp) => sum + emp.wage, 0);
  
  // Calculate event costs
  const totalEventCosts = events.reduce((sum, event) => {
    const additionalCosts = event.additionalRequests.reduce((reqSum, req) => 
      reqSum + (req.providedBy === 'hall' ? req.cost : 0), 0);
    const decorationCost = event.decoration.type === 'customized' ? event.decoration.cost : 0;
    return sum + additionalCosts + decorationCost;
  }, 0);
  
  const totalExpenses = totalLaborCost + totalEventCosts;
  const netProfit = totalRevenue - totalExpenses;
  const profitabilityPercentage = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
  
  // Group by event type
  const eventsByType = events.reduce((acc, event) => {
    acc[event.eventType] = (acc[event.eventType] || 0) + 1;
    return acc;
  }, {});
  
  // Group by location
  const eventsByLocation = events.reduce((acc, event) => {
    acc[event.location] = (acc[event.location] || 0) + 1;
    return acc;
  }, {});
  
  // Payment status breakdown
  const paymentStatuses = payments.reduce((acc, payment) => {
    acc[payment.paymentStatus] = (acc[payment.paymentStatus] || 0) + 1;
    return acc;
  }, {});
  
  // Employee payment status
  const employeePaymentStatuses = employees.reduce((acc, emp) => {
    acc[emp.paymentStatus] = (acc[emp.paymentStatus] || 0) + 1;
    return acc;
  }, {});
  
  // Reminder status
  const reminderStatuses = reminders.reduce((acc, reminder) => {
    acc[reminder.status] = (acc[reminder.status] || 0) + 1;
    return acc;
  }, {});
  
  return {
    period: {
      startDate: events.length > 0 ? Math.min(...events.map(e => e.eventDate)) : null,
      endDate: events.length > 0 ? Math.max(...events.map(e => e.eventDate)) : null
    },
    financial: {
      totalRevenue,
      totalExpenses,
      netProfit,
      profitabilityPercentage: Math.round(profitabilityPercentage * 100) / 100,
      totalLaborCost,
      totalEventCosts
    },
    events: {
      totalEvents,
      eventsByType,
      eventsByLocation
    },
    payments: {
      totalPayments: payments.length,
      paymentStatuses
    },
    employees: {
      totalEmployees: employees.length,
      totalWages: totalLaborCost,
      employeePaymentStatuses
    },
    reminders: {
      totalReminders: reminders.length,
      reminderStatuses
    }
  };
}

// Helper function to calculate dashboard statistics
function calculateDashboardStats(events, payments, employees, reminders) {
  const totalEvents = events.length;
  const totalRevenue = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const totalLaborCost = employees.reduce((sum, emp) => sum + emp.wage, 0);
  
  // Calculate profitability meter
  const totalExpenses = totalLaborCost + events.reduce((sum, event) => {
    const additionalCosts = event.additionalRequests.reduce((reqSum, req) => 
      reqSum + (req.providedBy === 'hall' ? req.cost : 0), 0);
    const decorationCost = event.decoration.type === 'customized' ? event.decoration.cost : 0;
    return sum + additionalCosts + decorationCost;
  }, 0);
  
  const netProfit = totalRevenue - totalExpenses;
  const profitabilityPercentage = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
  
  let profitabilityMeter = 'red';
  if (profitabilityPercentage >= 20) {
    profitabilityMeter = 'green';
  } else if (profitabilityPercentage >= 10) {
    profitabilityMeter = 'yellow';
  }
  
  // Upcoming events
  const upcomingEvents = events.filter(event => 
    event.eventDate > new Date() && event.status === 'scheduled'
  ).length;
  
  // Outstanding balances
  const outstandingBalances = events.filter(event => {
    const totalPaid = event.payments.reduce((sum, payment) => sum + payment.amount, 0);
    return totalPaid < event.totalCost;
  }).length;
  
  // Overdue reminders
  const overdueReminders = reminders.filter(reminder => 
    reminder.reminderDate < new Date() && reminder.status === 'pending'
  ).length;
  
  return {
    profitabilityMeter,
    totalEvents,
    totalRevenue,
    totalExpenses,
    netProfit,
    profitabilityPercentage: Math.round(profitabilityPercentage * 100) / 100,
    upcomingEvents,
    outstandingBalances,
    overdueReminders,
    totalEmployees: employees.length,
    totalReminders: reminders.length
  };
}

// Helper function to generate monthly PDF report
async function generateMonthlyPDF(stats, month, year) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    const fileName = `monthly-report-${year}-${month.toString().padStart(2, '0')}.pdf`;
    const filePath = path.join('reports', fileName);
    
    // Ensure reports directory exists
    if (!fs.existsSync('reports')) {
      fs.mkdirSync('reports', { recursive: true });
    }
    
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);
    
    // Add Hebrew text support (basic implementation)
    doc.font('Helvetica');
    
    // Header
    doc.fontSize(24).text('Al Ghadeer Events - Monthly Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(16).text(`Report for ${month}/${year}`, { align: 'center' });
    doc.moveDown(2);
    
    // Financial Summary
    doc.fontSize(18).text('Financial Summary');
    doc.moveDown();
    doc.fontSize(12).text(`Total Revenue: ₪${stats.financial.totalRevenue.toLocaleString()}`);
    doc.text(`Total Expenses: ₪${stats.financial.totalExpenses.toLocaleString()}`);
    doc.text(`Net Profit: ₪${stats.financial.netProfit.toLocaleString()}`);
    doc.text(`Profitability: ${stats.financial.profitabilityPercentage}%`);
    doc.moveDown();
    
    // Events Summary
    doc.fontSize(18).text('Events Summary');
    doc.moveDown();
    doc.fontSize(12).text(`Total Events: ${stats.events.totalEvents}`);
    doc.moveDown();
    
    // Events by Type
    doc.fontSize(14).text('Events by Type:');
    Object.entries(stats.events.eventsByType).forEach(([type, count]) => {
      doc.fontSize(12).text(`  ${type}: ${count}`);
    });
    doc.moveDown();
    
    // Events by Location
    doc.fontSize(14).text('Events by Location:');
    Object.entries(stats.events.eventsByLocation).forEach(([location, count]) => {
      doc.fontSize(12).text(`  ${location}: ${count}`);
    });
    doc.moveDown();
    
    // Employee Summary
    doc.fontSize(18).text('Employee Summary');
    doc.moveDown();
    doc.fontSize(12).text(`Total Employees: ${stats.employees.totalEmployees}`);
    doc.text(`Total Wages: ₪${stats.employees.totalWages.toLocaleString()}`);
    doc.moveDown();
    
    // Payment Summary
    doc.fontSize(18).text('Payment Summary');
    doc.moveDown();
    doc.fontSize(12).text(`Total Payments: ${stats.payments.totalPayments}`);
    doc.moveDown();
    
    // Footer
    doc.moveDown(2);
    doc.fontSize(10).text(`Generated on ${new Date().toLocaleDateString()}`, { align: 'center' });
    doc.text('Al Ghadeer Events Management System', { align: 'center' });
    
    doc.end();
    
    stream.on('finish', () => {
      resolve(filePath);
    });
    
    stream.on('error', reject);
  });
}

// Helper function to group profitability by event type
function groupProfitabilityByType(events) {
  const grouped = {};
  
  events.forEach(event => {
    const type = event.eventType;
    if (!grouped[type]) {
      grouped[type] = {
        eventType: type,
        totalEvents: 0,
        totalRevenue: 0,
        totalExpenses: 0,
        netProfit: 0,
        averageProfit: 0
      };
    }
    
    const totalPaid = event.payments.reduce((sum, payment) => sum + payment.amount, 0);
    const totalLaborCost = event.employees.reduce((sum, emp) => sum + emp.wage, 0);
    const additionalCosts = event.additionalRequests.reduce((sum, req) => 
      sum + (req.providedBy === 'hall' ? req.cost : 0), 0);
    const decorationCost = event.decoration.type === 'customized' ? event.decoration.cost : 0;
    const totalExpenses = totalLaborCost + additionalCosts + decorationCost;
    const netProfit = totalPaid - totalExpenses;
    
    grouped[type].totalEvents++;
    grouped[type].totalRevenue += totalPaid;
    grouped[type].totalExpenses += totalExpenses;
    grouped[type].netProfit += netProfit;
  });
  
  // Calculate averages
  Object.values(grouped).forEach(group => {
    group.averageProfit = group.totalEvents > 0 ? group.netProfit / group.totalEvents : 0;
  });
  
  return Object.values(grouped);
}

// Helper function to group profitability by location
function groupProfitabilityByLocation(events) {
  const grouped = {};
  
  events.forEach(event => {
    const location = event.location;
    if (!grouped[location]) {
      grouped[location] = {
        location,
        totalEvents: 0,
        totalRevenue: 0,
        totalExpenses: 0,
        netProfit: 0,
        averageProfit: 0
      };
    }
    
    const totalPaid = event.payments.reduce((sum, payment) => sum + payment.amount, 0);
    const totalLaborCost = event.employees.reduce((sum, emp) => sum + emp.wage, 0);
    const additionalCosts = event.additionalRequests.reduce((sum, req) => 
      sum + (req.providedBy === 'hall' ? req.cost : 0), 0);
    const decorationCost = event.decoration.type === 'customized' ? event.decoration.cost : 0;
    const totalExpenses = totalLaborCost + additionalCosts + decorationCost;
    const netProfit = totalPaid - totalExpenses;
    
    grouped[location].totalEvents++;
    grouped[location].totalRevenue += totalPaid;
    grouped[location].totalExpenses += totalExpenses;
    grouped[location].netProfit += netProfit;
  });
  
  // Calculate averages
  Object.values(grouped).forEach(group => {
    group.averageProfit = group.totalEvents > 0 ? group.netProfit / group.totalEvents : 0;
  });
  
  return Object.values(grouped);
}

// Helper function to group profitability by month
function groupProfitabilityByMonth(events) {
  const grouped = {};
  
  events.forEach(event => {
    const month = event.eventDate.getMonth() + 1;
    const year = event.eventDate.getFullYear();
    const key = `${year}-${month.toString().padStart(2, '0')}`;
    
    if (!grouped[key]) {
      grouped[key] = {
        month: key,
        totalEvents: 0,
        totalRevenue: 0,
        totalExpenses: 0,
        netProfit: 0,
        averageProfit: 0
      };
    }
    
    const totalPaid = event.payments.reduce((sum, payment) => sum + payment.amount, 0);
    const totalLaborCost = event.employees.reduce((sum, emp) => sum + emp.wage, 0);
    const additionalCosts = event.additionalRequests.reduce((sum, req) => 
      sum + (req.providedBy === 'hall' ? req.cost : 0), 0);
    const decorationCost = event.decoration.type === 'customized' ? event.decoration.cost : 0;
    const totalExpenses = totalLaborCost + additionalCosts + decorationCost;
    const netProfit = totalPaid - totalExpenses;
    
    grouped[key].totalEvents++;
    grouped[key].totalRevenue += totalPaid;
    grouped[key].totalExpenses += totalExpenses;
    grouped[key].netProfit += netProfit;
  });
  
  // Calculate averages
  Object.values(grouped).forEach(group => {
    group.averageProfit = group.totalEvents > 0 ? group.netProfit / group.totalEvents : 0;
  });
  
  return Object.values(grouped).sort((a, b) => a.month.localeCompare(b.month));
}

// Helper function to group profitability by event
function groupProfitabilityByEvent(events) {
  return events.map(event => {
    const totalPaid = event.payments.reduce((sum, payment) => sum + payment.amount, 0);
    const totalLaborCost = event.employees.reduce((sum, emp) => sum + emp.wage, 0);
    const additionalCosts = event.additionalRequests.reduce((sum, req) => 
      sum + (req.providedBy === 'hall' ? req.cost : 0), 0);
    const decorationCost = event.decoration.type === 'customized' ? event.decoration.cost : 0;
    const totalExpenses = totalLaborCost + additionalCosts + decorationCost;
    const netProfit = totalPaid - totalExpenses;
    
    return {
      eventId: event._id,
      eventName: event.eventName,
      eventType: event.eventType,
      location: event.location,
      eventDate: event.eventDate,
      totalRevenue: totalPaid,
      totalExpenses,
      netProfit,
      profitabilityPercentage: totalPaid > 0 ? (netProfit / totalPaid) * 100 : 0
    };
  });
}

// Helper function to send monthly report email
async function sendMonthlyReportEmail(pdfPath, month, year) {
  const subject = `Al Ghadeer Events - Monthly Report ${month}/${year}`;
  const body = `
    Dear Team,
    
    Please find attached the monthly report for ${month}/${year}.
    
    Best regards,
    Al Ghadeer Events Management System
  `;
  
  await sendEmail({
    to: 'alghadeerevents@gmail.com',
    subject,
    body,
    attachments: [pdfPath]
  });
}

// Helper function to send monthly report WhatsApp
async function sendMonthlyReportWhatsApp(pdfPath, month, year) {
  const message = `Al Ghadeer Events - Monthly Report ${month}/${year} has been generated and sent to your email.`;
  
  await sendWhatsApp({
    to: '+970595781722',
    message
  });
}

module.exports = router;
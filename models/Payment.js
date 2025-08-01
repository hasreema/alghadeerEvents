const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: [true, 'Event ID is required']
  },
  amount: {
    type: Number,
    required: [true, 'Payment amount is required'],
    min: [0, 'Payment amount cannot be negative']
  },
  paymentDate: {
    type: Date,
    required: [true, 'Payment date is required'],
    default: Date.now
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'bank_transfer', 'check', 'credit_card', 'other'],
    required: [true, 'Payment method is required']
  },
  paymentStatus: {
    type: String,
    enum: ['paid', 'partially_paid', 'not_paid'],
    default: 'paid'
  },
  receiptNumber: {
    type: String,
    unique: true,
    sparse: true
  },
  receiptFile: {
    filename: String,
    originalName: String,
    path: String,
    mimetype: String,
    size: Number
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  createdBy: {
    type: String,
    default: 'system'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for formatted payment date
paymentSchema.virtual('formattedPaymentDate').get(function() {
  return this.paymentDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

// Virtual for formatted amount
paymentSchema.virtual('formattedAmount').get(function() {
  return new Intl.NumberFormat('he-IL', {
    style: 'currency',
    currency: 'ILS'
  }).format(this.amount);
});

// Virtual for payment status color
paymentSchema.virtual('statusColor').get(function() {
  const colors = {
    'paid': 'green',
    'partially_paid': 'orange',
    'not_paid': 'red'
  };
  return colors[this.paymentStatus] || 'gray';
});

// Virtual for payment method icon
paymentSchema.virtual('paymentMethodIcon').get(function() {
  const icons = {
    'cash': '💵',
    'bank_transfer': '🏦',
    'check': '📄',
    'credit_card': '💳',
    'other': '📝'
  };
  return icons[this.paymentMethod] || '📝';
});

// Pre-save middleware to generate receipt number
paymentSchema.pre('save', function(next) {
  if (!this.receiptNumber) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.receiptNumber = `RCP-${year}${month}${day}-${random}`;
  }
  next();
});

// Index for better query performance
paymentSchema.index({ eventId: 1 });
paymentSchema.index({ paymentDate: -1 });
paymentSchema.index({ paymentStatus: 1 });
paymentSchema.index({ receiptNumber: 1 });

// Static method to get payments by event
paymentSchema.statics.getPaymentsByEvent = function(eventId) {
  return this.find({ eventId })
    .sort({ paymentDate: -1 });
};

// Static method to get outstanding balances
paymentSchema.statics.getOutstandingBalances = function() {
  return this.aggregate([
    {
      $group: {
        _id: '$eventId',
        totalPaid: { $sum: '$amount' },
        paymentCount: { $sum: 1 }
      }
    },
    {
      $lookup: {
        from: 'events',
        localField: '_id',
        foreignField: '_id',
        as: 'event'
      }
    },
    {
      $unwind: '$event'
    },
    {
      $addFields: {
        outstandingBalance: { $subtract: ['$event.totalCost', '$totalPaid'] }
      }
    },
    {
      $match: {
        outstandingBalance: { $gt: 0 }
      }
    },
    {
      $sort: { outstandingBalance: -1 }
    }
  ]);
};

// Static method to get payment statistics
paymentSchema.statics.getPaymentStats = function(startDate, endDate) {
  const matchStage = {};
  if (startDate && endDate) {
    matchStage.paymentDate = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalPayments: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
        averageAmount: { $avg: '$amount' }
      }
    }
  ]);
};

// Instance method to check if payment is overdue
paymentSchema.methods.isOverdue = function() {
  const event = this.populated('eventId') || this.eventId;
  if (!event) return false;
  
  const eventDate = new Date(event.eventDate);
  const paymentDate = new Date(this.paymentDate);
  
  return paymentDate > eventDate;
};

module.exports = mongoose.model('Payment', paymentSchema);
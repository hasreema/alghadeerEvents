const mongoose = require('mongoose');

const additionalRequestSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['DJ', 'cake', 'fruits', 'nuts', 'other'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    default: 1
  },
  cost: {
    type: Number,
    required: true,
    min: 0
  },
  providedBy: {
    type: String,
    enum: ['hall', 'client'],
    required: true
  },
  notes: String
});

const decorationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['standard', 'customized'],
    default: 'standard'
  },
  description: String,
  cost: {
    type: Number,
    default: 0,
    min: 0
  }
});

const eventSchema = new mongoose.Schema({
  eventName: {
    type: String,
    required: [true, 'Event name is required'],
    trim: true,
    maxlength: [200, 'Event name cannot exceed 200 characters']
  },
  eventType: {
    type: String,
    enum: ['wedding', 'henna', 'engagement', 'graduation', 'other'],
    required: [true, 'Event type is required']
  },
  eventTypeOther: {
    type: String,
    trim: true,
    maxlength: [100, 'Custom event type cannot exceed 100 characters']
  },
  eventDate: {
    type: Date,
    required: [true, 'Event date is required'],
    validate: {
      validator: function(value) {
        return value > new Date();
      },
      message: 'Event date must be in the future'
    }
  },
  eventTime: {
    type: String,
    required: [true, 'Event time is required'],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter a valid time in HH:MM format']
  },
  location: {
    type: String,
    enum: ['Hall Floor 0', 'Hall Floor 1', 'Garden', 'Waterfall'],
    required: [true, 'Location is required']
  },
  gender: {
    type: String,
    enum: ['Men', 'Women', 'Mixed'],
    required: [true, 'Gender selection is required']
  },
  guestCount: {
    type: Number,
    required: [true, 'Guest count is required'],
    min: [1, 'Guest count must be at least 1'],
    max: [1000, 'Guest count cannot exceed 1000']
  },
  basePrice: {
    type: Number,
    required: [true, 'Base price is required'],
    min: [0, 'Base price cannot be negative']
  },
  totalCost: {
    type: Number,
    required: true,
    min: 0
  },
  additionalRequests: [additionalRequestSchema],
  decoration: {
    type: decorationSchema,
    default: () => ({ type: 'standard', cost: 0 })
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  status: {
    type: String,
    enum: ['scheduled', 'in-progress', 'completed', 'cancelled'],
    default: 'scheduled'
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

// Virtual for formatted event date
eventSchema.virtual('formattedDate').get(function() {
  return this.eventDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

// Virtual for formatted event time
eventSchema.virtual('formattedTime').get(function() {
  return this.eventTime;
});

// Virtual for days until event
eventSchema.virtual('daysUntilEvent').get(function() {
  const today = new Date();
  const eventDate = new Date(this.eventDate);
  const diffTime = eventDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Virtual for event status color
eventSchema.virtual('statusColor').get(function() {
  const colors = {
    'scheduled': 'blue',
    'in-progress': 'orange',
    'completed': 'green',
    'cancelled': 'red'
  };
  return colors[this.status] || 'gray';
});

// Pre-save middleware to calculate total cost
eventSchema.pre('save', function(next) {
  const additionalCosts = this.additionalRequests.reduce((sum, req) => sum + req.cost, 0);
  const decorationCost = this.decoration.type === 'customized' ? this.decoration.cost : 0;
  this.totalCost = this.basePrice + additionalCosts + decorationCost;
  next();
});

// Index for better query performance
eventSchema.index({ eventDate: 1 });
eventSchema.index({ status: 1 });
eventSchema.index({ eventType: 1 });
eventSchema.index({ location: 1 });

// Static method to get upcoming events
eventSchema.statics.getUpcomingEvents = function(limit = 10) {
  return this.find({
    eventDate: { $gte: new Date() },
    status: { $in: ['scheduled', 'in-progress'] }
  })
  .sort({ eventDate: 1 })
  .limit(limit);
};

// Static method to get events by date range
eventSchema.statics.getEventsByDateRange = function(startDate, endDate) {
  return this.find({
    eventDate: {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    }
  }).sort({ eventDate: 1 });
};

// Instance method to calculate profitability
eventSchema.methods.calculateProfitability = function() {
  // This would need to be populated with actual payment and employee data
  const totalIncome = 0; // Would come from payments
  const totalExpenses = this.totalCost * 0.6; // Rough estimate
  const netProfit = totalIncome - totalExpenses;
  const profitabilityPercentage = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0;
  
  return {
    totalIncome,
    totalExpenses,
    netProfit,
    profitabilityPercentage: Math.round(profitabilityPercentage * 100) / 100
  };
};

module.exports = mongoose.model('Event', eventSchema);
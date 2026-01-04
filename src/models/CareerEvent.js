/**
 * CareerEvent Model
 * 
 * PURPOSE: Track career milestones and preparation
 * 
 * KEY CONCEPTS:
 * - User-created events (interviews, deadlines, goals)
 * - Embedded preparation steps (no separate collection)
 * - Date-based queries (upcoming, past)
 * 
 * EXAMPLES:
 * - "Google Interview - Round 1"
 * - "Project Submission Deadline"
 * - "Complete System Design Course"
 */

const mongoose = require('mongoose');

/**
 * Preparation Step Schema (embedded in CareerEvent)
 * 
 * NOT a separate collection - embedded document
 */
const PreparationStepSchema = new mongoose.Schema({
  
  title: {
    type: String,
    required: true,
    trim: true
  },

  description: {
    type: String,
    trim: true
  },

  isCompleted: {
    type: Boolean,
    default: false
  },

  completedAt: {
    type: Date
  },

  order: {
    type: Number,
    default: 0
  }

}, { _id: true });  // Give each step its own _id for easy updates

/**
 * Career Event Schema
 */
const CareerEventSchema = new mongoose.Schema({
  
  // ═══════════════════════════════════════════════════════════
  // USER RELATIONSHIP
  // ═══════════════════════════════════════════════════════════
  
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  // ═══════════════════════════════════════════════════════════
  // EVENT DETAILS
  // ═══════════════════════════════════════════════════════════
  
  /**
   * title - Event name
   * Example: "Google Interview - Final Round"
   */
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true,
    maxlength: 200
  },

  /**
   * description - Detailed notes
   */
  description: {
    type: String,
    trim: true,
    maxlength: 2000
  },

  /**
   * type - Event category
   */
  type: {
    type: String,
    enum: {
      values: ['interview', 'deadline', 'goal', 'milestone', 'networking', 'other'],
      message: '{VALUE} is not a valid event type'
    },
    required: true,
    default: 'other'
  },

  /**
   * date - When is this event?
   */
  date: {
    type: Date,
    required: [true, 'Event date is required'],
    index: true
  },

  /**
   * status - Event state
   */
  status: {
    type: String,
    enum: {
      values: ['upcoming', 'in-progress', 'completed', 'cancelled'],
      message: '{VALUE} is not a valid status'
    },
    default: 'upcoming'
  },

  /**
   * priority - Importance level
   */
  priority: {
    type: String,
    enum: {
      values: ['low', 'medium', 'high', 'critical'],
      message: '{VALUE} is not a valid priority'
    },
    default: 'medium'
  },

  /**
   * company - Related company (for interviews/deadlines)
   */
  company: {
    type: String,
    trim: true
  },

  /**
   * location - Event location (physical/virtual)
   */
  location: {
    type: String,
    trim: true
  },

  /**
   * url - Related link (meeting link, job posting, etc.)
   */
  url: {
    type: String,
    trim: true
  },

  // ═══════════════════════════════════════════════════════════
  // PREPARATION TRACKING
  // ═══════════════════════════════════════════════════════════
  
  /**
   * preparationSteps - Embedded checklist
   * 
   * Example:
   * [
   *   { title: "Review system design", isCompleted: true },
   *   { title: "Practice coding", isCompleted: false },
   *   { title: "Research company", isCompleted: false }
   * ]
   */
  preparationSteps: {
    type: [PreparationStepSchema],
    default: []
  },

  /**
   * notes - General notes about the event
   */
  notes: {
    type: String,
    maxlength: 5000
  },

  /**
   * outcome - Result after event completion
   */
  outcome: {
    type: String,
    maxlength: 1000
  },

  /**
   * starred - Important events
   */
  starred: {
    type: Boolean,
    default: false
  },

  /**
   * isArchived - Hide from active view
   */
  isArchived: {
    type: Boolean,
    default: false
  }

}, {
  timestamps: true,
  collection: 'career_events'
});

// ═══════════════════════════════════════════════════════════
// INDEXES
// ═══════════════════════════════════════════════════════════

/**
 * Common queries
 */
CareerEventSchema.index({ userId: 1, date: 1 });
CareerEventSchema.index({ userId: 1, status: 1 });
CareerEventSchema.index({ userId: 1, type: 1 });
CareerEventSchema.index({ userId: 1, starred: 1 });
CareerEventSchema.index({ userId: 1, isArchived: 1 });

/**
 * Text search
 */
CareerEventSchema.index({ title: 'text', description: 'text', company: 'text' });

// ═══════════════════════════════════════════════════════════
// VIRTUAL PROPERTIES
// ═══════════════════════════════════════════════════════════

/**
 * daysUntilEvent - Calculate days remaining
 */
CareerEventSchema.virtual('daysUntilEvent').get(function() {
  const now = new Date();
  const eventDate = new Date(this.date);
  const diffTime = eventDate - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

/**
 * isPast - Is event in the past?
 */
CareerEventSchema.virtual('isPast').get(function() {
  return new Date(this.date) < new Date();
});

/**
 * preparationProgress - % of steps completed
 */
CareerEventSchema.virtual('preparationProgress').get(function() {
  if (this.preparationSteps.length === 0) return 0;
  
  const completed = this.preparationSteps.filter(step => step.isCompleted).length;
  return Math.round((completed / this.preparationSteps.length) * 100);
});

// Make virtuals appear in JSON
CareerEventSchema.set('toJSON', { virtuals: true });
CareerEventSchema.set('toObject', { virtuals: true });

// ═══════════════════════════════════════════════════════════
// INSTANCE METHODS
// ═══════════════════════════════════════════════════════════

/**
 * addPreparationStep() - Add new preparation step
 */
CareerEventSchema.methods.addPreparationStep = function(title, description = '') {
  this.preparationSteps.push({
    title,
    description,
    isCompleted: false,
    order: this.preparationSteps.length
  });
  return this;
};

/**
 * completeStep() - Mark step as complete
 */
CareerEventSchema.methods.completeStep = function(stepId) {
  const step = this.preparationSteps.id(stepId);
  if (step) {
    step.isCompleted = true;
    step.completedAt = new Date();
  }
  return this;
};

/**
 * uncompleteStep() - Mark step as incomplete
 */
CareerEventSchema.methods.uncompleteStep = function(stepId) {
  const step = this.preparationSteps.id(stepId);
  if (step) {
    step.isCompleted = false;
    step.completedAt = null;
  }
  return this;
};

/**
 * markAsCompleted() - Complete the event
 */
CareerEventSchema.methods.markAsCompleted = function(outcome = '') {
  this.status = 'completed';
  this.outcome = outcome;
  return this;
};

// ═══════════════════════════════════════════════════════════
// STATIC METHODS
// ═══════════════════════════════════════════════════════════

/**
 * getUserEvents() - Get all events for user
 */
CareerEventSchema.statics.getUserEvents = function(userId, includeArchived = false) {
  const query = { userId };
  if (!includeArchived) query.isArchived = false;
  
  return this.find(query).sort({ date: 1 });
};

/**
 * getUpcomingEvents() - Events in the future
 */
CareerEventSchema.statics.getUpcomingEvents = function(userId, limit = null) {
  const query = this.find({
    userId,
    date: { $gte: new Date() },
    status: { $ne: 'completed' },
    isArchived: false
  }).sort({ date: 1 });
  
  return limit ? query.limit(limit) : query;
};

/**
 * getPastEvents() - Events in the past
 */
CareerEventSchema.statics.getPastEvents = function(userId) {
  return this.find({
    userId,
    date: { $lt: new Date() },
    isArchived: false
  }).sort({ date: -1 });
};

/**
 * getEventsByType() - Filter by type
 */
CareerEventSchema.statics.getEventsByType = function(userId, type) {
  return this.find({
    userId,
    type,
    isArchived: false
  }).sort({ date: 1 });
};

/**
 * getStarredEvents() - Get favorites
 */
CareerEventSchema.statics.getStarredEvents = function(userId) {
  return this.find({
    userId,
    starred: true,
    isArchived: false
  }).sort({ date: 1 });
};

/**
 * getUserStats() - Event statistics
 */
CareerEventSchema.statics.getUserStats = async function(userId) {
  const events = await this.find({ userId, isArchived: false });
  
  const now = new Date();
  const upcoming = events.filter(e => new Date(e.date) >= now && e.status !== 'completed');
  const past = events.filter(e => new Date(e.date) < now);
  const completed = events.filter(e => e.status === 'completed');
  
  return {
    total: events.length,
    upcoming: upcoming.length,
    past: past.length,
    completed: completed.length,
    byType: {
      interview: events.filter(e => e.type === 'interview').length,
      deadline: events.filter(e => e.type === 'deadline').length,
      goal: events.filter(e => e.type === 'goal').length,
      milestone: events.filter(e => e.type === 'milestone').length,
      networking: events.filter(e => e.type === 'networking').length,
      other: events.filter(e => e.type === 'other').length
    },
    starred: events.filter(e => e.starred).length
  };
};

// ═══════════════════════════════════════════════════════════
// MIDDLEWARE
// ═══════════════════════════════════════════════════════════

/**
 * Auto-update status based on date
 */
CareerEventSchema.pre('save', async function() {
  if (this.date < new Date() && this.status === 'upcoming') {
    this.status = 'in-progress';
  }
});

const CareerEvent = mongoose.model('CareerEvent', CareerEventSchema);

module.exports = CareerEvent;

/**
 * Event Model
 * 
 * PURPOSE: Schema for calendar events in Daily Planner
 * 
 * FIELDS:
 * - userId: Reference to User who owns the event
 * - title: Event title (max 200 chars)
 * - date: Event date
 * - description: Optional event description (max 500 chars)
 */

const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  date: {
    type: Date,
    required: true,
    index: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500,
    default: ''
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
eventSchema.index({ userId: 1, date: 1 });

module.exports = mongoose.model('Event', eventSchema);

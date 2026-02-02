/**
 * Goal Model
 * 
 * PURPOSE: Schema for user goals in Daily Planner
 * 
 * FIELDS:
 * - userId: Reference to User who owns the goal
 * - name: Goal name/title (max 200 chars)
 * - deadline: Target completion date
 */

const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  deadline: {
    type: Date,
    required: true,
    index: true
  },
  steps: [{
    id: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    completed: {
      type: Boolean,
      default: false
    }
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Goal', goalSchema);

/**
 * PlannerTask Model
 * 
 * PURPOSE: Schema for tasks in Daily Planner (separate from existing Task model)
 * 
 * FIELDS:
 * - userId: Reference to User who owns the task
 * - title: Task title (max 200 chars)
 * - completed: Whether task is completed
 * - dueDate: Optional due date
 * - goalId: Optional reference to a Goal
 * - order: Order/position for drag-and-drop
 * - archived: Whether task is archived
 * - completedAt: Timestamp when task was completed
 */

const mongoose = require('mongoose');

const plannerTaskSchema = new mongoose.Schema({
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
  completed: {
    type: Boolean,
    default: false,
    index: true
  },
  dueDate: {
    type: Date,
    index: true
  },
  goalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Goal',
    default: null
  },
  order: {
    type: Number,
    default: 0
  },
  archived: {
    type: Boolean,
    default: false,
    index: true
  },
  completedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Compound indexes for efficient queries
plannerTaskSchema.index({ userId: 1, archived: 1, completed: 1 });
plannerTaskSchema.index({ userId: 1, dueDate: 1 });

module.exports = mongoose.model('PlannerTask', plannerTaskSchema);

/**
 * UserProgress Model
 * 
 * PURPOSE: Tracks YOUR personal progress on DSA problems
 * 
 * KEY CONCEPTS:
 * 1. This is USER-WRITABLE (you control your own progress)
 * 2. Links to MasterProblem via problemId
 * 3. Each user has SEPARATE progress on the same problem
 * 
 * THINK OF IT LIKE:
 * - MasterProblem = Netflix movie catalog (global)
 * - UserProgress = Your watch history (personal)
 * 
 * RELATIONSHIP:
 * One MasterProblem → Many UserProgress documents (one per user)
 */

const mongoose = require('mongoose');

/**
 * STEP 1: Define the Schema
 * 
 * This schema is MUCH simpler than MasterProblem
 * Why? It only tracks YOUR data, not problem metadata
 */
const UserProgressSchema = new mongoose.Schema({
  
  // ═══════════════════════════════════════════════════════════
  // RELATIONSHIP FIELDS (Links to other collections)
  // ═══════════════════════════════════════════════════════════
  
  /**
   * userId - Which user does this progress belong to?
   * 
   * WHY OBJECTID?
   * ObjectId is MongoDB's way of linking documents between collections
   * Like a foreign key in SQL, but more flexible
   * 
   * In future: This will link to User collection
   * For now: We'll use a placeholder string or ObjectId
   */
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',  // References the User model (we'll create this later)
    required: [true, 'User ID is required'],
    index: true   // Index because we'll query by userId A LOT
  },

  /**
   * problemId - Which problem is this progress for?
   * 
   * CHANGED: Now accepts both MongoDB ObjectIds AND custom string IDs
   * This allows support for external problem IDs like "striver-1", "leetcode-123"
   * 
   * Example:
   * MasterProblem: { _id: "695952ae8eabe01017afe120", title: "Two Sum" }
   * UserProgress:  { userId: "user1", problemId: "695952ae8eabe01017afe120", status: "solved" }
   * 
   * OR custom IDs:
   * UserProgress:  { userId: "user1", problemId: "striver-1", status: "solved" }
   */
  problemId: {
    type: mongoose.Schema.Types.Mixed,  // Changed from ObjectId to Mixed to support strings
    required: [true, 'Problem ID is required'],
    index: true   // Index for fast lookups
  },

  // ═══════════════════════════════════════════════════════════
  // PROGRESS TRACKING FIELDS
  // ═══════════════════════════════════════════════════════════
  
  /**
   * status - Your current state with this problem
   * 
   * WORKFLOW:
   * none → weak → revising → solved
   *   ↑                         ↓
   *   └──── can go back ────────┘
   * 
   * "none" = Just added to tracking, not attempted
   * "weak" = Tried but couldn't solve or took too long
   * "revising" = Solved but need more practice
   * "solved" = Confidently solved, understand fully
   */
  status: {
    type: String,
    enum: {
      values: ['none', 'weak', 'revising', 'solved'],
      message: '{VALUE} is not a valid status'
    },
    default: 'none'
  },

  /**
   * lastSolvedAt - When did you LAST solve/practice this?
   * 
   * WHY IMPORTANT?
   * Your frontend uses this for "decay calculation"
   * If lastSolvedAt > 7 days ago, problem becomes "stale"
   * 
   * WHEN TO UPDATE?
   * - Status changes to "solved" or "revising"
   * - User marks "practiced today"
   */
  lastSolvedAt: {
    type: Date,
    default: null  // null = never solved yet
  },



  // ═══════════════════════════════════════════════════════════
  // PERSONAL NOTES & LEARNING
  // ═══════════════════════════════════════════════════════════
  
  /**
   * notes - Your personal notes about the solution
   * 
   * Example:
   * "Used hashmap for O(n) solution. Key insight: store complement"
   * "Struggled with edge case of negative numbers"
   * 
   * WHY IMPORTANT?
   * When you revisit after 1 month, your notes save time!
   */
  notes: {
    type: String,
    trim: true,
    maxlength: 2000  // Limit to prevent huge text blocks
  },

  /**
   * approach - Which approach/algorithm did you use?
   * 
   * Example: "Two Pointers", "Binary Search", "Dynamic Programming"
   * 
   * WHY SEPARATE FROM NOTES?
   * Can filter: "Show me all problems I solved using DP"
   */
  approach: {
    type: String,
    trim: true
  },



  // ═══════════════════════════════════════════════════════════
  // BOOKMARKING
  // ═══════════════════════════════════════════════════════════
  
  /**
   * starred - Mark problems as favorites/important
   * 
   * Simple bookmark feature for quick access to important problems
   */
  starred: {
    type: Boolean,
    default: false
  }

}, {
  // ═══════════════════════════════════════════════════════════
  // SCHEMA OPTIONS
  // ═══════════════════════════════════════════════════════════
  
  timestamps: true,  // createdAt, updatedAt
  collection: 'user_progress'
});

// ═══════════════════════════════════════════════════════════
// COMPOUND INDEXES (CRITICAL for Performance)
// ═══════════════════════════════════════════════════════════

/**
 * UNIQUE COMPOUND INDEX: userId + problemId
 * 
 * WHY?
 * Prevents duplicate: User can't have TWO progress records for same problem
 * 
 * Example:
 * ✅ Allowed: { userId: "user1", problemId: "prob1" }
 * ❌ Blocked:  { userId: "user1", problemId: "prob1" } (duplicate!)
 * ✅ Allowed: { userId: "user2", problemId: "prob1" } (different user)
 * 
 * This is SUPER IMPORTANT!
 */
UserProgressSchema.index({ userId: 1, problemId: 1 }, { unique: true });

/**
 * Index on userId + status
 * 
 * WHY?
 * Common query: "Show me MY solved problems"
 * Common query: "Show me MY problems that need revision"
 */
UserProgressSchema.index({ userId: 1, status: 1 });

/**
 * Index on userId + lastSolvedAt
 * 
 * WHY?
 * Common query: "Show me problems I haven't practiced in 7+ days"
 * Used for decay calculation in frontend
 */
UserProgressSchema.index({ userId: 1, lastSolvedAt: -1 });

/**
 * Index on userId + starred
 * 
 * WHY?
 * Quick access to favorite problems
 */
UserProgressSchema.index({ userId: 1, starred: 1 });

// ═══════════════════════════════════════════════════════════
// INSTANCE METHODS
// ═══════════════════════════════════════════════════════════

/**
 * markAsSolved() - Convenience method to update status to solved
 * 
 * WHY INSTANCE METHOD?
 * Encapsulates logic: When marking solved, also update lastSolvedAt
 * 
 * Usage:
 *   const progress = await UserProgress.findOne({ userId, problemId });
 *   progress.markAsSolved();
 *   await progress.save();
 */
UserProgressSchema.methods.markAsSolved = function() {
  this.status = 'solved';
  this.lastSolvedAt = new Date();
  return this;
};

/**
 * markAsWeak() - Mark problem as weak (struggled with it)
 */
UserProgressSchema.methods.markAsWeak = function() {
  this.status = 'weak';
  return this;
};

/**
 * markAsRevising() - Mark for revision and update lastSolvedAt
 */
UserProgressSchema.methods.markAsRevising = function() {
  this.status = 'revising';
  this.lastSolvedAt = new Date();
  return this;
};

/**
 * isStale() - Check if problem needs revision (> 7 days)
 * 
 * YOUR FRONTEND LOGIC brought to backend!
 * 
 * Returns true if:
 * - Problem was solved/revised more than 7 days ago
 * - Used for "decay" in DSA score calculation
 */
UserProgressSchema.methods.isStale = function() {
  if (!this.lastSolvedAt) return false;
  
  const daysSince = Math.floor((Date.now() - this.lastSolvedAt) / (1000 * 60 * 60 * 24));
  return daysSince > 7;
};

/**
 * getDaysSinceLastSolved() - Get number of days since last practice
 * 
 * Returns: Number or null
 */
UserProgressSchema.methods.getDaysSinceLastSolved = function() {
  if (!this.lastSolvedAt) return null;
  
  return Math.floor((Date.now() - this.lastSolvedAt) / (1000 * 60 * 60 * 24));
};

// ═══════════════════════════════════════════════════════════
// STATIC METHODS
// ═══════════════════════════════════════════════════════════

/**
 * getUserProgress() - Get all progress for a specific user
 * 
 * Returns progress WITH problem details (using populate)
 * 
 * POPULATE MAGIC:
 * Instead of: { problemId: "abc123" }
 * You get: { problemId: { title: "Two Sum", difficulty: "Easy", ... } }
 */
UserProgressSchema.statics.getUserProgress = function(userId, filters = {}) {
  const query = { userId, ...filters };
  
  return this.find(query)
    .populate('problemId')  // Fill in problem details from MasterProblem
    .sort({ updatedAt: -1 });  // Newest first
};

/**
 * getProgressByStatus() - Get user's problems filtered by status
 * 
 * Example: Get all problems user marked as "weak"
 */
UserProgressSchema.statics.getProgressByStatus = function(userId, status) {
  return this.find({ userId, status })
    .populate('problemId')
    .sort({ updatedAt: -1 });
};

/**
 * getStaleProblems() - Get problems that need revision (> 7 days)
 * 
 * CRITICAL for your "decay" feature!
 */
UserProgressSchema.statics.getStaleProblems = function(userId) {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  
  return this.find({
    userId,
    status: { $in: ['solved', 'revising'] },  // Only solved/revising can be stale
    lastSolvedAt: { $lt: sevenDaysAgo }  // Last solved > 7 days ago
  }).populate('problemId');
};

/**
 * getUserStats() - Calculate user's DSA statistics
 * 
 * Returns: { total, solved, revising, weak, none }
 * 
 * YOUR FRONTEND dsaScore.js logic, but in backend!
 */
UserProgressSchema.statics.getUserStats = async function(userId) {
  const stats = await this.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    { $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
  
  // Convert array to object
  const result = {
    total: 0,
    solved: 0,
    revising: 0,
    weak: 0,
    none: 0
  };
  
  stats.forEach(stat => {
    result[stat._id] = stat.count;
    result.total += stat.count;
  });
  
  return result;
};

/**
 * createOrUpdate() - Find existing progress or create new
 * 
 * WHY?
 * When user updates status, we need to:
 * - If progress exists → Update it
 * - If no progress → Create new document
 * 
 * This method handles both cases!
 */
UserProgressSchema.statics.createOrUpdate = async function(userId, problemId, updates) {
  return this.findOneAndUpdate(
    { userId, problemId },  // Find by userId + problemId
    { 
      $set: updates,         // Update fields
      $setOnInsert: { userId, problemId }  // Set these only if creating new
    },
    { 
      new: true,             // Return updated document
      upsert: true,          // Create if doesn't exist
      runValidators: true    // Validate updates
    }
  );
};

// ═══════════════════════════════════════════════════════════
// MIDDLEWARE HOOKS
// ═══════════════════════════════════════════════════════════

/**
 * Pre-save hook: Auto-update lastSolvedAt when status changes to solved
 * 
 * WHAT IS THIS?
 * Middleware = Code that runs BEFORE or AFTER certain operations
 * 
 * This runs BEFORE .save()
 */
UserProgressSchema.pre('save', async function() {
  // If status was changed to 'solved' or 'revising'
  if (this.isModified('status') && (this.status === 'solved' || this.status === 'revising')) {
    // Auto-update lastSolvedAt
    if (!this.lastSolvedAt || this.isNew) {
      this.lastSolvedAt = new Date();
    }
  }
});



// ═══════════════════════════════════════════════════════════
// VIRTUAL PROPERTIES (Computed fields)
// ═══════════════════════════════════════════════════════════

/**
 * WHAT ARE VIRTUALS?
 * Fields that are COMPUTED on-the-fly, not stored in database
 * 
 * Like a spreadsheet formula: Value is calculated when accessed
 */

/**
 * Virtual: daysSinceLastSolved
 * 
 * Usage:
 *   const progress = await UserProgress.findOne(...);
 *   console.log(progress.daysSinceLastSolved);  // Computed on access!
 */
UserProgressSchema.virtual('daysSinceLastSolved').get(function() {
  return this.getDaysSinceLastSolved();
});

/**
 * Virtual: needsRevision
 * 
 * Returns true if problem is stale
 */
UserProgressSchema.virtual('needsRevision').get(function() {
  return this.isStale();
});

// Make virtuals appear in JSON output
UserProgressSchema.set('toJSON', { virtuals: true });
UserProgressSchema.set('toObject', { virtuals: true });

// ═══════════════════════════════════════════════════════════
// CREATE AND EXPORT MODEL
// ═══════════════════════════════════════════════════════════

const UserProgress = mongoose.model('UserProgress', UserProgressSchema);

module.exports = UserProgress;

/**
 * ═══════════════════════════════════════════════════════════
 * LEARNING SUMMARY
 * ═══════════════════════════════════════════════════════════
 * 
 * NEW CONCEPTS YOU LEARNED:
 * 
 * 1. Relationships with ObjectId
 *    - ref: 'MasterProblem' (links collections)
 *    - populate() fills in referenced data
 * 
 * 2. Compound Indexes
 *    - { userId: 1, problemId: 1 } unique (prevents duplicates)
 *    - Multiple fields indexed together
 * 
 * 3. Middleware Hooks
 *    - pre('save') runs before saving
 *    - Auto-update fields based on changes
 * 
 * 4. Virtual Properties
 *    - Computed fields (not stored in DB)
 *    - Calculated when accessed
 * 
 * 5. Upsert Pattern
 *    - createOrUpdate() method
 *    - Update if exists, create if doesn't
 * 
 * 6. Aggregation Preview
 *    - getUserStats() uses $group
 *    - Calculates counts by status
 * 
 * MASTER + PROGRESS PATTERN:
 * 
 * MasterProblem (read-only catalog):
 *   { _id: "prob1", title: "Two Sum", difficulty: "Easy" }
 * 
 * UserProgress (YOUR tracking):
 *   { userId: "user1", problemId: "prob1", status: "solved" }
 *   { userId: "user2", problemId: "prob1", status: "weak" }
 * 
 * NEXT STEPS:
 * 1. Create a controller to test these models together
 * 2. Create seed script to import Striver sheet
 * 3. Test creating progress documents
 * 4. Build API endpoints
 * 
 * ═══════════════════════════════════════════════════════════
 */

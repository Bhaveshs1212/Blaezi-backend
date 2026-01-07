/**
 * MasterProblem Model
 * 
 * PURPOSE: This stores the GLOBAL catalog of DSA problems (like Striver SDE Sheet)
 * 
 * KEY CONCEPTS:
 * 1. This is READ-ONLY for regular users (only admins/system can add problems)
 * 2. Everyone sees the SAME problems (no duplicates)
 * 3. Users track their progress in a SEPARATE collection (UserProgress)
 * 
 * THINK OF IT LIKE:
 * - Netflix catalog of movies (master data)
 * - Your "watched list" is separate (user data)
 */

const mongoose = require('mongoose');

/**
 * STEP 1: Define the Schema (Blueprint)
 * 
 * Schema = Rules for what data looks like
 * Like a form that MUST be filled out correctly
 */
const MasterProblemSchema = new mongoose.Schema({
  
  // ═══════════════════════════════════════════════════════════
  // BASIC IDENTIFICATION
  // ═══════════════════════════════════════════════════════════
  
  /**
   * title - The problem name (e.g., "Two Sum", "Valid Parentheses")
   * 
   * Why required? Every problem needs a name
   * Why unique? Prevents duplicate problems in catalog
   * Why trim? Removes extra spaces ("  Two Sum  " → "Two Sum")
   */
  title: {
    type: String,
    required: [true, 'Problem title is required'],  // Error message if missing
    unique: true,                                    // Can't have two "Two Sum" problems
    trim: true                                       // Auto-remove leading/trailing spaces
  },

  /**
   * problemNumber - Position in the sheet (e.g., Problem #1, #2, #3)
   * 
   * Why? Helps users follow sheets in order
   * Why not required? Some problems might not have a number
   */
  problemNumber: {
    type: Number,
    sparse: true  // Allows multiple null values (not all problems have numbers)
  },

  // ═══════════════════════════════════════════════════════════
  // PROBLEM CLASSIFICATION
  // ═══════════════════════════════════════════════════════════
  
  /**
   * difficulty - How hard is this problem?
   * 
   * Why enum? Only these 3 values allowed (prevents typos)
   * Why required? Every problem has a difficulty level
   * 
   * ENUM = Enumeration = Fixed list of allowed values
   */
  difficulty: {
    type: String,
    enum: {
      values: ['Easy', 'Medium', 'Hard'],
      message: '{VALUE} is not a valid difficulty. Use Easy, Medium, or Hard.'
    },
    required: [true, 'Difficulty is required']
  },

  /**
   * topic - Main category (Arrays, Strings, Trees, etc.)
   * 
   * Why not enum? Too many topics, hard to predict all
   * Why required? Helps with filtering and organization
   */
  topic: {
    type: String,
    required: [true, 'Topic is required'],
    trim: true
  },

  /**
   * subtopics - Additional tags (e.g., ["Two Pointers", "Sliding Window"])
   * 
   * Why array? A problem can have multiple techniques
   * Why not required? Optional detailed categorization
   */
  subtopics: {
    type: [String],  // Array of strings
    default: []      // Empty array if not provided
  },

  // ═══════════════════════════════════════════════════════════
  // SOURCE INFORMATION
  // ═══════════════════════════════════════════════════════════
  
  /**
   * platform - Where to solve this (LeetCode, GeeksforGeeks, etc.)
   * 
   * Why enum? We know the major platforms
   * Why required? Users need to know where to find it
   */
  platform: {
    type: String,
    enum: ['LeetCode', 'GeeksforGeeks', 'GFG', 'CodeForces', 'HackerRank', 'InterviewBit', 'Coding Ninjas', 'SPOJ', 'Other'],
    default: 'LeetCode'  // Most common platform
  },

  /**
   * url - Direct link to the problem
   * 
   * Why not required? We might add problems before getting links
   * Why trim? Clean up URLs
   */
  url: {
    type: String,
    trim: true
  },

  /**
   * sheet - Which curated list is this from?
   * 
   * Examples: "Striver SDE Sheet", "Blind 75", "NeetCode 150"
   * Why? Users follow specific sheets
   */
  sheet: {
    type: String,
    trim: true
  },

  // ═══════════════════════════════════════════════════════════
  // ADDITIONAL METADATA
  // ═══════════════════════════════════════════════════════════
  
  /**
   * companies - Which companies ask this problem in interviews?
   * 
   * Example: ["Google", "Amazon", "Microsoft"]
   * Why array? Problem can be asked by multiple companies
   */
  companies: {
    type: [String],
    default: []
  },

  /**
   * description - Brief problem description (optional)
   * 
   * Why? Quick preview without opening external link
   */
  description: {
    type: String,
    trim: true
  },

  /**
   * hints - Array of hints to help solve the problem
   * 
   * Example: ["Try using a hash map", "Think about two pointers"]
   */
  hints: {
    type: [String],
    default: []
  },

  /**
   * similarProblems - IDs of related problems
   * 
   * Example: If this is "Two Sum", similar might be "3Sum", "4Sum"
   * Why ObjectId? References other problems in this same collection
   */
  similarProblems: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MasterProblem'  // Points to another document in MasterProblem collection
  }],

  // ═══════════════════════════════════════════════════════════
  // STATS & METADATA (From platform APIs)
  // ═══════════════════════════════════════════════════════════
  
  /**
   * acceptance - What % of people solve it? (from LeetCode)
   * 
   * Example: 49.5 means 49.5% acceptance rate
   * Why? Indicates real-world difficulty
   */
  acceptance: {
    type: Number,
    min: 0,
    max: 100
  },

  /**
   * likes - Community likes (from platform)
   */
  likes: {
    type: Number,
    default: 0
  },

  /**
   * isActive - Is this problem still available?
   * 
   * Why? Some problems get removed from platforms
   * Default: true (assume available)
   */
  isActive: {
    type: Boolean,
    default: true
  }

}, {
  // ═══════════════════════════════════════════════════════════
  // SCHEMA OPTIONS
  // ═══════════════════════════════════════════════════════════
  
  /**
   * timestamps: true
   * 
   * Mongoose automatically creates:
   * - createdAt: When this problem was added to database
   * - updatedAt: When this problem was last modified
   * 
   * We don't have to manage these manually!
   */
  timestamps: true,

  /**
   * collection: 'master_problems'
   * 
   * Explicitly name the MongoDB collection
   * Without this, Mongoose would create 'masterproblems' (lowercase, no underscore)
   */
  collection: 'master_problems'
});

// ═══════════════════════════════════════════════════════════
// INDEXES (Performance Optimization)
// ═══════════════════════════════════════════════════════════

/**
 * WHAT ARE INDEXES?
 * 
 * Think of a book:
 * - WITHOUT index: Read every page to find "MongoDB" (SLOW)
 * - WITH index: Look at index page, jump directly to page 45 (FAST)
 * 
 * Database indexes work the same way!
 */

/**
 * Index on 'difficulty'
 * 
 * Why? Users filter by difficulty A LOT
 * Query: "Show me all Easy problems"
 * Without index: Check every problem (SLOW if 1000+ problems)
 * With index: Jump directly to Easy problems (FAST)
 */
MasterProblemSchema.index({ difficulty: 1 });  // 1 = ascending order

/**
 * Index on 'topic'
 * 
 * Why? Users filter by topic frequently
 * Query: "Show me all Array problems"
 */
MasterProblemSchema.index({ topic: 1 });

/**
 * Index on 'platform'
 * 
 * Why? Users might filter by platform
 * Query: "Show me all LeetCode problems"
 */
MasterProblemSchema.index({ platform: 1 });

/**
 * Compound index on 'sheet' and 'problemNumber'
 * 
 * Why? Users want to see "Striver SDE Sheet problems in order"
 * Query: "Show me Striver sheet, sorted by problem number"
 * Compound = Multiple fields together
 */
MasterProblemSchema.index({ sheet: 1, problemNumber: 1 });

/**
 * Text index on 'title' and 'description'
 * 
 * Why? Users want to SEARCH for problems
 * Query: "Search for problems containing 'binary tree'"
 * Text index enables $text search in MongoDB
 */
MasterProblemSchema.index({ 
  title: 'text', 
  description: 'text' 
});

// ═══════════════════════════════════════════════════════════
// INSTANCE METHODS (Functions on individual problems)
// ═══════════════════════════════════════════════════════════

/**
 * getDisplayName() - Get formatted problem name with number
 * 
 * WHAT IS THIS?
 * This is a custom function we can call on ANY problem document
 * 
 * Example usage:
 *   const problem = await MasterProblem.findById(id);
 *   console.log(problem.getDisplayName());
 *   // Output: "1. Two Sum" or just "Two Sum"
 */
MasterProblemSchema.methods.getDisplayName = function() {
  // If problem has a number, include it
  if (this.problemNumber) {
    return `${this.problemNumber}. ${this.title}`;
  }
  // Otherwise just return title
  return this.title;
};

/**
 * getDifficultyColor() - Get color code for frontend display
 * 
 * Why? Frontend needs consistent colors for difficulty badges
 * Returns color codes that frontend can use
 */
MasterProblemSchema.methods.getDifficultyColor = function() {
  const colors = {
    'Easy': 'green',
    'Medium': 'orange',
    'Hard': 'red'
  };
  return colors[this.difficulty] || 'gray';
};

// ═══════════════════════════════════════════════════════════
// STATIC METHODS (Functions on the Model itself)
// ═══════════════════════════════════════════════════════════

/**
 * WHAT'S THE DIFFERENCE?
 * 
 * Instance method (methods.xxx): Called on a SINGLE document
 *   problem.getDisplayName()
 * 
 * Static method (statics.xxx): Called on the MODEL
 *   MasterProblem.getBySheet('Striver')
 */

/**
 * getBySheet() - Get all problems from a specific sheet
 * 
 * This is a convenience function for controllers
 * Instead of writing the query logic everywhere, centralize it here
 */
MasterProblemSchema.statics.getBySheet = function(sheetName) {
  return this.find({ sheet: sheetName, isActive: true })
    .sort({ problemNumber: 1 })  // Sort by problem number (1, 2, 3...)
    .select('-__v')  // Exclude version key from results
    .lean();  // Return plain JS objects with _id included
};

/**
 * getByDifficultyAndTopic() - Filter by both difficulty and topic
 * 
 * Example: "Get all Medium Array problems"
 */
MasterProblemSchema.statics.getByDifficultyAndTopic = function(difficulty, topic) {
  return this.find({ 
    difficulty, 
    topic, 
    isActive: true 
  })
  .sort({ title: 1 })
  .lean();  // Return plain JS objects with _id included
};

/**
 * searchProblems() - Full-text search
 * 
 * Uses the text index we created above
 * Example: Search for "binary tree traversal"
 */
MasterProblemSchema.statics.searchProblems = function(searchTerm) {
  return this.find(
    { $text: { $search: searchTerm } },
    { score: { $meta: 'textScore' } }  // Include relevance score
  )
  .sort({ score: { $meta: 'textScore' } })  // Sort by relevance
  .lean();  // Return plain JS objects with _id included
};

// ═══════════════════════════════════════════════════════════
// CREATE AND EXPORT THE MODEL
// ═══════════════════════════════════════════════════════════

/**
 * WHAT DOES THIS DO?
 * 
 * mongoose.model() creates a "Model" from the Schema
 * 
 * Schema = Blueprint (rules and structure)
 * Model = Constructor (actually creates documents)
 * 
 * Think of it like:
 * - Schema = House blueprint
 * - Model = Builder that builds houses from blueprint
 */
const MasterProblem = mongoose.model('MasterProblem', MasterProblemSchema);

/**
 * Export so other files can use it
 * 
 * Now in controllers, we can do:
 *   const MasterProblem = require('./models/MasterProblem');
 *   const problems = await MasterProblem.find();
 */
module.exports = MasterProblem;

/**
 * ═══════════════════════════════════════════════════════════
 * LEARNING SUMMARY
 * ═══════════════════════════════════════════════════════════
 * 
 * You just learned:
 * 
 * 1. Schema Definition
 *    - Field types (String, Number, Boolean, Array)
 *    - Validation (required, enum, min, max)
 *    - Options (trim, default, unique)
 * 
 * 2. Relationships
 *    - ObjectId references (similarProblems)
 *    - Self-referencing (problem → problem)
 * 
 * 3. Indexes
 *    - Single field indexes (performance)
 *    - Compound indexes (multiple fields)
 *    - Text indexes (search functionality)
 * 
 * 4. Methods
 *    - Instance methods (on individual documents)
 *    - Static methods (on the Model)
 * 
 * 5. Mongoose Magic
 *    - Automatic timestamps
 *    - Automatic validation
 *    - Type casting
 * 
 * NEXT STEPS:
 * 1. Create UserProgress model (tracks YOUR progress)
 * 2. Create seed script (import Striver sheet)
 * 3. Create controllers (query this data)
 * 4. Create routes (expose via API)
 * 
 * ═══════════════════════════════════════════════════════════
 */

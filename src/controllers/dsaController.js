/**
 * DSA Controller
 * 
 * PURPOSE: Business logic for DSA problem operations
 * 
 * ARCHITECTURE LAYER:
 * Routes → Controller → Model → Database
 * 
 * CONTROLLER RESPONSIBILITIES:
 * - Validate request data
 * - Call model methods
 * - Handle errors
 * - Format responses
 */

const mongoose = require('mongoose');
const MasterProblem = require('../models/MasterProblem');
const UserProgress = require('../models/UserProgress');
const striverSheetService = require('../services/striverSheetService');

/**
 * GET /api/dsa/problems
 * 
 * Get all problems from master catalog with optional filters
 * 
 * QUERY PARAMS:
 * - difficulty: Easy/Medium/Hard
 * - topic: Array, Linked List, etc.
 * - sheet: Striver SDE Sheet, etc.
 * - platform: LeetCode, GeeksforGeeks, etc.
 * - search: Text search in title/description
 * - source: "striver" (fetch from Striver sheet) or "database" (default)
 */
exports.getAllProblems = async (req, res) => {
  try {
    const { difficulty, topic, sheet, platform, search, source } = req.query;
    
    // If source is "striver", fetch directly from Striver sheet service
    if (source === 'striver') {
      let result;
      
      if (difficulty) {
        result = await striverSheetService.getProblemsByDifficulty(difficulty);
      } else if (topic) {
        result = await striverSheetService.getProblemsByTopic(topic);
      } else if (search) {
        result = await striverSheetService.searchProblems(search);
      } else {
        result = await striverSheetService.getStriverSDESheetProblems();
      }
      
      return res.json({
        success: true,
        count: result.count,
        data: result.data,
        source: 'Striver SDE Sheet'
      });
    }
    
    // Otherwise, fetch from database (existing functionality)
    // Build filter object
    let filter = { isActive: true };
    
    if (difficulty) filter.difficulty = difficulty;
    if (topic) filter.topic = topic;
    if (sheet) filter.sheet = sheet;
    if (platform) filter.platform = platform;
    
    let problems;
    
    // Text search if provided
    if (search) {
      problems = await MasterProblem.searchProblems(search).lean();
    } else {
      problems = await MasterProblem.find(filter)
        .select('+_id')  // Explicitly include _id
        .sort({ problemNumber: 1 })
        .lean();  // Convert to plain JS objects for proper JSON serialization
    }
    
    // Add 'id' alias for frontend compatibility (some frameworks expect 'id' instead of '_id')
    const problemsWithId = problems.map(problem => ({
      ...problem,
      id: problem._id.toString()  // Add 'id' field as string version of _id
    }));
    
    res.json({
      success: true,
      count: problemsWithId.length,
      data: problemsWithId,
      source: 'Database'
    });
    
  } catch (error) {
    console.error('Error fetching problems:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch problems',
      error: error.message
    });
  }
};

/**
 * GET /api/dsa/problems/:id
 * 
 * Get single problem by ID
 */
exports.getProblemById = async (req, res) => {
  try {
    const problem = await MasterProblem.findById(req.params.id)
      .select('+_id')  // Explicitly include _id
      .populate('similarProblems')
      .lean();  // Convert to plain JS object for proper JSON serialization
    
    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found'
      });
    }
    
    // Add 'id' alias for frontend compatibility
    const problemWithId = {
      ...problem,
      id: problem._id.toString()
    };
    
    res.json({
      success: true,
      data: problemWithId
    });
    
  } catch (error) {
    console.error('Error fetching problem:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch problem',
      error: error.message
    });
  }
};

/**
 * GET /api/dsa/progress
 * 
 * Get user's progress on all problems
 * 
 * QUERY PARAMS:
 * - status: none/weak/revising/solved
 * - starred: true/false
 */
exports.getUserProgress = async (req, res) => {
  try {
    // Get userId from verified JWT token (set by auth middleware)
    const userId = req.user.id;
    
    const { status, starred } = req.query;
    
    let filter = {};
    if (status) filter.status = status;
    if (starred !== undefined) filter.starred = starred === 'true';
    
    const progress = await UserProgress.getUserProgress(userId, filter);
    
    res.json({
      success: true,
      count: progress.length,
      data: progress
    });
    
  } catch (error) {
    console.error('Error fetching user progress:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch progress',
      error: error.message
    });
  }
};

/**
 * POST /api/dsa/progress
 * 
 * Create or update progress for a problem
 * 
 * BODY:
 * {
 *   "problemId": "...",
 *   "status": "solved",
 *   "notes": "Used hash map",
 *   "approach": "Two Pointers",
 *   "starred": false
 * }
 */
exports.createOrUpdateProgress = async (req, res) => {
  try {
    // Get userId from verified JWT token
    const userId = req.user.id;
    
    const { problemId, status, notes, approach, starred } = req.body;
    
    if (!problemId) {
      return res.status(400).json({
        success: false,
        message: 'Problem ID required'
      });
    }
    
    // Verify problem exists (only for MongoDB ObjectIds)
    // For custom string IDs, we skip this check and let UserProgress creation handle it
    if (mongoose.Types.ObjectId.isValid(problemId)) {
      const problem = await MasterProblem.findById(problemId);
      if (!problem) {
        return res.status(404).json({
          success: false,
          message: 'Problem not found'
        });
      }
    }
    // For custom string IDs (like "striver-1"), we allow progress without verification
    
    // Create or update progress
    const updates = {};
    if (status) updates.status = status;
    if (notes !== undefined) updates.notes = notes;
    if (approach !== undefined) updates.approach = approach;
    if (starred !== undefined) updates.starred = starred;
    
    const progress = await UserProgress.createOrUpdate(userId, problemId, updates);
    
    // Populate problem details for response (only works for ObjectIds)
    if (mongoose.Types.ObjectId.isValid(problemId)) {
      try {
        await progress.populate('problemId');
      } catch (err) {
        // If populate fails, continue without it
        console.log('Could not populate problemId:', err.message);
      }
    }
    
    res.json({
      success: true,
      data: progress
    });
    
  } catch (error) {
    console.error('Error updating progress:', error);
    
    // Handle duplicate error (should not happen with createOrUpdate)
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Progress already exists for this problem'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to update progress',
      error: error.message
    });
  }
};

/**
 * PATCH /api/dsa/progress/:problemId
 * 
 * Update specific progress fields
 */
exports.updateProgress = async (req, res) => {
  try {
    // Get userId from verified JWT token
    const userId = req.user.id;
    const { problemId } = req.params;
    
    const progress = await UserProgress.findOne({ userId, problemId });
    
    if (!progress) {
      return res.status(404).json({
        success: false,
        message: 'Progress not found'
      });
    }
    
    // Update fields
    const { status, notes, approach, starred } = req.body;
    
    if (status) progress.status = status;
    if (notes !== undefined) progress.notes = notes;
    if (approach !== undefined) progress.approach = approach;
    if (starred !== undefined) progress.starred = starred;
    
    await progress.save();
    await progress.populate('problemId');
    
    res.json({
      success: true,
      data: progress
    });
    
  } catch (error) {
    console.error('Error updating progress:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update progress',
      error: error.message
    });
  }
};

/**
 * GET /api/dsa/stats
 * 
 * Get user's DSA statistics
 * 
 * RETURNS:
 * {
 *   "total": 150,
 *   "solved": 45,
 *   "revising": 12,
 *   "weak": 8,
 *   "none": 85,
 *   "staleCount": 5
 * }
 */
exports.getUserStats = async (req, res) => {
  try {
    // Get userId from verified JWT token
    const userId = req.user.id;
    
    // Get basic stats
    const stats = await UserProgress.getUserStats(userId);
    
    // Get stale problems count
    const staleProblems = await UserProgress.getStaleProblems(userId);
    stats.staleCount = staleProblems.length;
    
    res.json({
      success: true,
      data: stats
    });
    
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: error.message
    });
  }
};

/**
 * GET /api/dsa/stale
 * 
 * Get problems that need revision (> 7 days old)
 */
exports.getStaleProblems = async (req, res) => {
  try {
    // Get userId from verified JWT token
    const userId = req.user.id;
    const days = parseInt(req.query.days) || 7;
    
    const staleProblems = await UserProgress.getStaleProblems(userId);
    
    res.json({
      success: true,
      count: staleProblems.length,
      data: staleProblems
    });
    
  } catch (error) {
    console.error('Error fetching stale problems:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch stale problems',
      error: error.message
    });
  }
};

/**
 * DELETE /api/dsa/progress/:problemId
 * 
 * Remove a problem from tracking
 */
exports.deleteProgress = async (req, res) => {
  try {
    // Get userId from verified JWT token
    const userId = req.user.id;
    const { problemId } = req.params;
    
    const result = await UserProgress.findOneAndDelete({ userId, problemId });
    
    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Progress not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Progress removed successfully'
    });
    
  } catch (error) {
    console.error('Error deleting progress:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete progress',
      error: error.message
    });
  }
};

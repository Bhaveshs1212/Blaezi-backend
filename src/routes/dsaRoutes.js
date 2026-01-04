/**
 * DSA Routes
 * 
 * PURPOSE: Define HTTP endpoints for DSA operations
 * 
 * BASE PATH: /api/dsa
 * 
 * ROUTE STRUCTURE:
 * GET    /api/dsa/problems          - Get all problems (with filters)
 * GET    /api/dsa/problems/:id      - Get single problem
 * GET    /api/dsa/progress          - Get user's progress
 * POST   /api/dsa/progress          - Create/update progress
 * PATCH  /api/dsa/progress/:problemId - Update specific progress
 * DELETE /api/dsa/progress/:problemId - Remove from tracking
 * GET    /api/dsa/stats             - Get user statistics
 * GET    /api/dsa/stale             - Get stale problems
 */

const express = require('express');
const router = express.Router();
const dsaController = require('../controllers/dsaController');
const auth = require('../middleware/auth');  // Import security guard!

// ═══════════════════════════════════════════════════════════
// PROBLEM ROUTES (Master Catalog)
// ═══════════════════════════════════════════════════════════

/**
 * GET /api/dsa/problems
 * 
 * Get all problems with optional filters
 * 
 * QUERY PARAMS:
 * - difficulty: Easy/Medium/Hard
 * - topic: Array, Linked List, etc.
 * - sheet: Striver SDE Sheet, etc.
 * - platform: LeetCode, GeeksforGeeks
 * - search: Text search
 * 
 * EXAMPLE:
 * GET /api/dsa/problems?difficulty=Easy&topic=Array
 * GET /api/dsa/problems?search=two+sum
 */
router.get('/problems', dsaController.getAllProblems);

/**
 * GET /api/dsa/problems/:id
 * 
 * Get single problem by ID
 * 
 * EXAMPLE:
 * GET /api/dsa/problems/507f1f77bcf86cd799439011
 */
router.get('/problems/:id', dsaController.getProblemById);

// ═══════════════════════════════════════════════════════════
// USER PROGRESS ROUTES
// ═══════════════════════════════════════════════════════════

/**
 * GET /api/dsa/progress
 * 
 * Get user's progress on problems
 * 🔒 PROTECTED - Requires authentication
 * 
 * QUERY PARAMS:
 * - status: none/weak/revising/solved
 * - starred: true/false
 * 
 * EXAMPLE:
 * GET /api/dsa/progress?status=solved
 * GET /api/dsa/progress?starred=true
 */
router.get('/progress', auth, dsaController.getUserProgress);

/**
 * POST /api/dsa/progress
 * 
 * Create or update progress for a problem
 * 🔒 PROTECTED - Requires authentication
 * 
 * BODY:
 * {
 *   "problemId": "507f...",
 *   "status": "solved",
 *   "notes": "Used hash map",
 *   "approach": "Two Pointers",
 *   "starred": false
 * }
 */
router.post('/progress', auth, dsaController.createOrUpdateProgress);

/**
 * PATCH /api/dsa/progress/:problemId
 * 
 * Update specific progress fields
 * 🔒 PROTECTED - Requires authentication
 * 
 * BODY:
 * {
 *   "status": "revising",
 *   "notes": "Need more practice"
 * }
 */
router.patch('/progress/:problemId', auth, dsaController.updateProgress);

/**
 * DELETE /api/dsa/progress/:problemId
 * 
 * Remove problem from tracking
 * 🔒 PROTECTED - Requires authentication
 */
router.delete('/progress/:problemId', auth, dsaController.deleteProgress);

// ═══════════════════════════════════════════════════════════
// STATISTICS ROUTES
// ═══════════════════════════════════════════════════════════

/**
 * GET /api/dsa/stats
 * 
 * Get user's DSA statistics
 * 🔒 PROTECTED - Requires authentication
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
router.get('/stats', auth, dsaController.getUserStats);

/**
 * GET /api/dsa/stale
 * 
 * Get problems needing revision (> 7 days)
 * 🔒 PROTECTED - Requires authentication
 */
router.get('/stale', auth, dsaController.getStaleProblems);
module.exports = router;

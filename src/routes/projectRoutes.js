/**
 * Project Routes
 * 
 * BASE PATH: /api/projects
 * 
 * ROUTE STRUCTURE:
 * GET    /api/projects          - Get all projects
 * GET    /api/projects/starred  - Get starred projects
 * GET    /api/projects/stats    - Get statistics
 * GET    /api/projects/:id      - Get single project
 * POST   /api/projects/sync     - Sync from GitHub
 * PATCH  /api/projects/:id      - Update project
 * DELETE /api/projects/:id      - Remove project
 */

const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const auth = require('../middleware/auth'); // Security guard!

// ═══════════════════════════════════════════════════════════
// QUERY ROUTES (must come before :id routes)
// ═══════════════════════════════════════════════════════════

/**
 * GET /api/projects/starred
 * 
 * Get starred/favorite projects
 * 🔒 PROTECTED - Requires authentication
 */
router.get('/starred', auth, projectController.getStarredProjects);

/**
 * GET /api/projects/stats
 * 
 * Get project statistics
 * 🔒 PROTECTED - Requires authentication
 */
router.get('/stats', auth, projectController.getProjectStats);

/**
 * GET /api/projects/github/:username
 * 
 * Fetch repositories directly from GitHub (live data, not saved)
 * 🔒 PROTECTED - Requires authentication
 * 
 * QUERY PARAMS:
 * - language: Filter by programming language
 * - minStars: Minimum number of stars
 * - excludeForks: true/false
 * - onlyPublic: true/false
 */
router.get('/github/:username', auth, projectController.fetchFromGitHub);

/**
 * GET /api/projects/test-github/:username
 * 
 * Test GitHub API connection (no auth required for debugging)
 */
router.get('/test-github/:username', async (req, res) => {
  try {
    const githubService = require('../services/githubService');
    const result = await githubService.fetchUserRepositories(req.params.username);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ═══════════════════════════════════════════════════════════
// MAIN ROUTES
// ═══════════════════════════════════════════════════════════

/**
 * GET /api/projects
 * 
 * Get all projects with filters
 * 🔒 PROTECTED - Requires authentication
 * 
 * QUERY PARAMS:
 * - status: planning/in-progress/completed/archived
 * - starred: true/false
 * - language: JavaScript, Python, etc.
 */
router.get('/', auth, projectController.getUserProjects);

/**
 * POST /api/projects/sync
 * 
 * Sync projects from GitHub API using username
 * 🔒 PROTECTED - Requires authentication
 * 
 * BODY:
 * {
 *   "githubUsername": "username",
 *   "filters": {
 *     "language": "JavaScript",
 *     "minStars": 5,
 *     "excludeForks": true,
 *     "onlyPublic": true
 *   }
 * }
 */
router.post('/sync', auth, projectController.syncFromGitHub);

/**
 * GET /api/projects/:id
 * 
 * Get single project by ID
 * 🔒 PROTECTED - Requires authentication
 */
router.get('/:id', auth, projectController.getProjectById);

/**
 * PATCH /api/projects/:id
 * 
 * Update project tracking fields
 * 🔒 PROTECTED - Requires authentication
 * 
 * BODY:
 * {
 *   "status": "completed",
 *   "progress": 100,
 *   "notes": "Finished!",
 *   "techStack": ["React", "Node.js"],
 *   "starred": true
 * }
 */
router.patch('/:id', auth, projectController.updateProject);

/**
 * DELETE /api/projects/:id
 * 
 * Remove project from tracking
 * 🔒 PROTECTED - Requires authentication
 */
router.delete('/:id', auth, projectController.deleteProject);

module.exports = router;

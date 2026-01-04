/**
 * Career Event Routes
 * 
 * BASE PATH: /api/career
 * 
 * ROUTE STRUCTURE:
 * GET    /api/career             - Get all events
 * GET    /api/career/upcoming    - Get upcoming events
 * GET    /api/career/past        - Get past events
 * GET    /api/career/stats       - Get statistics
 * POST   /api/career             - Create new event
 * GET    /api/career/:id         - Get single event
 * PATCH  /api/career/:id         - Update event
 * DELETE /api/career/:id         - Delete event
 * POST   /api/career/:id/steps   - Add preparation step
 * PATCH  /api/career/:id/steps/:stepId - Toggle step
 */

const express = require('express');
const router = express.Router();
const careerController = require('../controllers/careerController');
const auth = require('../middleware/auth'); // Security guard!

// ═══════════════════════════════════════════════════════════
// QUERY ROUTES (must come before :id routes)
// ═══════════════════════════════════════════════════════════

/**
 * GET /api/career/upcoming
 * 
 * Get upcoming events
 * 🔒 PROTECTED - Requires authentication
 * 
 * QUERY PARAMS:
 * - limit: Maximum number of events
 */
router.get('/upcoming', auth, careerController.getUpcomingEvents);

/**
 * GET /api/career/past
 * 
 * Get past events
 * 🔒 PROTECTED - Requires authentication
 */
router.get('/past', auth, careerController.getPastEvents);

/**
 * GET /api/career/stats
 * 
 * Get event statistics
 * 🔒 PROTECTED - Requires authentication
 */
router.get('/stats', auth, careerController.getEventStats);

// ═══════════════════════════════════════════════════════════
// MAIN ROUTES
// ═══════════════════════════════════════════════════════════

/**
 * GET /api/career
 * 
 * Get all events with filters
 * 🔒 PROTECTED - Requires authentication
 * 
 * QUERY PARAMS:
 * - type: interview/deadline/goal/milestone/networking/other
 * - status: upcoming/in-progress/completed/cancelled
 * - starred: true/false
 * - includeArchived: true/false
 */
router.get('/', auth, careerController.getAllEvents);

/**
 * POST /api/career
 * 
 * Create new event
 * 🔒 PROTECTED - Requires authentication
 * 
 * BODY:
 * {
 *   "title": "Google Interview",
 *   "description": "Final round",
 *   "type": "interview",
 *   "date": "2026-02-15T10:00:00Z",
 *   "priority": "high",
 *   "company": "Google",
 *   "location": "Virtual",
 *   "url": "https://meet.google.com/...",
 *   "preparationSteps": [
 *     { "title": "Review system design", "description": "..." },
 *     { "title": "Practice coding", "description": "..." }
 *   ],
 *   "starred": true
 * }
 */
router.post('/', auth, careerController.createEvent);

/**
 * GET /api/career/:id
 * 
 * Get single event by ID
 * 🔒 PROTECTED - Requires authentication
 */
router.get('/:id', auth, careerController.getEventById);

/**
 * PATCH /api/career/:id
 * 
 * Update event
 * 🔒 PROTECTED - Requires authentication
 * 
 * BODY:
 * {
 *   "title": "Updated title",
 *   "status": "completed",
 *   "outcome": "Went well, moving to next round"
 * }
 */
router.patch('/:id', auth, careerController.updateEvent);

/**
 * DELETE /api/career/:id
 * 
 * Delete event
 * 🔒 PROTECTED - Requires authentication
 */
router.delete('/:id', auth, careerController.deleteEvent);

// ═══════════════════════════════════════════════════════════
// PREPARATION STEP ROUTES
// ═══════════════════════════════════════════════════════════

/**
 * POST /api/career/:id/steps
 * 
 * Add preparation step to event
 * 🔒 PROTECTED - Requires authentication
 * 
 * BODY:
 * {
 *   "title": "Review algorithms",
 *   "description": "Focus on DP and graphs"
 * }
 */
router.post('/:id/steps', auth, careerController.addPreparationStep);

/**
 * PATCH /api/career/:id/steps/:stepId
 * 
 * Toggle step completion status
 * 🔒 PROTECTED - Requires authentication
 * 
 * BODY:
 * {
 *   "isCompleted": true
 * }
 */
router.patch('/:id/steps/:stepId', auth, careerController.toggleStepCompletion);

module.exports = router;

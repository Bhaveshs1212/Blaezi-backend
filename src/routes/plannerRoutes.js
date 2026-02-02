/**
 * Planner Routes
 * 
 * PURPOSE: Define API endpoints for Daily Planner feature
 * 
 * BASE URL: /api/planner
 * 
 * ENDPOINTS:
 * - Task CRUD operations
 * - Goal CRUD operations
 * - Statistics and activity data
 */

const express = require('express');
const router = express.Router();
const plannerController = require('../controllers/plannerController');
const auth = require('../middleware/auth');

// Apply authentication to all routes
router.use(auth);

// ==================== TASK ROUTES ====================

// Get all tasks (with optional filters)
router.get('/tasks', plannerController.getAllTasks);

// Get single task
router.get('/tasks/:id', plannerController.getTask);

// Create new task
router.post('/tasks', plannerController.createTask);

// Update task
router.patch('/tasks/:id', plannerController.updateTask);

// Delete task
router.delete('/tasks/:id', plannerController.deleteTask);

// Bulk update tasks (for reordering, batch operations)
router.post('/tasks/bulk-update', plannerController.bulkUpdateTasks);

// ==================== GOAL ROUTES ====================

// Get all goals
router.get('/goals', plannerController.getAllGoals);

// Create new goal
router.post('/goals', plannerController.createGoal);

// Update goal
router.patch('/goals/:id', plannerController.updateGoal);

// Delete goal
router.delete('/goals/:id', plannerController.deleteGoal);

// ==================== EVENT ROUTES ====================

// Get all events
router.get('/events', plannerController.getAllEvents);

// Create new event
router.post('/events', plannerController.createEvent);

// Update event
router.put('/events/:id', plannerController.updateEvent);

// Delete event
router.delete('/events/:id', plannerController.deleteEvent);

// ==================== STATISTICS ROUTES ====================

// Get planner statistics
router.get('/stats', plannerController.getPlannerStats);

// Get activity data (last 7 days)
router.get('/activity', plannerController.getActivityData);

module.exports = router;

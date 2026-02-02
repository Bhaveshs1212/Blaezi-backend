/**
 * Planner Controller
 * 
 * PURPOSE: Business logic for Daily Planner operations (tasks and goals)
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

const PlannerTask = require('../models/PlannerTask');
const Goal = require('../models/Goal');
const Event = require('../models/Event');

// ==================== TASK ENDPOINTS ====================

/**
 * GET /api/planner/tasks
 * Get all tasks with optional filters
 */
exports.getAllTasks = async (req, res) => {
  try {
    const { completed, dueDate, goalId, archived = 'false' } = req.query;
    const userId = req.user.id;

    const filter = { userId, archived: archived === 'true' };

    if (completed !== undefined) {
      filter.completed = completed === 'true';
    }

    if (dueDate) {
      const date = new Date(dueDate);
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);
      filter.dueDate = { $gte: date, $lt: nextDay };
    }

    if (goalId) {
      filter.goalId = goalId;
    }

    const tasks = await PlannerTask.find(filter).sort({ order: 1, dueDate: 1 });

    res.status(200).json({
      success: true,
      data: tasks
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tasks',
      error: error.message
    });
  }
};

/**
 * GET /api/planner/tasks/:id
 * Get a single task by ID
 */
exports.getTask = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const task = await PlannerTask.findOne({ _id: id, userId });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    res.status(200).json({
      success: true,
      data: task
    });
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch task',
      error: error.message
    });
  }
};

/**
 * POST /api/planner/tasks
 * Create a new task
 */
exports.createTask = async (req, res) => {
  try {
    const { title, dueDate, goalId, completed, order } = req.body;
    const userId = req.user.id;

    // Validation
    if (!title || title.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: [{ field: 'title', message: 'Title is required' }]
      });
    }

    // Verify goal exists if goalId provided
    if (goalId) {
      const goal = await Goal.findOne({ _id: goalId, userId });
      if (!goal) {
        return res.status(400).json({
          success: false,
          message: 'Goal not found'
        });
      }
    }

    const task = new PlannerTask({
      userId,
      title: title.trim(),
      dueDate: dueDate ? new Date(dueDate) : null,
      goalId: goalId || null,
      completed: completed || false,
      order: order !== undefined ? order : 0
    });

    await task.save();

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: task
    });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create task',
      error: error.message
    });
  }
};

/**
 * PATCH /api/planner/tasks/:id
 * Update a task
 */
exports.updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const updates = req.body;

    // Find task
    const task = await PlannerTask.findOne({ _id: id, userId });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Verify goal exists if goalId is being updated
    if (updates.goalId) {
      const goal = await Goal.findOne({ _id: updates.goalId, userId });
      if (!goal) {
        return res.status(400).json({
          success: false,
          message: 'Goal not found'
        });
      }
    }

    // Apply updates
    const allowedUpdates = ['title', 'completed', 'dueDate', 'goalId', 'order', 'archived', 'completedAt'];
    allowedUpdates.forEach(field => {
      if (updates[field] !== undefined) {
        task[field] = updates[field];
      }
    });

    await task.save();

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: task
    });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update task',
      error: error.message
    });
  }
};

/**
 * DELETE /api/planner/tasks/:id
 * Delete a task
 */
exports.deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const task = await PlannerTask.findOneAndDelete({ _id: id, userId });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete task',
      error: error.message
    });
  }
};

/**
 * POST /api/planner/tasks/bulk-update
 * Bulk update tasks (for reordering, batch archiving, etc.)
 */
exports.bulkUpdateTasks = async (req, res) => {
  try {
    const { tasks } = req.body;
    const userId = req.user.id;

    if (!Array.isArray(tasks) || tasks.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Tasks array is required'
      });
    }

    const updatedTasks = [];

    for (const taskUpdate of tasks) {
      const { id, ...updates } = taskUpdate;

      const task = await PlannerTask.findOne({ _id: id, userId });

      if (task) {
        Object.keys(updates).forEach(key => {
          task[key] = updates[key];
        });
        await task.save();
        updatedTasks.push(task);
      }
    }

    res.status(200).json({
      success: true,
      message: `${updatedTasks.length} tasks updated successfully`,
      data: updatedTasks
    });
  } catch (error) {
    console.error('Error bulk updating tasks:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update tasks',
      error: error.message
    });
  }
};

// ==================== GOAL ENDPOINTS ====================

/**
 * GET /api/planner/goals
 * Get all goals
 */
exports.getAllGoals = async (req, res) => {
  try {
    const userId = req.user.id;

    const goals = await Goal.find({ userId }).sort({ deadline: 1 });

    res.status(200).json({
      success: true,
      data: goals
    });
  } catch (error) {
    console.error('Error fetching goals:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch goals',
      error: error.message
    });
  }
};

/**
 * POST /api/planner/goals
 * Create a new goal
 */
exports.createGoal = async (req, res) => {
  try {
    const { name, deadline, steps } = req.body;
    const userId = req.user.id;

    // Validation
    if (!name || name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Goal name is required'
      });
    }

    if (!deadline) {
      return res.status(400).json({
        success: false,
        message: 'Deadline is required'
      });
    }

    const goal = new Goal({
      userId,
      name: name.trim(),
      deadline: new Date(deadline),
      steps: steps || []
    });

    await goal.save();

    res.status(201).json({
      success: true,
      message: 'Goal created successfully',
      data: goal
    });
  } catch (error) {
    console.error('Error creating goal:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create goal',
      error: error.message
    });
  }
};

/**
 * PATCH /api/planner/goals/:id
 * Update a goal
 */
exports.updateGoal = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { name, deadline, steps } = req.body;

    const goal = await Goal.findOne({ _id: id, userId });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found'
      });
    }

    if (name !== undefined) goal.name = name.trim();
    if (deadline !== undefined) goal.deadline = new Date(deadline);
    if (steps !== undefined) goal.steps = steps;

    await goal.save();

    res.status(200).json({
      success: true,
      message: 'Goal updated successfully',
      data: goal
    });
  } catch (error) {
    console.error('Error updating goal:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update goal',
      error: error.message
    });
  }
};

/**
 * DELETE /api/planner/goals/:id
 * Delete a goal (and unlink associated tasks)
 */
exports.deleteGoal = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const goal = await Goal.findOneAndDelete({ _id: id, userId });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found'
      });
    }

    // Unlink tasks associated with this goal
    await PlannerTask.updateMany(
      { userId, goalId: id },
      { $set: { goalId: null } }
    );

    res.status(200).json({
      success: true,
      message: 'Goal deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting goal:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete goal',
      error: error.message
    });
  }
};

// ==================== STATISTICS ENDPOINTS ====================

/**
 * GET /api/planner/stats
 * Get planner statistics
 */
exports.getPlannerStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      totalTasks,
      completedTasks,
      activeTasks,
      overdueTasks,
      todayTasks,
      totalGoals,
      completedToday
    ] = await Promise.all([
      PlannerTask.countDocuments({ userId, archived: false }),
      PlannerTask.countDocuments({ userId, completed: true, archived: false }),
      PlannerTask.countDocuments({ userId, completed: false, archived: false }),
      PlannerTask.countDocuments({
        userId,
        completed: false,
        archived: false,
        dueDate: { $lt: today }
      }),
      PlannerTask.countDocuments({
        userId,
        completed: false,
        archived: false,
        dueDate: { $gte: today, $lt: tomorrow }
      }),
      Goal.countDocuments({ userId }),
      PlannerTask.countDocuments({
        userId,
        completedAt: { $gte: today, $lt: tomorrow }
      })
    ]);

    const completionRate = totalTasks > 0
      ? Math.round((completedTasks / totalTasks) * 100)
      : 0;

    res.status(200).json({
      success: true,
      data: {
        totalTasks,
        completedTasks,
        activeTasks,
        overdueTasks,
        todayTasks,
        completionRate,
        totalGoals,
        completedToday
      }
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
 * GET /api/planner/activity
 * Get activity data for last 7 days
 */
exports.getActivityData = async (req, res) => {
  try {
    const userId = req.user.id;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

    const activityData = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(sevenDaysAgo);
      date.setDate(date.getDate() + i);

      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);

      const count = await PlannerTask.countDocuments({
        userId,
        completedAt: { $gte: date, $lt: nextDay }
      });

      activityData.push({
        date: date.toISOString().split('T')[0],
        tasks: count
      });
    }

    res.status(200).json({
      success: true,
      data: activityData
    });
  } catch (error) {
    console.error('Error fetching activity data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch activity data',
      error: error.message
    });
  }
};

// ==================== EVENT ENDPOINTS ====================

/**
 * GET /api/planner/events
 * Get all events with optional date filtering
 */
exports.getAllEvents = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const userId = req.user.id;

    const filter = { userId };

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const events = await Event.find(filter).sort({ date: 1 });

    res.status(200).json({
      success: true,
      data: events
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch events',
      error: error.message
    });
  }
};

/**
 * POST /api/planner/events
 * Create a new event
 */
exports.createEvent = async (req, res) => {
  try {
    const { title, date, description } = req.body;
    const userId = req.user.id;

    // Validation
    if (!title || title.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Title is required'
      });
    }

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date is required'
      });
    }

    const event = new Event({
      userId,
      title: title.trim(),
      date: new Date(date),
      description: description?.trim() || ''
    });

    await event.save();

    res.status(201).json({
      success: true,
      data: event
    });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create event',
      error: error.message
    });
  }
};

/**
 * PUT /api/planner/events/:id
 * Update an event
 */
exports.updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, date, description } = req.body;
    const userId = req.user.id;

    const event = await Event.findOne({ _id: id, userId });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    if (title !== undefined) event.title = title.trim();
    if (date !== undefined) event.date = new Date(date);
    if (description !== undefined) event.description = description.trim();

    await event.save();

    res.status(200).json({
      success: true,
      data: event
    });
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update event',
      error: error.message
    });
  }
};

/**
 * DELETE /api/planner/events/:id
 * Delete an event
 */
exports.deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const event = await Event.findOneAndDelete({ _id: id, userId });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete event',
      error: error.message
    });
  }
};

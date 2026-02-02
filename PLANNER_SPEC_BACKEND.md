# Blaezi Daily Planner - Backend API Specification

## Overview
This document provides complete specifications for implementing the backend API endpoints for the Daily Planner feature in Blaezi. The frontend is already implemented and ready to integrate with these endpoints.

---

## Technology Stack Requirements
- **Framework**: Node.js + Express.js (matching existing Career/DSA/Projects)
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT-based authentication (existing system)
- **Validation**: express-validator or Joi

---

## Database Models

### 1. Task Model (`models/Task.js`)

```javascript
const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
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

// Compound index for efficient queries
taskSchema.index({ userId: 1, archived: 1, completed: 1 });
taskSchema.index({ userId: 1, dueDate: 1 });

module.exports = mongoose.model('Task', taskSchema);
```

### 2. Goal Model (`models/Goal.js`)

```javascript
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
```

### 3. Event Model (`models/Event.js`)

```javascript
const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
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
  date: {
    type: Date,
    required: true,
    index: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500,
    default: ''
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
eventSchema.index({ userId: 1, date: 1 });

module.exports = mongoose.model('Event', eventSchema);
```

---

## API Endpoints

### Base URL
```
/api/planner
```

### Authentication
All endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

---

## Task Endpoints

### 1. Get All Tasks
**Endpoint:** `GET /api/planner/tasks`

**Query Parameters:**
- `completed` (optional): `true` | `false` - Filter by completion status
- `dueDate` (optional): ISO date string - Filter tasks by specific due date
- `goalId` (optional): MongoDB ObjectId - Filter tasks linked to a specific goal
- `archived` (optional): `true` | `false` - Default: `false`

**Request Example:**
```http
GET /api/planner/tasks?completed=false&archived=false
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "65abc123def456789",
      "userId": "65abc000def000001",
      "title": "Complete project documentation",
      "completed": false,
      "dueDate": "2026-02-05T00:00:00.000Z",
      "goalId": null,
      "order": 0,
      "archived": false,
      "completedAt": null,
      "createdAt": "2026-02-02T10:30:00.000Z",
      "updatedAt": "2026-02-02T10:30:00.000Z"
    },
    {
      "_id": "65abc123def456790",
      "userId": "65abc000def000001",
      "title": "Review pull requests",
      "completed": false,
      "dueDate": "2026-02-03T00:00:00.000Z",
      "goalId": "65abc123def456788",
      "order": 1,
      "archived": false,
      "completedAt": null,
      "createdAt": "2026-02-02T11:00:00.000Z",
      "updatedAt": "2026-02-02T11:00:00.000Z"
    }
  ]
}
```

**Controller Implementation:**
```javascript
// controllers/plannerController.js
const Task = require('../models/Task');

exports.getAllTasks = async (req, res) => {
  try {
    const { completed, dueDate, goalId, archived = 'false' } = req.query;
    const userId = req.user._id; // From auth middleware

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

    const tasks = await Task.find(filter).sort({ order: 1, dueDate: 1 });

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
```

---

### 2. Get Single Task
**Endpoint:** `GET /api/planner/tasks/:id`

**Path Parameters:**
- `id`: Task MongoDB ObjectId

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "_id": "65abc123def456789",
    "userId": "65abc000def000001",
    "title": "Complete project documentation",
    "completed": false,
    "dueDate": "2026-02-05T00:00:00.000Z",
    "goalId": null,
    "order": 0,
    "archived": false,
    "completedAt": null,
    "createdAt": "2026-02-02T10:30:00.000Z",
    "updatedAt": "2026-02-02T10:30:00.000Z"
  }
}
```

**Response (404 Not Found):**
```json
{
  "success": false,
  "message": "Task not found"
}
```

**Controller Implementation:**
```javascript
exports.getTask = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const task = await Task.findOne({ _id: id, userId });

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
```

---

### 3. Create Task
**Endpoint:** `POST /api/planner/tasks`

**Request Body:**
```json
{
  "title": "Complete project documentation",
  "dueDate": "2026-02-05T00:00:00.000Z",
  "goalId": "65abc123def456788"
}
```

**Required Fields:**
- `title` (string, max 200 characters)

**Optional Fields:**
- `dueDate` (ISO date string)
- `goalId` (MongoDB ObjectId, must exist)
- `completed` (boolean, default: false)
- `order` (number, default: 0)

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Task created successfully",
  "data": {
    "_id": "65abc123def456789",
    "userId": "65abc000def000001",
    "title": "Complete project documentation",
    "completed": false,
    "dueDate": "2026-02-05T00:00:00.000Z",
    "goalId": "65abc123def456788",
    "order": 0,
    "archived": false,
    "completedAt": null,
    "createdAt": "2026-02-02T10:30:00.000Z",
    "updatedAt": "2026-02-02T10:30:00.000Z"
  }
}
```

**Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "field": "title",
      "message": "Title is required"
    }
  ]
}
```

**Controller Implementation:**
```javascript
exports.createTask = async (req, res) => {
  try {
    const { title, dueDate, goalId, completed, order } = req.body;
    const userId = req.user._id;

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
      const Goal = require('../models/Goal');
      const goal = await Goal.findOne({ _id: goalId, userId });
      if (!goal) {
        return res.status(400).json({
          success: false,
          message: 'Goal not found'
        });
      }
    }

    const task = new Task({
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
```

---

### 4. Update Task
**Endpoint:** `PATCH /api/planner/tasks/:id`

**Path Parameters:**
- `id`: Task MongoDB ObjectId

**Request Body (partial update):**
```json
{
  "completed": true,
  "completedAt": "2026-02-02T15:30:00.000Z"
}
```

**Updatable Fields:**
- `title` (string)
- `completed` (boolean)
- `dueDate` (ISO date string)
- `goalId` (MongoDB ObjectId)
- `order` (number)
- `archived` (boolean)
- `completedAt` (ISO date string)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Task updated successfully",
  "data": {
    "_id": "65abc123def456789",
    "userId": "65abc000def000001",
    "title": "Complete project documentation",
    "completed": true,
    "dueDate": "2026-02-05T00:00:00.000Z",
    "goalId": null,
    "order": 0,
    "archived": false,
    "completedAt": "2026-02-02T15:30:00.000Z",
    "createdAt": "2026-02-02T10:30:00.000Z",
    "updatedAt": "2026-02-02T15:30:00.000Z"
  }
}
```

**Controller Implementation:**
```javascript
exports.updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const updates = req.body;

    // Find task
    const task = await Task.findOne({ _id: id, userId });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Verify goal exists if goalId is being updated
    if (updates.goalId) {
      const Goal = require('../models/Goal');
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
```

---

### 5. Delete Task
**Endpoint:** `DELETE /api/planner/tasks/:id`

**Path Parameters:**
- `id`: Task MongoDB ObjectId

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Task deleted successfully"
}
```

**Response (404 Not Found):**
```json
{
  "success": false,
  "message": "Task not found"
}
```

**Controller Implementation:**
```javascript
exports.deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const task = await Task.findOneAndDelete({ _id: id, userId });

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
```

---

### 6. Bulk Update Tasks
**Endpoint:** `POST /api/planner/tasks/bulk-update`

**Use Case:** Reordering tasks via drag-and-drop, batch archiving completed tasks

**Request Body:**
```json
{
  "tasks": [
    {
      "id": "65abc123def456789",
      "order": 0
    },
    {
      "id": "65abc123def456790",
      "order": 1
    },
    {
      "id": "65abc123def456791",
      "archived": true
    }
  ]
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "3 tasks updated successfully",
  "data": [
    {
      "_id": "65abc123def456789",
      "title": "Task 1",
      "order": 0,
      "archived": false
    },
    {
      "_id": "65abc123def456790",
      "title": "Task 2",
      "order": 1,
      "archived": false
    },
    {
      "_id": "65abc123def456791",
      "title": "Task 3",
      "order": 2,
      "archived": true
    }
  ]
}
```

**Controller Implementation:**
```javascript
exports.bulkUpdateTasks = async (req, res) => {
  try {
    const { tasks } = req.body;
    const userId = req.user._id;

    if (!Array.isArray(tasks) || tasks.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Tasks array is required'
      });
    }

    const updatedTasks = [];

    for (const taskUpdate of tasks) {
      const { id, ...updates } = taskUpdate;

      const task = await Task.findOne({ _id: id, userId });

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
```

---

## Goal Endpoints

### 7. Get All Goals
**Endpoint:** `GET /api/planner/goals`

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "65abc123def456788",
      "userId": "65abc000def000001",
      "name": "Launch MVP",
      "deadline": "2026-03-15T00:00:00.000Z",
      "createdAt": "2026-02-01T10:00:00.000Z",
      "updatedAt": "2026-02-01T10:00:00.000Z"
    }
  ]
}
```

**Controller Implementation:**
```javascript
exports.getAllGoals = async (req, res) => {
  try {
    const userId = req.user._id;

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
```

---

### 8. Create Goal
**Endpoint:** `POST /api/planner/goals`

**Request Body:**
```json
{
  "name": "Launch MVP",
  "deadline": "2026-03-15T00:00:00.000Z",
  "steps": []
}
```

**Required Fields:**
- `name` (string, max 200 characters)
- `deadline` (ISO date string)

**Optional Fields:**
- `steps` (array of step objects with `id`, `title`, `completed`)

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Goal created successfully",
  "data": {
    "_id": "65abc123def456788",
    "userId": "65abc000def000001",
    "name": "Launch MVP",
    "deadline": "2026-03-15T00:00:00.000Z",
    "steps": [],
    "createdAt": "2026-02-01T10:00:00.000Z",
    "updatedAt": "2026-02-01T10:00:00.000Z"
  }
}
```

**Controller Implementation:**
```javascript
const Goal = require('../models/Goal');

exports.createGoal = async (req, res) => {
  try {
    const { name, deadline } = req.body;
    const userId = req.user._id;

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
```

---

### 9. Update Goal
**Endpoint:** `PATCH /api/planner/goals/:id`

**Request Body:**
```json
{
  "name": "Launch MVP v2",
  "deadline": "2026-04-01T00:00:00.000Z",
  "steps": [
    {
      "id": "step-1",
      "title": "Design UI mockups",
      "completed": true
    },
    {
      "id": "step-2",
      "title": "Develop backend",
      "completed": false
    }
  ]
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Goal updated successfully",
  "data": {
    "_id": "65abc123def456788",
    "userId": "65abc000def000001",
    "name": "Launch MVP v2",
    "deadline": "2026-04-01T00:00:00.000Z",
    "steps": [
      {
        "id": "step-1",
        "title": "Design UI mockups",
        "completed": true
      },
      {
        "id": "step-2",
        "title": "Develop backend",
        "completed": false
      }
    ],
    "createdAt": "2026-02-01T10:00:00.000Z",
    "updatedAt": "2026-02-02T14:00:00.000Z"
  }
}
```

**Controller Implementation:**
```javascript
exports.updateGoal = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
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
```

---

### 10. Delete Goal
**Endpoint:** `DELETE /api/planner/goals/:id`

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Goal deleted successfully"
}
```

**Notes:**
- When a goal is deleted, associated tasks should have their `goalId` set to `null`

**Controller Implementation:**
```javascript
exports.deleteGoal = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const goal = await Goal.findOneAndDelete({ _id: id, userId });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found'
      });
    }

    // Unlink tasks associated with this goal
    await Task.updateMany(
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
```

---

## Statistics Endpoints

### 11. Get Planner Statistics
**Endpoint:** `GET /api/planner/stats`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "totalTasks": 45,
    "completedTasks": 32,
    "activeTasks": 13,
    "overdueTasks": 2,
    "todayTasks": 5,
    "completionRate": 71.11,
    "totalGoals": 3,
    "completedToday": 3
  }
}
```

**Controller Implementation:**
```javascript
exports.getPlannerStats = async (req, res) => {
  try {
    const userId = req.user._id;

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
      Task.countDocuments({ userId, archived: false }),
      Task.countDocuments({ userId, completed: true, archived: false }),
      Task.countDocuments({ userId, completed: false, archived: false }),
      Task.countDocuments({
        userId,
        completed: false,
        archived: false,
        dueDate: { $lt: today }
      }),
      Task.countDocuments({
        userId,
        completed: false,
        archived: false,
        dueDate: { $gte: today, $lt: tomorrow }
      }),
      Goal.countDocuments({ userId }),
      Task.countDocuments({
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
```

---

### 12. Get Activity Data (Last 7 Days)
**Endpoint:** `GET /api/planner/activity`

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "date": "2026-01-27",
      "tasks": 3
    },
    {
      "date": "2026-01-28",
      "tasks": 5
    },
    {
      "date": "2026-01-29",
      "tasks": 2
    },
    {
      "date": "2026-01-30",
      "tasks": 4
    },
    {
      "date": "2026-01-31",
      "tasks": 6
    },
    {
      "date": "2026-02-01",
      "tasks": 3
    },
    {
      "date": "2026-02-02",
      "tasks": 1
    }
  ]
}
```

**Controller Implementation:**
```javascript
exports.getActivityData = async (req, res) => {
  try {
    const userId = req.user._id;

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

      const count = await Task.countDocuments({
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
```

---

## Event Endpoints

### 13. Get All Events
**Endpoint:** `GET /api/planner/events`

**Query Parameters:**
- `startDate` (optional): ISO date string - Filter events from this date onwards
- `endDate` (optional): ISO date string - Filter events up to this date

**Request Example:**
```http
GET /api/planner/events
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "65abc123def456799",
      "userId": "65abc000def000001",
      "title": "Team Meeting",
      "date": "2026-02-10T00:00:00.000Z",
      "description": "Quarterly planning meeting with the team",
      "createdAt": "2026-02-02T10:30:00.000Z",
      "updatedAt": "2026-02-02T10:30:00.000Z"
    },
    {
      "_id": "65abc123def456800",
      "userId": "65abc000def000001",
      "title": "Product Launch",
      "date": "2026-02-15T00:00:00.000Z",
      "description": "Major product release",
      "createdAt": "2026-02-02T11:00:00.000Z",
      "updatedAt": "2026-02-02T11:00:00.000Z"
    }
  ]
}
```

**Controller Implementation:**
```javascript
exports.getAllEvents = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const userId = req.user._id;

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
```

---

### 14. Create Event
**Endpoint:** `POST /api/planner/events`

**Request Body:**
```json
{
  "title": "Conference Attendance",
  "date": "2026-03-20T00:00:00.000Z",
  "description": "Annual tech conference in San Francisco"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "_id": "65abc123def456801",
    "userId": "65abc000def000001",
    "title": "Conference Attendance",
    "date": "2026-03-20T00:00:00.000Z",
    "description": "Annual tech conference in San Francisco",
    "createdAt": "2026-02-02T12:00:00.000Z",
    "updatedAt": "2026-02-02T12:00:00.000Z"
  }
}
```

**Validation Rules:**
- `title`: Required, 1-200 characters
- `date`: Required, valid date
- `description`: Optional, max 500 characters

**Controller Implementation:**
```javascript
exports.createEvent = async (req, res) => {
  try {
    const { title, date, description } = req.body;
    const userId = req.user._id;

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
```

---

### 15. Update Event
**Endpoint:** `PUT /api/planner/events/:id`

**URL Parameters:**
- `id`: MongoDB ObjectId of the event

**Request Body:**
```json
{
  "title": "Updated Conference Details",
  "date": "2026-03-21T00:00:00.000Z",
  "description": "Changed to virtual conference"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "_id": "65abc123def456801",
    "userId": "65abc000def000001",
    "title": "Updated Conference Details",
    "date": "2026-03-21T00:00:00.000Z",
    "description": "Changed to virtual conference",
    "createdAt": "2026-02-02T12:00:00.000Z",
    "updatedAt": "2026-02-02T13:00:00.000Z"
  }
}
```

**Controller Implementation:**
```javascript
exports.updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, date, description } = req.body;
    const userId = req.user._id;

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
```

---

### 16. Delete Event
**Endpoint:** `DELETE /api/planner/events/:id`

**URL Parameters:**
- `id`: MongoDB ObjectId of the event

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Event deleted successfully"
}
```

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "message": "Event not found"
}
```

**Controller Implementation:**
```javascript
exports.deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

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
```

---

## Routes Configuration

### File: `routes/planner.js`

```javascript
const express = require('express');
const router = express.Router();
const plannerController = require('../controllers/plannerController');
const authMiddleware = require('../middleware/auth'); // Your existing JWT middleware

// Apply authentication to all routes
router.use(authMiddleware);

// Task routes
router.get('/tasks', plannerController.getAllTasks);
router.get('/tasks/:id', plannerController.getTask);
router.post('/tasks', plannerController.createTask);
router.patch('/tasks/:id', plannerController.updateTask);
router.delete('/tasks/:id', plannerController.deleteTask);
router.post('/tasks/bulk-update', plannerController.bulkUpdateTasks);

// Goal routes
router.get('/goals', plannerController.getAllGoals);
router.post('/goals', plannerController.createGoal);
router.patch('/goals/:id', plannerController.updateGoal);
router.delete('/goals/:id', plannerController.deleteGoal);

// Event routes
router.get('/events', plannerController.getAllEvents);
router.post('/events', plannerController.createEvent);
router.put('/events/:id', plannerController.updateEvent);
router.delete('/events/:id', plannerController.deleteEvent);

// Statistics routes
router.get('/stats', plannerController.getPlannerStats);
router.get('/activity', plannerController.getActivityData);

module.exports = router;
```

### File: `app.js` or `server.js` (Main Application)

```javascript
const plannerRoutes = require('./routes/planner');

// ... other imports and middleware

// Register planner routes
app.use('/api/planner', plannerRoutes);
```

---

## Error Handling

### Standard Error Response Format

```json
{
  "success": false,
  "message": "Error description",
  "error": "Technical error details (optional, only in development)"
}
```

### HTTP Status Codes

- `200 OK` - Successful GET, PATCH, DELETE
- `201 Created` - Successful POST
- `400 Bad Request` - Validation errors, invalid data
- `401 Unauthorized` - Missing or invalid JWT token
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server-side errors

---

## Validation Rules

### Task Validation
- `title`: Required, 1-200 characters, trimmed
- `dueDate`: Optional, valid ISO date string
- `goalId`: Optional, must be valid MongoDB ObjectId and exist in database
- `completed`: Boolean
- `order`: Non-negative integer
- `archived`: Boolean

### Goal Validation
- `name`: Required, 1-200 characters, trimmed
- `deadline`: Required, valid ISO date string, must be future date (optional check)

---

## Security Considerations

1. **Authentication**: All endpoints require valid JWT token
2. **Authorization**: Users can only access their own tasks and goals (verified via `userId`)
3. **Input Sanitization**: Trim strings, validate ObjectIds
4. **Rate Limiting**: Recommend implementing rate limiting (e.g., 100 requests per 15 minutes)
5. **CORS**: Configure CORS to allow frontend domain

---

## Testing Recommendations

### Unit Tests
Test each controller function with mocked database calls.

### Integration Tests
Test complete request/response cycles.

**Example Test Cases:**
1. Create task with valid data → 201 Created
2. Create task with missing title → 400 Bad Request
3. Update task that doesn't exist → 404 Not Found
4. Bulk update 5 tasks → 200 OK with all tasks updated
5. Delete goal → Verify associated tasks have `goalId` set to null
6. Get activity data → Returns exactly 7 days of data

---

## Performance Optimization

1. **Database Indexes**: Already defined in models
2. **Pagination**: Consider adding pagination to `GET /tasks` if users have >100 tasks
3. **Caching**: Cache activity data for 15 minutes
4. **Batch Operations**: Use MongoDB bulk operations for bulk updates

---

## Migration Strategy

If users already have data in other systems:

1. Create migration script to import tasks
2. Map existing project milestones to goals (optional)
3. Set initial `order` values for all tasks

---

## Frontend Integration Points

The frontend is already implemented and expects:

1. **Response format**: `{ success: boolean, data: any, message?: string }`
2. **Date format**: ISO 8601 strings
3. **ID field**: Backend uses `_id`, frontend normalizes to `id`
4. **Error handling**: Frontend has fallback for 404/network errors (adds tasks locally)

---

## Example `.env` Configuration

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/blaezi

# JWT
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRE=7d

# Server
PORT=5000
NODE_ENV=development

# CORS
FRONTEND_URL=http://localhost:5174
```

---

## Complete Controller File Structure

```
controllers/
  plannerController.js (all 16 functions)

models/
  Task.js
  Goal.js
  Event.js

routes/
  planner.js

middleware/
  auth.js (existing JWT middleware)
```

---

## Deployment Checklist

- [ ] Create Task, Goal, and Event models
- [ ] Implement all 16 controller functions (12 for tasks/goals, 4 for events)
- [ ] Set up routes with authentication middleware
- [ ] Add validation middleware
- [ ] Test all endpoints with Postman/Thunder Client
- [ ] Add error logging
- [ ] Configure CORS for frontend URL
- [ ] Set up rate limiting
- [ ] Deploy to production server
- [ ] Update frontend API base URL if needed

---

## API Endpoint Summary

**Total Endpoints: 16**

**Tasks (6):**
1. GET /api/planner/tasks - Get all tasks
2. GET /api/planner/tasks/:id - Get single task
3. POST /api/planner/tasks - Create task
4. PATCH /api/planner/tasks/:id - Update task
5. DELETE /api/planner/tasks/:id - Delete task
6. POST /api/planner/tasks/bulk-update - Bulk update tasks

**Goals (4):**
7. GET /api/planner/goals - Get all goals
8. POST /api/planner/goals - Create goal
9. PATCH /api/planner/goals/:id - Update goal
10. DELETE /api/planner/goals/:id - Delete goal

**Events (4):**
11. GET /api/planner/events - Get all events
12. POST /api/planner/events - Create event
13. PUT /api/planner/events/:id - Update event
14. DELETE /api/planner/events/:id - Delete event

**Statistics (2):**
15. GET /api/planner/stats - Get planner statistics
16. GET /api/planner/activity - Get activity data (last 7 days)

---

## Support & Questions

If you need clarification on any endpoint or want to modify the data structure, refer to the existing Career/DSA/Projects backend implementation for consistency.

**Frontend is ready and waiting at:** `/planner` route
**Backend base URL expected:** `http://localhost:5000/api/planner` (or your production URL)

---

**Version:** 1.0  
**Last Updated:** February 2, 2026  
**Author:** Blaezi Frontend Team

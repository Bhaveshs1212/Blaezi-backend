# Planner API Quick Reference

## Authentication
All endpoints require JWT token in Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## 📋 TASKS

### Get All Tasks
```http
GET /api/planner/tasks
```
**Query Params:**
- `completed=true|false` - Filter by completion status
- `dueDate=2026-02-05` - Filter by specific date
- `goalId=<goal_id>` - Filter by goal
- `archived=true|false` - Show archived tasks

**Example:**
```bash
curl -H "Authorization: Bearer <token>" \
  "http://localhost:4000/api/planner/tasks?completed=false&archived=false"
```

### Get Single Task
```http
GET /api/planner/tasks/:id
```

### Create Task
```http
POST /api/planner/tasks
Content-Type: application/json

{
  "title": "Complete documentation",
  "dueDate": "2026-02-10T00:00:00.000Z",
  "goalId": "optional_goal_id",
  "completed": false,
  "order": 0
}
```

### Update Task
```http
PATCH /api/planner/tasks/:id
Content-Type: application/json

{
  "completed": true,
  "completedAt": "2026-02-02T15:30:00.000Z"
}
```

### Delete Task
```http
DELETE /api/planner/tasks/:id
```

### Bulk Update Tasks
```http
POST /api/planner/tasks/bulk-update
Content-Type: application/json

{
  "tasks": [
    { "id": "task_id_1", "order": 0 },
    { "id": "task_id_2", "order": 1 },
    { "id": "task_id_3", "archived": true }
  ]
}
```

---

## 🎯 GOALS

### Get All Goals
```http
GET /api/planner/goals
```

### Create Goal
```http
POST /api/planner/goals
Content-Type: application/json

{
  "name": "Complete Backend Development",
  "deadline": "2026-03-15T00:00:00.000Z"
}
```

### Update Goal
```http
PATCH /api/planner/goals/:id
Content-Type: application/json

{
  "name": "Updated goal name",
  "deadline": "2026-04-01T00:00:00.000Z"
}
```

### Delete Goal
```http
DELETE /api/planner/goals/:id
```
*Note: This will set goalId to null for all associated tasks*

---

## 📊 STATISTICS

### Get Planner Stats
```http
GET /api/planner/stats
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalTasks": 45,
    "completedTasks": 32,
    "activeTasks": 13,
    "overdueTasks": 2,
    "todayTasks": 5,
    "completionRate": 71,
    "totalGoals": 3,
    "completedToday": 3
  }
}
```

### Get Activity Data
```http
GET /api/planner/activity
```

**Response:**
```json
{
  "success": true,
  "data": [
    { "date": "2026-01-27", "tasks": 3 },
    { "date": "2026-01-28", "tasks": 5 },
    { "date": "2026-01-29", "tasks": 2 },
    { "date": "2026-01-30", "tasks": 4 },
    { "date": "2026-01-31", "tasks": 6 },
    { "date": "2026-02-01", "tasks": 3 },
    { "date": "2026-02-02", "tasks": 1 }
  ]
}
```

---

## Response Formats

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional message"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description"
}
```

---

## HTTP Status Codes

- `200 OK` - Successful GET, PATCH, DELETE
- `201 Created` - Successful POST
- `400 Bad Request` - Validation error
- `401 Unauthorized` - Missing/invalid token
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

---

## Common Use Cases

### 1. Get today's incomplete tasks
```http
GET /api/planner/tasks?completed=false&dueDate=2026-02-02
```

### 2. Mark task as complete
```http
PATCH /api/planner/tasks/:id
{
  "completed": true,
  "completedAt": "2026-02-02T10:30:00.000Z"
}
```

### 3. Reorder tasks via drag-and-drop
```http
POST /api/planner/tasks/bulk-update
{
  "tasks": [
    { "id": "id1", "order": 0 },
    { "id": "id2", "order": 1 },
    { "id": "id3", "order": 2 }
  ]
}
```

### 4. Archive completed tasks
```http
POST /api/planner/tasks/bulk-update
{
  "tasks": [
    { "id": "id1", "archived": true },
    { "id": "id2", "archived": true }
  ]
}
```

### 5. Get tasks for a specific goal
```http
GET /api/planner/tasks?goalId=<goal_id>
```

---

## Testing with cURL

### Create a task
```bash
curl -X POST http://localhost:4000/api/planner/tasks \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test task",
    "dueDate": "2026-02-10T00:00:00.000Z"
  }'
```

### Get all tasks
```bash
curl http://localhost:4000/api/planner/tasks \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Update a task
```bash
curl -X PATCH http://localhost:4000/api/planner/tasks/TASK_ID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"completed": true}'
```

### Get statistics
```bash
curl http://localhost:4000/api/planner/stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Frontend Integration

### JavaScript/TypeScript Example
```javascript
const API_BASE = 'http://localhost:4000/api/planner';
const token = localStorage.getItem('token');

// Get all tasks
const getTasks = async () => {
  const response = await fetch(`${API_BASE}/tasks`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return response.json();
};

// Create task
const createTask = async (taskData) => {
  const response = await fetch(`${API_BASE}/tasks`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(taskData)
  });
  return response.json();
};

// Update task
const updateTask = async (taskId, updates) => {
  const response = await fetch(`${API_BASE}/tasks/${taskId}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(updates)
  });
  return response.json();
};

// Get stats
const getStats = async () => {
  const response = await fetch(`${API_BASE}/stats`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return response.json();
};
```

---

## Environment Variables

Make sure these are set in your `.env` file:
```env
MONGODB_URI=mongodb://localhost:27017/blaezi
JWT_SECRET=your_secret_key
PORT=4000
NODE_ENV=development
```

---

**Base URL**: `http://localhost:4000/api/planner`  
**Production URL**: Update in frontend configuration

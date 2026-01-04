# 🎯 Blaezi Backend - Complete API Documentation

## 🌐 Base URL
```
http://localhost:5000
```

---

## 📊 Available Domains

| Domain | Base Path | Description |
|--------|-----------|-------------|
| DSA Problems | `/api/dsa` | Track coding problems & progress |
| Projects | `/api/projects` | Sync & track GitHub projects |
| Career Events | `/api/career` | Manage interviews, deadlines, goals |
| Tasks | `/api/tasks` | Original task management |

---

# 🧮 DSA API (`/api/dsa`)

## Problems (Master Catalog)

### Get All Problems
```http
GET /api/dsa/problems
```
**Query Params:**
- `difficulty`: Easy/Medium/Hard
- `topic`: Array, Linked List, Dynamic Programming, etc.
- `sheet`: Striver SDE Sheet
- `platform`: LeetCode, GeeksforGeeks
- `search`: Text search in title/description

**Example:**
```bash
curl http://localhost:5000/api/dsa/problems?difficulty=Easy&topic=Array
```

### Get Single Problem
```http
GET /api/dsa/problems/:id
```

---

## User Progress

### Get User Progress
```http
GET /api/dsa/progress?userId=USER_ID
```
**Query Params:**
- `userId`: User ID (required)
- `status`: none/weak/revising/solved
- `starred`: true/false

### Create/Update Progress
```http
POST /api/dsa/progress
Content-Type: application/json

{
  "userId": "USER_ID",
  "problemId": "PROBLEM_ID",
  "status": "solved",
  "notes": "Used hash map approach",
  "approach": "Hash Table",
  "starred": true
}
```

### Update Specific Progress
```http
PATCH /api/dsa/progress/:problemId
Content-Type: application/json

{
  "userId": "USER_ID",
  "status": "revising",
  "notes": "Need more practice"
}
```

### Delete Progress
```http
DELETE /api/dsa/progress/:problemId
Content-Type: application/json

{
  "userId": "USER_ID"
}
```

---

## Statistics

### Get User Stats
```http
GET /api/dsa/stats?userId=USER_ID
```
**Response:**
```json
{
  "success": true,
  "data": {
    "total": 150,
    "solved": 45,
    "revising": 12,
    "weak": 8,
    "none": 85,
    "staleCount": 5
  }
}
```

### Get Stale Problems
```http
GET /api/dsa/stale?userId=USER_ID
```
Returns problems not practiced in > 7 days.

---

# 💼 Projects API (`/api/projects`)

## Get Projects

### Get All Projects
```http
GET /api/projects?userId=USER_ID
```
**Query Params:**
- `userId`: User ID (required)
- `status`: planning/in-progress/completed/archived
- `starred`: true/false
- `language`: JavaScript, Python, etc.

### Get Single Project
```http
GET /api/projects/:id
```

### Get Starred Projects
```http
GET /api/projects/starred?userId=USER_ID
```

---

## Sync & Update

### Sync from GitHub
```http
POST /api/projects/sync
Content-Type: application/json

{
  "userId": "USER_ID",
  "githubRepos": [
    {
      "id": 123456,
      "name": "my-portfolio",
      "full_name": "john/my-portfolio",
      "description": "My personal portfolio",
      "html_url": "https://github.com/john/my-portfolio",
      "homepage": "https://john.dev",
      "language": "JavaScript",
      "stargazers_count": 50,
      "forks_count": 10,
      "private": false,
      "topics": ["portfolio", "react"],
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2026-01-01T00:00:00Z"
    }
  ]
}
```

### Update Project Tracking
```http
PATCH /api/projects/:id
Content-Type: application/json

{
  "status": "completed",
  "progress": 100,
  "notes": "Deployed to production",
  "techStack": ["React", "Node.js", "MongoDB"],
  "starred": true
}
```

### Remove Project
```http
DELETE /api/projects/:id
```

---

## Statistics

### Get Project Stats
```http
GET /api/projects/stats?userId=USER_ID
```
**Response:**
```json
{
  "success": true,
  "data": {
    "total": 15,
    "planning": 2,
    "inProgress": 8,
    "completed": 4,
    "archived": 1,
    "starred": 5,
    "avgProgress": 67.5
  }
}
```

---

# 🎯 Career Events API (`/api/career`)

## Get Events

### Get All Events
```http
GET /api/career?userId=USER_ID
```
**Query Params:**
- `userId`: User ID (required)
- `type`: interview/deadline/goal/milestone/networking/other
- `status`: upcoming/in-progress/completed/cancelled
- `starred`: true/false
- `includeArchived`: true/false

### Get Upcoming Events
```http
GET /api/career/upcoming?userId=USER_ID&limit=5
```

### Get Past Events
```http
GET /api/career/past?userId=USER_ID
```

### Get Single Event
```http
GET /api/career/:id
```

---

## Create & Update

### Create Event
```http
POST /api/career
Content-Type: application/json

{
  "userId": "USER_ID",
  "title": "Google Interview - Final Round",
  "description": "System design and behavioral",
  "type": "interview",
  "date": "2026-02-15T10:00:00Z",
  "priority": "high",
  "company": "Google",
  "location": "Virtual",
  "url": "https://meet.google.com/xyz",
  "preparationSteps": [
    {
      "title": "Review system design patterns",
      "description": "Focus on scalability"
    },
    {
      "title": "Practice behavioral questions",
      "description": "STAR method"
    }
  ],
  "starred": true
}
```

### Update Event
```http
PATCH /api/career/:id
Content-Type: application/json

{
  "status": "completed",
  "outcome": "Passed! Moving to next round",
  "notes": "Went very well"
}
```

### Delete Event
```http
DELETE /api/career/:id
```

---

## Preparation Steps

### Add Step
```http
POST /api/career/:id/steps
Content-Type: application/json

{
  "title": "Research company culture",
  "description": "Read Glassdoor reviews"
}
```

### Toggle Step Completion
```http
PATCH /api/career/:id/steps/:stepId
Content-Type: application/json

{
  "isCompleted": true
}
```

---

## Statistics

### Get Event Stats
```http
GET /api/career/stats?userId=USER_ID
```
**Response:**
```json
{
  "success": true,
  "data": {
    "total": 20,
    "upcoming": 8,
    "past": 12,
    "completed": 10,
    "byType": {
      "interview": 5,
      "deadline": 8,
      "goal": 4,
      "milestone": 2,
      "networking": 1,
      "other": 0
    },
    "starred": 6
  }
}
```

---

# 🧪 Testing with cURL (PowerShell)

## DSA - Get Easy Problems
```powershell
curl http://localhost:5000/api/dsa/problems?difficulty=Easy
```

## Projects - Get All
```powershell
curl "http://localhost:5000/api/projects?userId=USER_ID"
```

## Career - Create Event
```powershell
curl -X POST http://localhost:5000/api/career `
  -H "Content-Type: application/json" `
  -d '{\"userId\":\"USER_ID\",\"title\":\"Interview\",\"type\":\"interview\",\"date\":\"2026-02-15\"}'
```

---

# 📦 Complete Feature Matrix

| Feature | Model | Endpoints | Key Features |
|---------|-------|-----------|--------------|
| **DSA** | MasterProblem + UserProgress | 8 endpoints | Master catalog, individual tracking, stale detection |
| **Projects** | Project | 7 endpoints | GitHub sync, progress tracking, language filtering |
| **Career** | CareerEvent | 10 endpoints | Event types, preparation steps, date-based queries |

---

# 🎯 What's Seeded

- **31 DSA Problems** from Striver SDE Sheet
  - Array: 14 problems
  - Linked List: 8 problems
  - Binary Search: 3 problems
  - Dynamic Programming: 3 problems
  - Tree: 3 problems

---

# 🔧 Database Collections

```
blaezi/
├── master_problems      (31 documents)
├── user_progress        (user-specific tracking)
├── projects             (GitHub synced projects)
└── career_events        (interviews, deadlines, goals)
```

---

# 🚀 Server Status

✅ **Server Running:** `http://localhost:5000`  
✅ **Database:** MongoDB Connected  
✅ **All Routes:** Active and ready

---

**Need help?** Check individual route comments in the codebase for detailed parameter descriptions!

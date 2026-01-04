# Blaezi Backend - Complete Project Documentation

**Version:** 1.0.0  
**Date:** January 4, 2026  
**Status:** Production Ready 🚀

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Database Models](#database-models)
4. [Authentication System](#authentication-system)
5. [API Endpoints](#api-endpoints)
6. [Controllers Logic](#controllers-logic)
7. [Security Implementation](#security-implementation)
8. [Testing](#testing)
9. [Setup & Installation](#setup--installation)
10. [Usage Examples](#usage-examples)
11. [Project Structure](#project-structure)
12. [Key Concepts & Learning](#key-concepts--learning)

---

## Project Overview

**Blaezi** is a comprehensive career tracking platform backend that helps users manage:
- **DSA (Data Structures & Algorithms) Practice** - Track progress on coding problems
- **GitHub Projects** - Sync and monitor personal projects
- **Career Events** - Manage interviews, deadlines, and career milestones

### Technology Stack

```javascript
{
  "runtime": "Node.js",
  "framework": "Express 5.2.1",
  "database": "MongoDB with Mongoose 9.0.2",
  "authentication": "JWT (jsonwebtoken)",
  "password_hashing": "bcrypt",
  "environment": "dotenv",
  "cors": "enabled"
}
```

### Key Features

✅ **User Authentication** - JWT-based secure authentication  
✅ **Password Security** - bcrypt hashing with salt  
✅ **Data Isolation** - Users can only access their own data  
✅ **Master-Progress Pattern** - Shared problem catalog with individual tracking  
✅ **GitHub Integration** - Sync projects from GitHub API  
✅ **Career Tracking** - Manage interviews and preparation steps  
✅ **Search & Filtering** - Advanced query capabilities  
✅ **Statistics** - Progress analytics and insights  

---

## Architecture

### Layer Structure

```
┌─────────────────────────────────────────┐
│         CLIENT (Frontend)               │
└─────────────────┬───────────────────────┘
                  │ HTTP Requests
                  │ Authorization: Bearer <JWT>
                  ▼
┌─────────────────────────────────────────┐
│         ROUTES LAYER                    │
│  - Route definitions                    │
│  - Auth middleware protection           │
│  - Parameter validation                 │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│      MIDDLEWARE LAYER                   │
│  - JWT verification (auth.js)           │
│  - User extraction                      │
│  - Error handling                       │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│      CONTROLLERS LAYER                  │
│  - Business logic                       │
│  - Request validation                   │
│  - Response formatting                  │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│         MODELS LAYER                    │
│  - Schema definitions                   │
│  - Validation rules                     │
│  - Instance methods                     │
│  - Static methods                       │
│  - Middleware (pre/post hooks)          │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│       DATABASE (MongoDB)                │
│  - Collections                          │
│  - Indexes                              │
│  - Data persistence                     │
└─────────────────────────────────────────┘
```

### Design Patterns

#### 1. Master-Progress Pattern (DSA)
```
MasterProblem (Global Catalog)
     ├─ Problem 1: Two Sum
     ├─ Problem 2: Reverse Linked List
     └─ Problem 3: Binary Search
          ↓ Referenced by
UserProgress (Individual Tracking)
     ├─ User A: Problem 1 → Solved
     ├─ User B: Problem 1 → Weak
     └─ User C: Problem 1 → Revising
```

**Benefits:**
- Single source of truth for problems
- No data duplication
- Easy to update problem details
- Each user tracks independently

#### 2. Embedded Documents Pattern (Career Events)
```
CareerEvent
     ├─ Event Details (title, date, company)
     └─ Preparation Steps [] (embedded)
          ├─ Step 1: Review System Design ✓
          ├─ Step 2: Practice Coding ✓
          └─ Step 3: Mock Interview ⏳
```

**Benefits:**
- Steps always with event
- Atomic operations
- No extra queries
- Natural hierarchy

#### 3. Middleware Chain Pattern
```
Request → auth → controller → response
          │
          ├─ Extract JWT token
          ├─ Verify signature
          ├─ Decode payload
          ├─ Find user
          └─ Attach req.user
```

---

## Database Models

### 1. User Model

**File:** `src/models/User.js`

**Purpose:** User accounts and authentication

**Schema:**
```javascript
{
  email: String (unique, required, validated),
  password: String (hashed, select: false),
  name: String (required),
  githubUsername: String,
  githubAccessToken: String (select: false),
  avatar: String (URL),
  role: String (enum: user/admin, default: user),
  isActive: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `email` (unique)

**Methods:**

**Instance Methods:**
- `comparePassword(candidatePassword)` - Verify password
- `toJSON()` - Remove sensitive fields from response

**Middleware:**
- `pre('save')` - Hash password before saving

**Security Features:**
- Password automatically hashed with bcrypt (10 salt rounds)
- Password never returned in API responses
- GitHub token hidden by default
- Email validation regex

---

### 2. MasterProblem Model

**File:** `src/models/MasterProblem.js`

**Purpose:** Global catalog of DSA problems

**Schema:**
```javascript
{
  title: String (unique, required),
  problemNumber: Number,
  difficulty: String (enum: Easy/Medium/Hard),
  topic: String (Array, Linked List, etc.),
  subtopics: [String],
  platform: String (LeetCode, GeeksforGeeks, etc.),
  url: String (problem link),
  sheet: String (Striver SDE Sheet, etc.),
  companies: [String] (asked by companies),
  description: String,
  hints: [String],
  similarProblems: [ObjectId] (refs: MasterProblem),
  acceptance: Number (percentage),
  likes: Number,
  isActive: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `title` (unique)
- `{sheet: 1, problemNumber: 1}` (compound)
- Text index on `{title, description}`

**Static Methods:**
- `getBySheet(sheetName)` - Get all problems from a sheet
- `getByDifficultyAndTopic(difficulty, topic)` - Filter problems
- `searchProblems(searchText)` - Full-text search

**Instance Methods:**
- `getDisplayName()` - Format: "[#123] Two Sum"
- `getDifficultyColor()` - Returns color code

**Virtuals:**
- `displayName` - Formatted problem name

---

### 3. UserProgress Model

**File:** `src/models/UserProgress.js`

**Purpose:** Track individual user's progress on problems

**Schema:**
```javascript
{
  userId: ObjectId (ref: User, required),
  problemId: ObjectId (ref: MasterProblem, required),
  status: String (enum: none/weak/revising/solved, default: none),
  lastSolvedAt: Date,
  notes: String,
  approach: String,
  starred: Boolean (default: false),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `{userId: 1, problemId: 1}` (compound unique)
- `{userId: 1, status: 1}`
- `{userId: 1, starred: 1}`

**Instance Methods:**
- `markAsSolved()` - Set status to solved
- `markAsWeak()` - Set status to weak
- `markAsRevising()` - Set status to revising
- `isStale(days = 7)` - Check if needs revision

**Static Methods:**
- `getUserProgress(userId, filters)` - Get user's progress with filters
- `getStaleProblems(userId, days)` - Get problems needing revision
- `getUserStats(userId)` - Get progress statistics
- `createOrUpdate(userId, problemId, updates)` - Upsert operation

**Middleware:**
- `pre('save')` - Auto-update lastSolvedAt when status changes

**Virtuals:**
- `daysSinceLastSolved` - Calculate days since last solved
- `needsRevision` - Boolean if > 7 days

---

### 4. Project Model

**File:** `src/models/Project.js`

**Purpose:** GitHub project tracking

**Schema:**
```javascript
{
  userId: ObjectId (ref: User, required),
  
  // GitHub fields
  githubId: Number (required),
  name: String (required),
  fullName: String (owner/repo),
  description: String,
  url: String,
  language: String,
  languages: Map of {language: bytes},
  stars: Number (default: 0),
  forks: Number (default: 0),
  topics: [String],
  
  // User tracking
  status: String (enum: planning/in-progress/completed/archived),
  progress: Number (0-100, default: 0),
  notes: String,
  techStack: [String],
  starred: Boolean (default: false),
  lastSyncedAt: Date,
  
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `{userId: 1, githubId: 1}` (compound unique)
- `{userId: 1, status: 1}`
- `{userId: 1, starred: 1}`

**Instance Methods:**
- `needsSync()` - Check if > 24 hours since last sync
- `updateFromGitHub(repoData)` - Update GitHub fields
- `getStatusColor()` - Returns color code

**Static Methods:**
- `getUserProjects(userId, filters)` - Get user's projects
- `syncFromGitHub(userId, repoData)` - Upsert from GitHub API
- `getUserStats(userId)` - Calculate statistics with reduce()

**Features:**
- Auto-sync detection
- GitHub data preservation
- Progress tracking
- Tech stack tagging

---

### 5. CareerEvent Model

**File:** `src/models/CareerEvent.js`

**Purpose:** Career milestones and interview preparation

**Embedded Schema: PreparationStep**
```javascript
{
  title: String (required),
  description: String,
  isCompleted: Boolean (default: false),
  completedAt: Date,
  order: Number
}
```

**Main Schema:**
```javascript
{
  userId: ObjectId (ref: User, required),
  title: String (required),
  description: String,
  type: String (enum: interview/deadline/goal/milestone/networking/other),
  date: Date (required),
  status: String (enum: upcoming/in-progress/completed/cancelled),
  priority: String (enum: low/medium/high, default: medium),
  company: String,
  location: String,
  url: String,
  preparationSteps: [PreparationStepSchema],
  notes: String,
  outcome: String,
  starred: Boolean (default: false),
  isArchived: Boolean (default: false),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `{userId: 1, date: 1}`
- `{userId: 1, type: 1}`
- `{userId: 1, status: 1}`

**Instance Methods:**
- `addPreparationStep(stepData)` - Add new step
- `completeStep(stepId)` - Mark step as done
- `uncompleteStep(stepId)` - Undo step completion
- `markAsCompleted(outcomeText)` - Complete event

**Static Methods:**
- `getUpcomingEvents(userId, limit)` - Get future events
- `getPastEvents(userId)` - Get past events
- `getEventsByType(userId, type)` - Filter by type
- `getUserStats(userId)` - Calculate statistics

**Middleware:**
- `pre('save')` - Auto-update status based on date

**Virtuals:**
- `daysUntilEvent` - Calculate days remaining
- `preparationProgress` - Percentage of completed steps

---

## Authentication System

### JWT Flow

```
┌─────────────────────────────────────────────────────────┐
│ 1. REGISTRATION                                         │
├─────────────────────────────────────────────────────────┤
│ POST /api/auth/register                                 │
│ Body: { email, password, name }                         │
│   ↓                                                     │
│ authController.register()                               │
│   ├─ Validate input                                    │
│   ├─ Check if email exists                             │
│   ├─ User.create() → pre-save hashes password          │
│   ├─ Generate JWT token                                │
│   └─ Return { token, user }                            │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ 2. LOGIN                                                │
├─────────────────────────────────────────────────────────┤
│ POST /api/auth/login                                    │
│ Body: { email, password }                               │
│   ↓                                                     │
│ authController.login()                                  │
│   ├─ Find user by email (include password)             │
│   ├─ comparePassword() → bcrypt.compare()              │
│   ├─ Generate JWT token                                │
│   └─ Return { token, user }                            │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ 3. PROTECTED REQUEST                                    │
├─────────────────────────────────────────────────────────┤
│ GET /api/dsa/progress                                   │
│ Header: Authorization: Bearer <JWT_TOKEN>               │
│   ↓                                                     │
│ auth middleware                                         │
│   ├─ Extract token from header                         │
│   ├─ jwt.verify(token, JWT_SECRET)                     │
│   ├─ Decode payload → { id: userId }                   │
│   ├─ User.findById(id)                                 │
│   ├─ Check isActive                                    │
│   └─ req.user = { id, email, name, role }              │
│   ↓                                                     │
│ dsaController.getUserProgress()                         │
│   ├─ const userId = req.user.id                        │
│   ├─ Query: { userId: userId }                         │
│   └─ Return only this user's data                      │
└─────────────────────────────────────────────────────────┘
```

### JWT Token Structure

```javascript
// Token format
"Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5..."

// Decoded payload
{
  id: "695984d4c6c057b97f7b3a35",  // User ID
  iat: 1735996000,                   // Issued at (timestamp)
  exp: 1738588000                    // Expires (30 days)
}

// Signature
HMACSHA256(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  JWT_SECRET
)
```

### Password Hashing

**Process:**
```javascript
// 1. User provides plain password
plainPassword = "mypassword123"

// 2. Generate salt (10 rounds)
salt = "$2a$10$N9qo8uLOickgx2ZMRZoMye"

// 3. Hash password with salt
hashedPassword = "$2a$10$N9qo8uLOickgx2ZMRZoMye.v8fROHLvXfhFb7hHfZ7"

// 4. Store only hash (never plain password)
user.password = hashedPassword

// 5. On login, compare
bcrypt.compare(plainPassword, hashedPassword) // → true/false
```

### Auth Middleware

**File:** `src/middleware/auth.js`

**Purpose:** Verify JWT tokens and protect routes

**Flow:**
```javascript
1. Extract token from "Authorization: Bearer <token>"
2. Verify token signature with JWT_SECRET
3. Decode token to get user ID
4. Find user in database
5. Check if user is active
6. Attach user to req.user
7. Call next() to continue to controller
```

**Error Handling:**
- No token → 401 "Not authorized, token required"
- Invalid token → 401 "Not authorized, token failed"
- Expired token → 401 "Not authorized, token expired"
- User not found → 401 "User not found"
- Inactive user → 401 "User account deactivated"

---

## API Endpoints

### Authentication Routes

**Base:** `/api/auth`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/register` | Public | Create new account |
| POST | `/login` | Public | Login and get token |
| GET | `/me` | Protected | Get current user |
| PATCH | `/profile` | Protected | Update profile |

---

### DSA Routes

**Base:** `/api/dsa`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/problems` | Public | Browse problem catalog |
| GET | `/problems/:id` | Public | Get problem details |
| GET | `/progress` | Protected | Get your progress |
| POST | `/progress` | Protected | Create/update progress |
| PATCH | `/progress/:problemId` | Protected | Update progress fields |
| DELETE | `/progress/:problemId` | Protected | Remove from tracking |
| GET | `/stats` | Protected | Get your statistics |
| GET | `/stale` | Protected | Get problems needing revision |

**Query Filters:**
```javascript
// Browse problems
GET /api/dsa/problems?difficulty=Medium&topic=Array&sheet=Striver%20SDE%20Sheet

// Search problems
GET /api/dsa/problems?search=binary%20search

// Filter progress
GET /api/dsa/progress?status=solved&starred=true

// Get stale problems
GET /api/dsa/stale?days=7
```

---

### Projects Routes

**Base:** `/api/projects`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | Protected | Get your projects |
| GET | `/starred` | Protected | Get starred projects |
| GET | `/stats` | Protected | Get project statistics |
| GET | `/:id` | Protected | Get single project |
| POST | `/sync` | Protected | Sync from GitHub |
| PATCH | `/:id` | Protected | Update project |
| DELETE | `/:id` | Protected | Remove project |

**Sync Example:**
```javascript
POST /api/projects/sync
{
  "githubRepos": [
    {
      "id": 123456,
      "name": "my-app",
      "full_name": "john/my-app",
      "description": "My awesome app",
      "html_url": "https://github.com/john/my-app",
      "language": "JavaScript",
      "stargazers_count": 50,
      "forks_count": 10,
      "topics": ["react", "nodejs"]
    }
  ]
}
```

---

### Career Routes

**Base:** `/api/career`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | Protected | Get all events |
| GET | `/upcoming` | Protected | Get upcoming events |
| GET | `/past` | Protected | Get past events |
| GET | `/stats` | Protected | Get statistics |
| POST | `/` | Protected | Create event |
| GET | `/:id` | Protected | Get single event |
| PATCH | `/:id` | Protected | Update event |
| DELETE | `/:id` | Protected | Delete event |
| POST | `/:id/steps` | Protected | Add preparation step |
| PATCH | `/:id/steps/:stepId` | Protected | Toggle step completion |

**Create Event Example:**
```javascript
POST /api/career
{
  "title": "Google Interview",
  "description": "Final round - System Design",
  "type": "interview",
  "date": "2026-02-15T10:00:00Z",
  "priority": "high",
  "company": "Google",
  "location": "Virtual",
  "preparationSteps": [
    {
      "title": "Review System Design patterns",
      "description": "Focus on scalability"
    },
    {
      "title": "Practice coding problems",
      "description": "Medium/Hard level"
    }
  ],
  "starred": true
}
```

---

## Controllers Logic

### DSA Controller

**File:** `src/controllers/dsaController.js`

**Functions:** 8

**1. getAllProblems()**
- **Purpose:** Browse problem catalog with filters
- **Query Params:** difficulty, topic, sheet, platform, search
- **Logic:**
  ```javascript
  - Build filter object from query params
  - If search: use MasterProblem.searchProblems()
  - Else: MasterProblem.find(filter).sort()
  - Return problems array
  ```

**2. getProblemById()**
- **Purpose:** Get single problem details
- **Logic:**
  ```javascript
  - MasterProblem.findById(id).populate('similarProblems')
  - Return problem or 404
  ```

**3. getUserProgress()**
- **Purpose:** Get user's progress with filters
- **Security:** `const userId = req.user.id`
- **Query Params:** status, starred
- **Logic:**
  ```javascript
  - Build filter from query
  - UserProgress.getUserProgress(userId, filter)
  - Return progress array with populated problems
  ```

**4. createOrUpdateProgress()**
- **Purpose:** Create or update progress (upsert)
- **Security:** `const userId = req.user.id`
- **Body:** problemId, status, notes, approach, starred
- **Logic:**
  ```javascript
  - Validate problemId exists in MasterProblem
  - Build updates object
  - UserProgress.createOrUpdate(userId, problemId, updates)
  - Return progress with populated problem
  ```

**5. updateProgress()**
- **Purpose:** Update specific fields
- **Security:** `const userId = req.user.id`
- **Logic:**
  ```javascript
  - Find progress by userId + problemId
  - Update fields
  - Save and populate
  - Return updated progress
  ```

**6. deleteProgress()**
- **Purpose:** Remove problem from tracking
- **Security:** `const userId = req.user.id`
- **Logic:**
  ```javascript
  - UserProgress.findOneAndDelete({ userId, problemId })
  - Return success or 404
  ```

**7. getUserStats()**
- **Purpose:** Get progress statistics
- **Security:** `const userId = req.user.id`
- **Logic:**
  ```javascript
  - UserProgress.getUserStats(userId)
  - Add stale problems count
  - Return { total, solved, revising, weak, none, staleCount }
  ```

**8. getStaleProblems()**
- **Purpose:** Get problems needing revision
- **Security:** `const userId = req.user.id`
- **Query Params:** days (default: 7)
- **Logic:**
  ```javascript
  - UserProgress.getStaleProblems(userId, days)
  - Return problems with populated details
  ```

---

### Project Controller

**File:** `src/controllers/projectController.js`

**Functions:** 7

**Key Operations:**
- getUserProjects() - Filter by status, starred, language
- getProjectById() - Verify ownership
- syncFromGitHub() - Iterate repos, upsert each
- updateProject() - Update tracking fields only
- deleteProject() - Soft delete (set status: archived)
- getProjectStats() - Use Project.getUserStats() with reduce
- getStarredProjects() - Filter { starred: true }

---

### Career Controller

**File:** `src/controllers/careerController.js`

**Functions:** 10

**Key Operations:**
- getAllEvents() - Filter by type, status, starred
- getUpcomingEvents() - Events after today, sorted by date
- getPastEvents() - Events before today
- getEventStats() - Count by type and status
- createEvent() - With embedded preparation steps
- getEventById() - Verify ownership
- updateEvent() - Update any fields
- deleteEvent() - Hard delete
- addPreparationStep() - Push to preparationSteps array
- toggleStepCompletion() - Find step by id, toggle isCompleted

---

### Auth Controller

**File:** `src/controllers/authController.js`

**Functions:** 4

**1. register()**
```javascript
- Validate: email, password (min 6), name
- Check: email already exists
- User.create() → password auto-hashed
- Generate JWT token
- Return { token, user }
```

**2. login()**
```javascript
- Find user by email (select password)
- Verify password with comparePassword()
- Generate JWT token
- Return { token, user }
```

**3. getMe()**
```javascript
- User already in req.user (from auth middleware)
- Return current user details
```

**4. updateProfile()**
```javascript
- Get user from req.user.id
- Update: name, githubUsername, avatar
- Return updated user
```

**Helper: generateToken()**
```javascript
jwt.sign(
  { id: userId },
  process.env.JWT_SECRET,
  { expiresIn: '30d' }
)
```

---

## Security Implementation

### Before Security Fix (Vulnerable)

```javascript
// Controller code (INSECURE)
const userId = req.query.userId || req.user?.id;

if (!userId) {
  return res.status(400).json({ message: 'User ID required' });
}

// Query with userId from query params
const progress = await UserProgress.find({ userId });
```

**Attack:**
```bash
# Attacker can steal any user's data
curl "http://localhost:5000/api/dsa/progress?userId=VICTIM_ID"
```

---

### After Security Fix (Secure)

**1. Routes Protected with Middleware:**
```javascript
// Routes file
const auth = require('../middleware/auth');

// Protected routes
router.get('/progress', auth, dsaController.getUserProgress);
router.post('/progress', auth, dsaController.createOrUpdateProgress);
router.patch('/progress/:problemId', auth, dsaController.updateProgress);
router.delete('/progress/:problemId', auth, dsaController.deleteProgress);
router.get('/stats', auth, dsaController.getUserStats);
router.get('/stale', auth, dsaController.getStaleProblems);

// Public routes (no auth)
router.get('/problems', dsaController.getAllProblems);
router.get('/problems/:id', dsaController.getProblemById);
```

**2. Controllers Use Verified User ID:**
```javascript
// Controller code (SECURE)
const userId = req.user.id; // From verified JWT token

// No userId validation needed - auth middleware guarantees it exists
const progress = await UserProgress.find({ userId });
```

**3. Middleware Verification:**
```javascript
// auth middleware
const token = req.headers.authorization?.split(' ')[1];
const decoded = jwt.verify(token, process.env.JWT_SECRET);
const user = await User.findById(decoded.id);
req.user = { id: user._id, email: user.email, name: user.name };
next();
```

---

### Security Checklist

✅ **Authentication**
- JWT tokens required for protected routes
- Tokens signed with secret key
- 30-day expiry

✅ **Password Security**
- Hashed with bcrypt (10 salt rounds)
- Never stored as plain text
- Never returned in responses

✅ **Authorization**
- auth middleware verifies identity
- Controllers use req.user.id only
- No query param userId accepted

✅ **Data Isolation**
- All queries filter by userId
- Compound unique indexes
- Users can't access others' data

✅ **Secret Management**
- JWT_SECRET in .env
- Not committed to git
- Different for dev/production

---

## Testing

### Test Files

**1. testModels.js**
- Tests Master-Progress pattern
- Validates populate() relationships
- Tests static/instance methods
- Verifies unique indexes

**2. testAuth.js**
- Tests user registration
- Verifies password hashing
- Tests comparePassword()
- Validates duplicate prevention
- Checks sensitive data removal

**3. testSecurity.js** ⭐ NEW
- Tests JWT authentication flow
- Verifies data isolation between users
- Validates token generation/verification
- Explains security model

### Run Tests

```bash
# Test models
npm run test:models

# Test authentication
npm run test:auth

# Test security
npm run test:security
```

### Test Results

All tests passing! ✅

```
TEST 1: Register User
✅ User registered: test1@test.com
✅ Password hashed: true

TEST 2: Data Isolation Between Users
✅ User 1 created progress
✅ User 1 progress count: 1
✅ User 2 progress count: 0
✅ Data properly isolated between users

TEST 3: JWT Authentication Flow
✅ Password comparison works: true
✅ JWT token generated
✅ Token verified, user ID: 695984d4c6c057b97f7b3a35
✅ Token expires in 30 days

🎉 ALL SECURITY TESTS PASSED!
```

---

## Setup & Installation

### Prerequisites

```bash
Node.js (v14+)
MongoDB (local or Atlas)
npm or yarn
```

### Installation Steps

**1. Clone Repository**
```bash
git clone https://github.com/Bhaveshs1212/Blaezi-backend.git
cd Blaezi-backend
```

**2. Install Dependencies**
```bash
npm install
```

**Dependencies installed:**
- express: 5.2.1
- mongoose: 9.0.2
- jsonwebtoken: 9.0.3
- bcryptjs: 3.0.3
- cors: 2.8.5
- dotenv: 17.2.3
- nodemon: (dev)

**3. Configure Environment**

Create `.env` file:
```env
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/blaezi
JWT_SECRET=blaezi_jwt_secret_key_change_in_production_2026
```

**4. Seed Database (Optional)**
```bash
# Import Striver SDE Sheet problems
npm run seed:dsa

# Clear and reimport
npm run seed:dsa:clear
```

**5. Start Server**
```bash
# Development (with nodemon)
npm run dev

# Production
npm start
```

Server runs at: `http://localhost:5000`

---

## Usage Examples

### Authentication Flow

**1. Register New User**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "mypassword123",
    "name": "John Doe"
  }'
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "695984d4c6c057b97f7b3a35",
    "email": "john@example.com",
    "name": "John Doe",
    "role": "user"
  }
}
```

**2. Login**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "mypassword123"
  }'
```

**3. Store Token**
```javascript
// Frontend
localStorage.setItem('token', response.data.token);
```

---

### DSA Operations

**1. Browse Problems (Public)**
```bash
curl http://localhost:5000/api/dsa/problems?difficulty=Easy&topic=Array
```

**2. Create Progress (Protected)**
```bash
curl -X POST http://localhost:5000/api/dsa/progress \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "problemId": "507f1f77bcf86cd799439011",
    "status": "solved",
    "notes": "Used two pointers approach",
    "starred": true
  }'
```

**3. Get Your Progress**
```bash
curl http://localhost:5000/api/dsa/progress?status=solved \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**4. Get Statistics**
```bash
curl http://localhost:5000/api/dsa/stats \
  -H "Authorization: Bearer YOUR_TOKEN"
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

---

### Project Operations

**1. Sync from GitHub**
```bash
curl -X POST http://localhost:5000/api/projects/sync \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "githubRepos": [
      {
        "id": 123456,
        "name": "my-app",
        "full_name": "john/my-app",
        "description": "My awesome app",
        "html_url": "https://github.com/john/my-app",
        "language": "JavaScript",
        "stargazers_count": 50
      }
    ]
  }'
```

**2. Update Project**
```bash
curl -X PATCH http://localhost:5000/api/projects/PROJECT_ID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "completed",
    "progress": 100,
    "notes": "Successfully deployed!",
    "starred": true
  }'
```

---

### Career Event Operations

**1. Create Event**
```bash
curl -X POST http://localhost:5000/api/career \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Google Interview",
    "type": "interview",
    "date": "2026-02-15T10:00:00Z",
    "priority": "high",
    "company": "Google",
    "preparationSteps": [
      {
        "title": "Review System Design",
        "description": "Focus on scalability patterns"
      }
    ]
  }'
```

**2. Add Preparation Step**
```bash
curl -X POST http://localhost:5000/api/career/EVENT_ID/steps \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Mock Interview",
    "description": "Practice with peer"
  }'
```

**3. Complete Step**
```bash
curl -X PATCH http://localhost:5000/api/career/EVENT_ID/steps/STEP_ID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "isCompleted": true
  }'
```

---

## Project Structure

```
Blaezi-backend/
│
├── src/
│   ├── index.js                 # Server entry point
│   │
│   ├── config/
│   │   └── db.js                # MongoDB connection
│   │
│   ├── models/
│   │   ├── User.js              # User authentication
│   │   ├── MasterProblem.js     # DSA problems catalog
│   │   ├── UserProgress.js      # User's DSA progress
│   │   ├── Project.js           # GitHub projects
│   │   └── CareerEvent.js       # Career events
│   │
│   ├── controllers/
│   │   ├── authController.js    # Auth logic
│   │   ├── dsaController.js     # DSA operations
│   │   ├── projectController.js # Project operations
│   │   └── careerController.js  # Career operations
│   │
│   ├── routes/
│   │   ├── authRoutes.js        # /api/auth/*
│   │   ├── dsaRoutes.js         # /api/dsa/*
│   │   ├── projectRoutes.js     # /api/projects/*
│   │   └── careerRoutes.js      # /api/career/*
│   │
│   ├── middleware/
│   │   └── auth.js              # JWT verification
│   │
│   ├── seed/
│   │   ├── seedDSA.js           # Import problems
│   │   └── dsaProblems.js       # Problem data
│   │
│   └── test/
│       ├── testModels.js        # Model tests
│       ├── testAuth.js          # Auth tests
│       └── testSecurity.js      # Security tests
│
├── .env                         # Environment variables
├── .gitignore                   # Git ignore rules
├── package.json                 # Dependencies & scripts
├── README.md                    # Project readme
├── API_COMPLETE.md              # API documentation
├── AUTH_GUIDE.md                # Auth guide
├── SECURITY_FIX_COMPLETE.md     # Security docs
└── COMPLETE_PROJECT_DOCUMENTATION.md  # This file
```

---

## Key Concepts & Learning

### 1. Master-Progress Pattern

**Concept:** Separate global catalog from individual tracking

**Why:**
- Single source of truth for problems
- No data duplication across users
- Easy to update problem details
- Each user tracks independently

**Implementation:**
```javascript
// Global catalog (one record per problem)
MasterProblem { title: "Two Sum", difficulty: "Easy" }

// Individual tracking (one record per user per problem)
UserProgress { userId: "user1", problemId: "twosumId", status: "solved" }
UserProgress { userId: "user2", problemId: "twosumId", status: "weak" }
```

**Benefits:**
- Scalable (31 problems shared by 1000s of users)
- Maintainable (update problem once, affects all users)
- Efficient queries with populate()

---

### 2. JWT Authentication

**Concept:** Stateless token-based authentication

**Why:**
- No session storage needed
- Scales horizontally
- Works across domains
- Self-contained (carries user info)

**Flow:**
```
User → Login → Server verifies → Generates JWT → Returns token
User → Stores token (localStorage)
User → Requests with token in header
Server → Verifies signature → Extracts user ID → Continues
```

**Token Contains:**
- User ID (payload)
- Issued timestamp
- Expiry timestamp
- Signature (prevents tampering)

---

### 3. Password Hashing

**Concept:** Never store plain passwords

**Why:**
- Database breach won't expose passwords
- One-way function (can't reverse)
- Salt prevents rainbow table attacks

**Process:**
```javascript
Plain: "mypassword"
  ↓ bcrypt.hash() with salt
Hash: "$2a$10$N9qo8uLOickgx2ZMRZoMye..."
  ↓ Store in database
  ↓ On login
bcrypt.compare(plain, hash) → true/false
```

---

### 4. Middleware Chain

**Concept:** Functions that run before controllers

**Why:**
- Separation of concerns
- Reusable verification logic
- Clean controller code

**Pattern:**
```javascript
Request → Middleware 1 → Middleware 2 → Controller → Response
           (CORS)         (Auth)         (Logic)

router.get('/protected', auth, controller);
                         ^^^^  ^^^^^^^^^^
                         runs  then runs
                         first second
```

---

### 5. Data Isolation

**Concept:** Users can only access their own data

**Why:**
- Privacy
- Security
- Compliance (GDPR, etc.)

**Implementation:**
```javascript
// Every query filters by userId
const progress = await UserProgress.find({ 
  userId: req.user.id  // From verified JWT
});

// Compound unique indexes prevent duplicates
{ userId: 1, problemId: 1 } unique
```

---

### 6. Mongoose Patterns

**Static Methods:**
```javascript
// Called on Model
UserProgress.getUserStats(userId)
```

**Instance Methods:**
```javascript
// Called on document
progress.markAsSolved()
```

**Virtuals:**
```javascript
// Computed fields (not stored)
get daysUntilEvent() {
  return Math.ceil((this.date - Date.now()) / 86400000);
}
```

**Middleware:**
```javascript
// pre-save hook
schema.pre('save', async function() {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
});
```

---

### 7. REST API Principles

**Resources:**
- `/api/dsa/problems` - Collection
- `/api/dsa/problems/:id` - Single item

**HTTP Methods:**
- GET - Retrieve
- POST - Create
- PATCH - Update partial
- PUT - Update full
- DELETE - Remove

**Status Codes:**
- 200 - Success
- 201 - Created
- 400 - Bad request
- 401 - Unauthorized
- 404 - Not found
- 500 - Server error

**Response Format:**
```json
{
  "success": true,
  "data": { ... },
  "count": 10,
  "message": "Operation successful"
}
```

---

## Advanced Features

### 1. Text Search

**Implementation:**
```javascript
// Model: Text index
MasterProblemSchema.index({ 
  title: 'text', 
  description: 'text' 
});

// Query: Full-text search
MasterProblem.find({ 
  $text: { $search: searchText } 
});
```

### 2. Compound Indexes

**Purpose:** Ensure uniqueness across multiple fields

```javascript
// One user can't have duplicate progress on same problem
UserProgressSchema.index({ 
  userId: 1, 
  problemId: 1 
}, { unique: true });
```

### 3. Populate (JOIN)

**Purpose:** Get referenced documents

```javascript
// Instead of just ObjectId
const progress = await UserProgress.find({ userId })
  .populate('problemId');

// Returns full problem details
{
  _id: "...",
  problemId: {
    title: "Two Sum",
    difficulty: "Easy",
    // ... full problem
  },
  status: "solved"
}
```

### 4. Aggregate (Statistics)

**Purpose:** Complex calculations

```javascript
// Project statistics with reduce
static async getUserStats(userId) {
  const projects = await this.find({ userId });
  
  return projects.reduce((stats, project) => {
    stats.total++;
    stats.byStatus[project.status]++;
    stats.avgProgress += project.progress;
    return stats;
  }, { total: 0, byStatus: {}, avgProgress: 0 });
}
```

### 5. Embedded Documents

**Purpose:** Related data within parent

```javascript
// CareerEvent with embedded preparation steps
{
  title: "Interview",
  preparationSteps: [  // Embedded array
    { title: "Step 1", isCompleted: true },
    { title: "Step 2", isCompleted: false }
  ]
}
```

---

## Production Checklist

Before deploying:

**Environment:**
- [ ] Set strong JWT_SECRET (random 32+ chars)
- [ ] Use production MongoDB (Atlas, etc.)
- [ ] Enable HTTPS
- [ ] Set NODE_ENV=production

**Security:**
- [ ] Add rate limiting (express-rate-limit)
- [ ] Add helmet.js for headers
- [ ] Enable CORS for specific origins
- [ ] Add refresh tokens
- [ ] Implement password reset
- [ ] Add email verification
- [ ] Log security events

**Performance:**
- [ ] Enable compression
- [ ] Add caching (Redis)
- [ ] Database indexes optimized
- [ ] Connection pooling
- [ ] Load balancing

**Monitoring:**
- [ ] Error tracking (Sentry)
- [ ] Logging (Winston/Morgan)
- [ ] Performance monitoring
- [ ] Uptime monitoring

**Backup:**
- [ ] Automated database backups
- [ ] Disaster recovery plan
- [ ] Data retention policy

---

## Troubleshooting

### Common Issues

**1. JWT Token Invalid**
```
Error: "Not authorized, token failed"

Solution:
- Check JWT_SECRET matches between sign and verify
- Token might be expired (30 days)
- Login again to get new token
```

**2. CORS Error**
```
Error: "Access-Control-Allow-Origin"

Solution:
- Enable CORS in index.js
- Add frontend origin to CORS whitelist
```

**3. MongoDB Connection Failed**
```
Error: "MongooseServerSelectionError"

Solution:
- Check MONGO_URI in .env
- Verify network access in MongoDB Atlas
- Check username/password
```

**4. Password Not Hashing**
```
Error: Password stored as plain text

Solution:
- Ensure pre('save') middleware exists
- Check bcrypt is installed
- Verify isModified('password') check
```

**5. Data Leaking Between Users**
```
Error: User A sees User B's data

Solution:
- Ensure routes have auth middleware
- Controllers use req.user.id (not query params)
- Database queries filter by userId
```

---

## API Response Examples

### Success Response

```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "title": "Two Sum",
      "difficulty": "Easy",
      "status": "solved"
    }
  ]
}
```

### Error Response

```json
{
  "success": false,
  "message": "Problem not found",
  "error": "Cast to ObjectId failed"
}
```

### Stats Response

```json
{
  "success": true,
  "data": {
    "total": 150,
    "solved": 45,
    "revising": 12,
    "weak": 8,
    "none": 85,
    "byDifficulty": {
      "Easy": 20,
      "Medium": 20,
      "Hard": 5
    },
    "byTopic": {
      "Array": 15,
      "Linked List": 10,
      "Tree": 8
    },
    "staleCount": 5
  }
}
```

---

## Conclusion

### What You Built

✅ **Complete Backend API** - 30+ endpoints  
✅ **5 Database Models** - Well-structured schemas  
✅ **JWT Authentication** - Secure token-based auth  
✅ **Password Security** - bcrypt hashing  
✅ **Data Isolation** - User privacy protected  
✅ **Master-Progress Pattern** - Scalable architecture  
✅ **GitHub Integration** - Project syncing  
✅ **Career Tracking** - Event management  
✅ **Comprehensive Testing** - All tests passing  
✅ **Production Ready** - Secure and scalable  

### What You Learned

1. **Architecture Patterns** - Master-Progress, Embedded Docs
2. **Security Best Practices** - JWT, Password Hashing, Middleware
3. **Database Design** - Indexes, Relationships, Queries
4. **RESTful APIs** - Endpoints, Status Codes, Responses
5. **Authentication Flow** - Register, Login, Protected Routes
6. **Mongoose Advanced** - Virtuals, Statics, Middleware
7. **Error Handling** - Validation, 404s, 500s
8. **Testing** - Unit tests, Integration tests

### Next Steps

**Enhancements:**
- Add pagination for large lists
- Implement search autocomplete
- Add file upload (avatars, attachments)
- Real-time updates (Socket.io)
- Email notifications
- Password reset flow
- Two-factor authentication
- Admin dashboard

**Frontend Integration:**
- Build React/Vue/Angular frontend
- Implement axios interceptors for tokens
- Create login/signup pages
- Build dashboard with statistics
- Add real-time progress tracking

---

**🎉 Congratulations! You've built a production-ready backend!** 🚀

Your backend is secure, scalable, and well-documented. You've learned fundamental concepts that apply to any backend project. Keep building!

---

*Last Updated: January 4, 2026*  
*Version: 1.0.0*  
*Status: Production Ready*

# Blaezi Backend - Step-by-Step Learning Roadmap

**Date Started:** January 3, 2026  
**Learning Approach:** Slow, steady, concept-first  
**Goal:** Build a production-ready backend while deeply understanding every decision

---

## 🎯 Learning Philosophy

> "Don't just write code - understand WHY you're writing it."

We'll follow this pattern for every step:
1. **Concept** - What is this?
2. **Why** - Why do we need it?
3. **How** - How does it work?
4. **Build** - Let's implement it
5. **Test** - Verify it works
6. **Reflect** - What did we learn?

---

## 🎯 CRITICAL: Data Source Understanding

### Your Game-Changing Insight

**Original Assumption:** Users manually create everything  
**Your Reality:** Data comes from external sources!

1. **DSA Problems** → Imported from curated sheets (Striver SDE Sheet, Blind 75, etc.)
2. **Projects** → Retrieved from GitHub API (user's actual repositories)

**This changes EVERYTHING about our design!** Let's rethink the architecture...

---

## 📚 Phase 1: Foundation (Week 1)

### Day 0: Understanding External Data Sources (NEW!)

#### 📖 Core Concept: Master Data vs User Data

**Think of it like Spotify:**
- **Songs (Master Data)**: Spotify has millions of songs
- **Your Playlists (User Data)**: You track which songs YOU like

**For Blaezi:**

**DSA Problems = Songs (Master Data)**
```
Master Problems Table (global, everyone sees same problems)
├── Problem 1: "Two Sum" (Easy, Arrays)
├── Problem 2: "Valid Parentheses" (Easy, Stack)
└── Problem 3: "Merge Intervals" (Medium, Arrays)

User Progress Table (YOUR tracking)
├── User: Bhavesh → Problem 1 → Status: "solved", Last: 2026-01-02
├── User: Bhavesh → Problem 2 → Status: "weak", Last: 2025-12-20
└── User: John → Problem 1 → Status: "revising", Last: 2026-01-01
```

**Projects = GitHub Repos (External API)**
```
Your GitHub Account
├── Repo: "portfolio-website" (via GitHub API)
├── Repo: "ecommerce-app" (via GitHub API)
└── Repo: "chat-application" (via GitHub API)

Your Milestones (Blaezi-specific tracking)
├── portfolio-website → [Design UI, Add animations, Deploy]
├── ecommerce-app → [Setup backend, Add payment, Test]
```

---

#### 🤔 Why This Approach is Better

**For DSA Problems:**

❌ **Old Way (User Creates Everything):**
```
User 1 creates: "Two Sum" (typo: "Tow Sum")
User 2 creates: "Two Sum" 
User 3 creates: "2Sum"
→ Same problem, 3 duplicates, no consistency!
```

✅ **New Way (Master List + Progress Tracking):**
```
Database has: "Two Sum" (ID: 1, official data)
User 1 marks: Problem #1 as "solved"
User 2 marks: Problem #1 as "weak"
User 3 marks: Problem #1 as "revising"
→ Same problem, consistent data, easy analytics!
```

**Benefits:**
1. ✅ No duplicates
2. ✅ Consistent difficulty/topic labels
3. ✅ Can show global stats (e.g., "85% of users find this hard")
4. ✅ Easy to import entire problem sheets
5. ✅ Users can't mess up the core data

---

**For Projects (GitHub Integration):**

✅ **Synced with Reality:**
```
Backend fetches from GitHub API:
- Real repo names
- Real descriptions
- Real last commit dates
- Real languages used

You add on top:
- Custom milestones
- Project health tracking
- Priority levels
```

**Benefits:**
1. ✅ Always up-to-date with actual repos
2. ✅ No manual data entry
3. ✅ Automatic activity tracking (last commit = last worked)
4. ✅ Can show real GitHub stats

---

#### 🏗️ New Architecture Design

**Original (Simple but Limited):**
```
Collections:
├── dsa_problems (user creates & tracks)
├── projects (user creates & tracks)
└── career_events (user creates & tracks)
```

**New (Realistic & Scalable):**
```
Collections:
├── master_problems (pre-populated from sheets)
│   └── { id, title, difficulty, topic, platform, url }
│
├── user_problem_progress (tracks YOUR progress)
│   └── { userId, problemId, status, lastSolvedAt, notes }
│
├── user_projects (synced with GitHub)
│   └── { userId, githubRepoUrl, customName, milestones }
│
└── career_events (user creates)
    └── { userId, title, date, type, preparation }
```

---

#### 📊 Database Design: Master + Progress Pattern

**Analogy: Library System**

**Books Table (Master Data - Everyone Sees Same Books):**
```javascript
{
  _id: "book123",
  title: "Clean Code",
  author: "Robert Martin",
  isbn: "978-0132350884",
  category: "Programming"
}
```

**User Checkouts (User-Specific Data):**
```javascript
{
  _id: "checkout456",
  userId: "user1",
  bookId: "book123",
  checkedOutDate: "2026-01-01",
  status: "reading",
  notes: "Great insights on refactoring"
}
```

**Same pattern for DSA:**

**Master Problems (One Source of Truth):**
```javascript
{
  _id: ObjectId("prob1"),
  title: "Two Sum",
  difficulty: "Easy",
  topic: "Arrays",
  platform: "LeetCode",
  url: "https://leetcode.com/problems/two-sum",
  problemNumber: 1,
  sheet: "Striver SDE Sheet"
}
```

**User Progress (YOUR Journey):**
```javascript
{
  _id: ObjectId("progress1"),
  userId: ObjectId("user123"),
  problemId: ObjectId("prob1"),
  status: "solved",
  lastSolvedAt: "2026-01-02T10:30:00Z",
  attempts: 3,
  notes: "Used hashmap approach, O(n) solution",
  timeSpent: 45 // minutes
}
```

---

#### 🔄 How Data Flows

**DSA Flow:**
```
1. ADMIN/SYSTEM ACTION (one-time):
   ↓
   Scrape/Import Striver SDE Sheet
   ↓
   Save to master_problems collection
   ↓
   Now ALL users see these problems

2. USER ACTION (ongoing):
   ↓
   User views problem list (from master_problems)
   ↓
   User marks problem as "solved"
   ↓
   Create/Update in user_problem_progress
   ↓
   User sees their personal progress
```

**Projects Flow:**
```
1. USER CONNECTS GITHUB:
   ↓
   Frontend calls: POST /api/projects/sync-github
   ↓
   Backend calls GitHub API
   ↓
   Fetch user's repos
   ↓
   Save to user_projects collection

2. USER ADDS MILESTONES:
   ↓
   POST /api/projects/:id/milestones
   ↓
   Update user_projects document
   ↓
   Milestones stored alongside GitHub data

3. AUTO-SYNC (optional):
   ↓
   Cron job runs daily
   ↓
   Refresh lastCommitDate from GitHub
   ↓
   Update lastWorkedAt in database
```

---

#### 📝 Schema Planning Exercise

**BEFORE WE CODE, DESIGN THIS:**

**Master Problems Schema:**
```
What fields does a problem need?
- title: ??? (from Striver sheet)
- difficulty: ??? (Easy/Medium/Hard)
- topic: ??? (Arrays, Strings, etc.)
- platform: ??? (LeetCode, GFG, etc.)
- url: ??? (link to problem)
- sheet: ??? (which sheet is it from?)
- companies: ??? (which companies ask this?)
- ???: any other metadata?
```

**User Progress Schema:**
```
What fields track YOUR progress?
- userId: ??? (link to user)
- problemId: ??? (link to master problem)
- status: ??? (solved/revising/weak/none)
- lastSolvedAt: ??? (date)
- attempts: ??? (how many times tried?)
- notes: ??? (your personal notes)
- timeSpent: ??? (track time?)
- ???: what else helps you?
```

**User Projects Schema:**
```
What comes from GitHub?
- githubRepoUrl: ??? (unique identifier)
- repoName: ??? (fetched from GitHub)
- description: ??? (fetched from GitHub)
- language: ??? (fetched from GitHub)
- lastCommitDate: ??? (fetched from GitHub)
- stars: ??? (fetched from GitHub)

What do YOU add?
- customName: ??? (override GitHub name?)
- milestones: ??? (your custom milestones)
- priority: ??? (high/medium/low)
- status: ??? (active/paused/completed)
- notes: ??? (your project notes)
```

---

### Day 1: Understanding MongoDB Collections & Documents

#### 📖 Core Concept: What is a Collection?

Think of MongoDB like this:

```
MongoDB Database (blaezi)
├── Collection: master_problems (Global problem database)
│   ├── Document 1: { _id: "prob1", title: "Two Sum", difficulty: "Easy", sheet: "Striver" }
│   ├── Document 2: { _id: "prob2", title: "Best Time to Buy/Sell", difficulty: "Easy" }
│   └── Document 3: { _id: "prob3", title: "Longest Substring", difficulty: "Medium" }
│
├── Collection: user_problem_progress (Your progress tracking)
│   ├── Document 1: { userId: "user123", problemId: "prob1", status: "solved" }
│   ├── Document 2: { userId: "user123", problemId: "prob2", status: "weak" }
│   └── Document 3: { userId: "user456", problemId: "prob1", status: "revising" }
│
├── Collection: user_projects (Synced with GitHub)
│   ├── Document 1: { userId: "user123", githubUrl: "...", milestones: [...] }
│   └── Document 2: { userId: "user123", githubUrl: "...", milestones: [...] }
│
└── Collection: career_events (User created)
    ├── Document 1: { userId: "user123", title: "Google Interview", date: "2026-02-15" }
    └── Document 2: { userId: "user123", title: "Placement Exam", date: "2026-03-01" }
```

**Key Insight:** Each collection is **independent**. They don't know about each other (unlike SQL foreign keys).

---

#### 🤔 Why Separate Collections?

**Question:** Why not just use `{ type: "dsa" }` in one collection?

**Answer:** Because each domain has **different shapes**:

```javascript
// DSA Problem shape
{
  title: "Two Sum",
  difficulty: "Easy",      // ✅ Makes sense for DSA
  topic: "Arrays",         // ✅ Makes sense for DSA
  status: "solved"         // ✅ Makes sense for DSA
}

// Project shape
{
  name: "Portfolio",
  milestones: [            // ✅ Makes sense for Projects
    { title: "Design", completed: true }
  ],
  difficulty: ???          // ❌ Doesn't make sense here
  topic: ???               // ❌ Doesn't make sense here
}
```

**Forcing them into one shape creates "nulls everywhere":**
```javascript
// BAD: Unified collection
{
  title: "Two Sum",
  category: "dsa",
  difficulty: "Easy",
  topic: "Arrays",
  milestones: null,        // ❌ Empty for DSA
  preparation: null        // ❌ Empty for DSA
}

{
  title: "Portfolio",
  category: "project",
  difficulty: null,        // ❌ Empty for Projects
  topic: null,             // ❌ Empty for Projects
  milestones: [...]        // ✅ Used only here
}
```

**Separate collections = clean, focused data:**
```javascript
// GOOD: Separate collections
dsa_problems: { title, difficulty, topic, status }
projects: { name, milestones, lastWorkedAt }
career_events: { title, date, preparation }
```

---

#### ⚙️ How Mongoose Schemas Work

**Mongoose is like a blueprint for your data:**

```javascript
// Blueprint for a house
const HouseSchema = new Schema({
  address: { type: String, required: true },
  bedrooms: { type: Number, min: 1, max: 10 },
  hasGarage: { type: Boolean, default: false }
})

// Every house built from this blueprint MUST follow these rules
```

**Mongoose provides:**
1. **Type checking** - "bedrooms must be a number"
2. **Validation** - "bedrooms must be between 1 and 10"
3. **Defaults** - "if not specified, hasGarage = false"
4. **Methods** - "calculateProperty Tax()"

**Without Mongoose (raw MongoDB):**
```javascript
// MongoDB accepts ANYTHING
db.houses.insertOne({ address: "123 Main", bedrooms: "purple", hasPool: 99 })
// ✅ Saved! (but data is nonsense)
```

**With Mongoose:**
```javascript
// Mongoose validates BEFORE saving
const house = new House({ address: "123 Main", bedrooms: "purple" })
await house.save()
// ❌ Error: bedrooms must be a number
```

---

### Day 2: Designing Schemas for External Data Sources

#### 📖 Schema Design Mental Model (UPDATED)

**New Questions to Ask:**
1. **What comes from external source?** → Master data (read-only)
2. **What is user-specific tracking?** → Progress data (user-writable)
3. **How do we link them together?** → Relationships

**Example: DSA Problems (Master + Progress Pattern)**

**Master Problem Schema (External Source):**
```
What comes from Striver/LeetCode sheets?
1. Problem metadata:
   - title: "Two Sum"
   - difficulty: "Easy" (from sheet)
   - topic: "Arrays" (from sheet)
   - platform: "LeetCode" (where to solve)
   - url: "https://..." (direct link)
   - problemNumber: 1 (sheet position)
   
2. Additional metadata:
   - companies: ["Google", "Amazon"] (who asks this)
   - sheet: "Striver SDE Sheet" (which list)
   - likes: 15000 (from LeetCode)
   - acceptance: 49% (from LeetCode)

Decision: These fields are READ-ONLY (users can't change them)
```

**User Progress Schema (Your Tracking):**
```
What tracks YOUR journey with this problem?
1. Identification:
   - userId: Link to user
   - problemId: Link to master problem
   
2. Progress tracking:
   - status: "solved" (your current state)
   - lastSolvedAt: "2026-01-02" (when you last solved)
   - attempts: 3 (how many times you tried)
   - timeSpent: 45 (minutes spent)
   
3. Personal notes:
   - notes: "Used hashmap, O(n) solution"
   - approach: "Two pointer technique"
   - mistakes: "Forgot edge case for empty array"

Decision: These fields are USER-WRITABLE (you control them)
```

---

#### 🎨 Schema Design Exercise

Let's design the DSA schema together by **thinking out loud**:

**Field 1: Title**
```
Question: What should we call it?
Options:
  - "name"
  - "title"  ✅ (more descriptive for problems)
  - "problemName"

Question: Should it be required?
Answer: YES (you can't have a problem without a name)

Question: Should it be unique?
Answer: Maybe (prevents duplicates, but what if same problem from 2 sites?)
Decision: Let's make it unique for now, can change later

Final:
title: { 
  type: String, 
  required: true,
  unique: true,      // Prevents duplicate problems
  trim: true         // Removes extra spaces
}
```

**Field 2: Difficulty**
```
Question: What are the valid values?
Answer: Easy, Medium, Hard (matches frontend)

Question: Should we allow "Very Hard" or "Expert"?
Answer: No, keep it simple with 3 levels

Question: Should there be a default?
Answer: No - force user to specify difficulty

Final:
difficulty: {
  type: String,
  enum: ['Easy', 'Medium', 'Hard'],  // Only these 3 allowed
  required: true
}
```

**Field 3: Topic**
```
Question: Should this be an enum or free text?

Option A: Enum (fixed list)
topics: ['Arrays', 'Strings', 'Trees', 'Graphs', ...]
Pros: Consistent, can filter reliably
Cons: Hard to add new topics, restrictive

Option B: Free text
topics: String
Pros: Flexible, users can add anything
Cons: Typos cause filtering issues ("Aray" vs "Arrays")

Decision: Start with String, add enum later if needed

Final:
topic: {
  type: String,
  required: true,
  trim: true
}
```

**Field 4: Status**
```
Question: What are the states a problem can be in?

From your frontend context:
- "none" - not attempted
- "weak" - tried but failed
- "revising" - need more practice
- "solved" - completed successfully

Question: Should there be a default?
Answer: YES - "none" (new problems start unattended)

Final:
status: {
  type: String,
  enum: ['none', 'weak', 'revising', 'solved'],
  default: 'none'
}
```

**Field 5: Last Solved Date**
```
Question: When should this be set?

Answer: When status changes to "solved" or "revising"

Question: What if the problem was never solved?
Answer: It can be null/undefined

Question: Should we track ALL solve dates or just the latest?
Answer: Just latest for now (keeps it simple)

Final:
lastSolvedAt: {
  type: Date,
  default: null
}
```

**Field 6: Notes (Optional)**
```
Question: Should users be able to add hints/approaches?
Answer: YES - very useful for revision
Design GitHub-Integrated Project Schema

Before we code anything, **design the Project schema** considering GitHub integration:

**Questions to answer:**
1. What data comes from GitHub API? (name, description, language, stars, lastCommit)
2. What data do WE add on top? (milestones, priority, notes)
3. How do we uniquely identify a project? (GitHub URL? repo name?)
4. Should we cache GitHub data or fetch real-time?
5. What happens if user deletes repo from GitHub?
6. How do milestones relate to actual GitHub issues/projects?

**Write your answers here:**
```
YOUR DESIGN:

From GitHub API:
- githubRepoUrl: ??? (unique identifier)
- repoName: ??? (fetched, can change on GitHub)
- description: ??? (fetched, can change)
- language: ??? (primary language)
- lastCommitDate: ??? (activity tracking)
- stars: ??? (popularity)
- private: ??? (boolean)

Your Additions:
- customName: ??? (override GitHub name?)
- milestones: ??? (array? embedded? what fields?)
- priority: ??? (high/medium/low)
- status: ??? (active/paused/completed)
- notes: ??? (your project notes)
- lastSyncedAt: ??? (when did we fetch from GitHub?)

Design Decisions:
- How often to sync with GitHub? (manual? automatic? cron job?)
- What if repo is deleted on GitHub?
- Should milestones be separate from GitHub issues?
- updatedAt (when modified)
```

---

#### 📝 Your Assignment: Think About Project Schema

Before we code anything, **design the Project schema** on paper:

**Questions to answer:**
1. What identifies a project? (name? description?)
2. Should project names be unique?
3. How do we store milestones? (embedded array?)
4. What fields should a milestone have?
5. Should we track when project was last worked on?
6. Should we calculate health in backend or frontend? (we decided frontend!)

**Write your answers here:**
```
YOUR DESIGN:
Project Schema:
- name: ??? (required? unique? type?)
- description: ???
- milestones: ??? (array? embedded? what fields?)
- lastWorkedAt: ???
- health: ??? (stored or computed?)
```

---

### Day 3: Understanding Embedded vs Referenced Documents

#### 📖 Core Concept: Data Relationships in MongoDB

**In SQL (Relational):**
```sql
-- Projects table
projects:
  id | name           | description
  1  | Portfolio      | My website
  2  | E-commerce     | Online store

-- Milestones table (separate)
milestones:
  id | project_id | title        | completed
  1  | 1          | Design       | true
  2  | 1          | Development  | false
  3  | 2          | Setup        | true

-- Must JOIN to get project with milestones
SELECT * FROM projects 
LEFT JOIN milestones ON projects.id = milestones.project_id
```

**In MongoDB (Document-based):**

**Option 1: Embedded (Nested)**
```javascript
// Everything in ONE document
{
  _id: ObjectId("1"),
  name: "Portfolio",
  description: "My website",
  milestones: [                    // Array INSIDE the document
    { id: 1, title: "Design", completed: true },
    { id: 2, title: "Development", completed: false }
  ]
}
```

**Option 2: Referenced (Separate)**
```javascript
// Project document
{
  _id: ObjectId("1"),
  name: "Portfolio",
  milestoneIds: [ObjectId("m1"), ObjectId("m2")]  // References
}

// Milestone documents (separate collection)
{
  _id: ObjectId("m1"),
  projectId: ObjectId("1"),
  title: "Design",
  completed: true
}
```

---

#### 🤔 When to Embed vs Reference?

**Use EMBEDDED when:**
✅ Child data is ALWAYS accessed with parent  
✅ Child data is small (won't grow infinitely)  
✅ Child data doesn't need independent queries  
✅ Strong ownership (milestones belong to ONE project)

**Use REFERENCED when:**
✅ Child data needs independent queries  
✅ Child data can belong to multiple parents  
✅ Child data is large/frequently updated  
✅ Loose coupling (comments can exist without posts)

**For Your Project:**

**Milestones** → EMBED
- Always displayed with project ✅
- Small data (title + boolean) ✅
- Doesn't need separate queries ✅
- Belongs to ONE project ✅

**Career Preparation Steps** → EMBED
- Always displayed with event ✅
- Small data ✅
- Specific to that event ✅

**Projects, DSA, Career** → SEPARATE COLLECTIONS
- Need independent queries ✅
- Different data shapes ✅
- No parent-child relationship ✅

---

#### ⚙️ How Embedding Works in Mongoose

```javascript
// Define the child schema first
const MilestoneSchema = new Schema({
  id: Number,              // Custom ID (not MongoDB _id)
  title: String,
  completed: { type: Boolean, default: false }
})for External Data Sources

#### 📖 Core Concept: API Design for Master + Progress Pattern

**REST = Representational State Transfer**

**Simple translation:** "Use URLs to represent things, use HTTP verbs to do actions"

**Traditional REST (single resource):**
```
GET    /users          ✅ Get all users
POST   /users          ✅ Create a user
GET    /users/5        ✅ Get user #5
PATCH  /users/5        ✅ Update user #5
DELETE /users/5        ✅ Delete user #5
```

**NEW: REST for Separated Concerns (Master + Progress):**

**Master Problems (Read-Only for Users):**
```
GET    /api/dsa/problems                    # Browse problem catalog
GET    /api/dsa/problems?sheet=striver      # Filter by sheet
GET    /api/dsa/problems?difficulty=Easy    # Filter by difficulty
GET    /api/dsa/problems/:id                # Get problem details

Note: No POST/PATCH/DELETE for users (only admins can manage master data)
```

**User Progress (User-Writable):**
```
GET    /api/dsa/my-progress                 # Your progress on all problems
GET    /api/dsa/my-progress?status=solved   # Your solved problems
POST   /api/dsa/my-progress                 # Start tracking a problem
PATCH  /api/dsa/my-progress/:problemId      # Update your progress
DELETE /api/dsa/my-progress/:problemId      # Stop tracking problem

Note: Each user only sees/modifies THEIR progress
```

**Combined View (Convenience Endpoint):**
```
GET    /api/dsa/problems-with-progress      # Problems + YOUR progress merged
Response: [
  {
    problem: { id, title, difficulty, topic },
    yourProgress: { status: "solved", lastSolvedAt: "..." }
  }
]: true },
    { id: 2, title: "Code", completed: false }
  ]
}
```

**Querying embedded data:**
```javascript
// Find project by milestone title
Project.findOne({ "milestones.title": "Design" })

// Update specific milestone
Project.updateOne(
  { _id: projectId, "milestones.id": 1 },
  { $set: (Master Problems + User Progress):**
```
Base path: /api/dsa

# Master Problems (Browse catalog)
GET    /api/dsa/problems                     # All problems from sheets
GET    /api/dsa/problems?sheet=striver       # Filter by sheet
GET    /api/dsa/problems?difficulty=Easy     # Filter by difficulty
GET    /api/dsa/problems?topic=Arrays        # Filter by topic
GET    /api/dsa/problems/:id                 # Single problem details

# User Progress (Track YOUR journey)
GET    /api/dsa/progress                     # Your progress overview
GET    /api/dsa/progress/:problemId          # Your progress on specific problem
POST   /api/dsa/progress                     # Start tracking a problem
PATCH  /api/dsa/progress/:problemId          # Update your status
DELETE /api/dsa/progress/:problemId          # Remove from tracking

# Combined Views (Convenience)
GET    /api/dsa/problems-with-progress       # Problems + your progress merged
GET    /api/dsa/stats                        # Your statistics

# Admin Only (Seed data)
POST   /api/dsa/import-sheet                 # Import Striver/Blind75 sheet
``` (GitHub Integration):**
```
Base path: /api/projects

# GitHub Sync
POST   /api/projects/sync-github             # Fetch repos from GitHub
POST   /api/projects/sync-github/:repoName   # Sync specific repo
DELETE /api/projects/disconnect-github       # Unlink GitHub

# Project Management
GET    /api/projects                          # Your GitHub-synced projects
GET    /api/projects/:id                     # Single project details
PATCH  /api/projects/:id                     # Update custom fields (milestones, notes)
DELETE /api/projects/:id                     # Remove from tracking (not from GitHub!)

# Milestones (Your Custom Tracking)
POST   /api/projects/:id/milestones          # Add milestone
PATCH  /api/projects/:id/milestones/:mid     # Toggle milestone
DELETE /api/projects/:id/milestones/:mid     # Delete milestone

# Stats
GET    /api/projects/stats                   # Your project statistics
```

**Why GitHub sync endpoints?**
- **POST /sync-github**: One-time fetch of all repos
- **Automatic refresh**: Background job updates lastCommitDate
- **Hybrid data**: GitHub metadata + your custom milestones
- **No manual entry**: Projects created from real GitHub dataes): `/users`, `/projects`, `/events`
2. **HTTP verbs are actions**: GET (read), POST (create), PATCH (update), DELETE (remove)
3. **Use plural nouns**: `/users` not `/user`
4. **Nest related resources**: `/projects/5/milestones/3`
5. **Use query params for filters**: `/users?role=admin&status=active`

---

#### 🎨 Designing Your API Routes

**For DSA Problems:**
```
Base path: /api/dsa/problems

GET    /api/dsa/problems              # List all problems (with filters)
GET    /api/dsa/problems?difficulty=Easy  # Filter by difficulty
GET    /api/dsa/problems?status=solved    # Filter by status
GET    /api/dsa/problems?topic=Arrays     # Filter by topic
POST   /api/dsa/problems              # Create new problem
GET    /api/dsa/problems/:id          # Get single problem
PATCH  /api/dsa/problems/:id          # Update problem (change status)
DELETE /api/dsa/problems/:id          # Delete problem
GET    /api/dsa/stats                 # Get DSA statistics
```

**Why `/api/dsa/problems` not `/api/problems?category=dsa`?**

1. **Clear separation**: Each domain has its own namespace
2. **Easier auth**: Can secure `/api/dsa/*` separately
3. **Better organization**: Controllers map directly to routes
4. **Future-proof**: Can add `/api/dsa/topics` later

---

**For Projects:**
```
Base path: /api/projects

GET    /api/projects                  # List all projects
POST   /api/projects                  # Create new project
GET    /api/projects/:id              # Get single project
PATCH  /api/projects/:id              # Update project details
DELETE /api/projects/:id              # Delete project

# Milestone operations (nested resource)
PATCH  /api/projects/:id/milestones/:mid   # Toggle milestone
POST   /api/projects/:id/milestones        # Add new milestone
DELETE /api/projects/:id/milestones/:mid   # Delete milestone
```

**Why nested routes for milestones?**
- Milestones don't exist without a project
- URL shows relationship: "milestone 3 belongs to project 5"
- Clear parent-child hierarchy

---

**For Career Events:**
```
Base path: /api/career/events

GET    /api/career/events                    # List all events
GET    /api/career/events?upcoming=true      # Only future events
POST   /api/career/events                    # Create new event
GET    /api/career/events/:id                # Get single event
PATCH  /api/career/events/:id                # Update event
DELETE /api/career/events/:id                # Delete event

# Preparation steps (nested)
PATCH  /api/career/events/:id/preparation/:pid   # Toggle prep step
POST   /api/career/events/:id/preparation        # Add prep step
DELETE /api/career/events/:id/preparation/:pid   # Delete prep step
```

---

#### 📝 HTTP Status Codes Cheat Sheet

**2xx Success:**
- `200 OK` - Request succeeded (GET, PATCH, DELETE)
- `201 Created` - Resource created (POST)
- `204 No Content` - Success but no response body

**4xx Client Errors:**
- `400 Bad Request` - Invalid data sent
- `401 Unauthorized` - Missing/invalid auth token
- `404 Not Found` - Resource doesn't exist
- `409 Conflict` - Duplicate resource (e.g., unique constraint)

**5xx Server Errors:**
- `500 Internal Server Error` - Something broke in backend
- `503 Service Unavailable` - Server overloaded/maintenance

---

### Day 5: MVC Architecture Deep Dive

#### 📖 Core Concept: Separation of Concerns

**MVC = Model-View-Controller**

In our case:
- **Model** = Data structure (Mongoose schemas)
- **View** = Frontend (React app - separate repo)
- **Controller** = Business logic (route handlers)

**Why separate them?**

**Bad (everything in one file):**
```javascript
// routes/everything.js (1000+ lines)
app.get('/api/problems', async (req, res) => {
  // Validation logic
  if (!req.query.difficulty) return res.status(400).json(...)
  
  // Database schema definition
  const schema = new Schema({ title: String, ... })
  
  // Query logic
  const problems = await db.find(...)
  
  // Response formatting
  res.json({ data: problems, count: problems.length })
})
```

**Good (separation):**
```javascript
// models/DsaProblem.js (Data structure)
const DsaProblemSchema = new Schema({ title: String, ... })

// controllers/dsaController.js (Business logic)
exports.getProblems = async (req, res) => {
  const problems = await DsaProblem.find(req.query)
  res.json(problems)
}

// routes/dsaRoutes.js (HTTP interface)
router.get('/problems', dsaController.getProblems)
```

**Benefits:**
- ✅ Each file has ONE job
- ✅ Easy to test (test controller without routes)
- ✅ Easy to reuse (same controller for GraphQL + REST)
- ✅ Easy to find bugs (model bug? check models/ folder)

---

#### 🏗️ Your Project Structure

```
src/
├── index.js                    # Server entry point
├── config/
│   └── db.js                   # Database connection
├── models/
│   ├── DsaProblem.js          # DSA schema
│   ├── Project.js             # Project schema (with embedded milestones)
│   └── CareerEvent.js         # Career schema (with embedded prep)
├── controllers/
│   ├── dsaController.js       # DSA business logic
│   ├── projectController.js   # Project business logic
│   └── careerController.js    # Career business logic
└── routes/
    ├── dsaRoutes.js           # DSA HTTP endpoints
    ├── projectRoutes.js       # Project HTTP endpoints
    └── careerRoutes.js        # Career HTTP endpoints
```

**Data flow:**
```
HTTP Request
    ↓
routes/dsaRoutes.js (Route matching)
    ↓
controllers/dsaController.js (Business logic)
    ↓
models/DsaProblem.js (Database query)
    ↓
MongoDB (Data storage)
    ↓
Response
```

---

### Day 6-7: Building Your First Model (DSA Problems)

**Before we code, let's plan:**

1. ✅ We designed the schema (Day 2)
2. ✅ We understand embedding (Day 3)
3. ✅ We know the API routes (Day 4)
4. ✅ We understand MVC (Master + Progress Pattern)

**Monday:** Create MasterProblem model + seed data script  
**Tuesday:** Create UserProgress model + linking logic  
**Wednesday:** Build problem browsing controllers (read master data)  
**Thursday:** Build progress tracking controllers (update YOUR data)  
**Friday:** Build combined view endpoints + stats  
**Weekend:** Import Striver SDE Sheet + test with real data
For DSA, we need:
``` (GitHub Integration)

**Monday:** Setup GitHub OAuth + API integration  
**Tuesday:** Create UserProject model (GitHub + custom fields)  
**Wednesday:** Build GitHub sync controller (fetch repos)  
**Thursday:** Build milestone management (on top of GitHub data)  
**Friday:** Build auto-refresh logic (background sync)  
**Weekend:** Test with real GitHub account + ctitle, difficulty, topic, status, notes }
   - Validation: title required, difficulty must be enum
   - Output: created problem

3. getProblem() - Get single problem
   - Input: problem ID from URL
   - Output: single problem or 404

4. updateProblem() - Update problem (usually status)
   - Input: problem ID + fields to update
   - Logic: if status = 'solved', set lastSolvedAt = now
   - Output: updated problem

5. deleteProblem() - Delete problem
   - Input: problem ID
   - Output: success message

6. getStats() - DSA statistics
   - Output: { total, solved, revising, weak }
```

**Write down (on paper):**
- What could go wrong in each function?
- What validations do we need?
- What errors should we handle?

---

## 📚 Phase 2: Implementation (Week 2-4)

### Week 2: DSA Module (First Complete Feature)

**Monday:** Create DsaProblem model  
**Tuesday:** Build getProblems controller  
**Wednesday:** Build create/update controllers  
**Thursday:** Build delete/stats controllers  
**Friday:** Create routes and test everything  
**Weekend:** Connect frontend to API  

### Week 3: Projects Module

**Monday:** Create Project model with embedded milestones  
**Tuesday:** Build project CRUD controllers  
**Wednesday:** Build milestone toggle/add/delete logic  
**Thursday:** Handle lastWorkedAt updates  
**Friday:** Create routes and test  
**Weekend:** Connect frontend  

### Week 4: Career Module

**Monday:** Create CareerEvent model with embedded prep  
**Tuesday:** Build event CRUD controllers  
**Wednesday:** Build preparation step logic  
**Thursday:** Add upcoming events filter  
**Friday:** Create routes and test  
**Weekend:** Connect frontend  

---

## 📚 Phase 3: Polish & Production (Week 5-6)

### Week 5: Quality & Security
- Input validation with express-validator
- Error handling middleware
- Request logging
- CORS configuration
- Environment variables

### Week 6: Testing & Deployment
- Write tests for each controller
- Add database indexes
- Performance optimization
- Deploy to Railway/Render
- Connect production frontend

---

## 🎓 Learning Resources

### Concepts to Master
1. **MongoDB**
   - Documents vs Collections
   - Embedded vs Referenced
   - Queries and filters
   - Aggregation pipelines

2. **Mongoose**
   - Schema definition
   - Validation rules
   - Middleware hooks
   - Virtual properties

3. **Express**
   - Middleware chain
   - Route parameters
   - Query parameters
   - Error handling

4. **REST API**
   - Resource naming
   - HTTP verbs
   - Status codes
   - API design patterns

5. **Architecture**
   - MVC pattern
   - Separation of concerns
   - Controller patterns
   - Service layer (future)

---

## 📝 Your Action Items

**Before Next Session:**

1. **Read & Reflect:**
   - Re-read Days 1-5 above
   - Make notes on concepts that are unclear
   - Write questions

2. **Design Exercise:**
   - Complete the Project schema design (Day 2 assignment)
   - Draw a diagram of the data flow (Day 5 concept)
   - Write down potential edge cases for each API endpoint

3. **Prepare Your Mind:**
   - We'll start coding in next session
   - Have your code editor ready
   - Have MongoDB Compass or Atlas ready
   - Have Postman/Thunder Client installed

---

## ✅ Progress Tracker

- [ ] Day 1: MongoDB Collections (Read & Understood)
- [ ] Day 2: Schema Design (Completed Assignment)
- [ ] Day 3: Embedding (Clear on Concept)
- [ ] Day 4: REST API (Memorized Patterns)
- [ ] Day 5: MVC (Understood Flow)
- [ ] Day 6-7: Planning (Ready to Code)

---

## 🤔 Questions to Ask Yourself

1. Can I explain to someone else why we're using 3 separate collections?
2. Can I design a schema for a new domain (e.g., "study notes")?
3. Can I explain the difference between POST and PATCH?
4. Do I understand why milestones are embedded and not separate?
5. Can I describe the data flow from HTTP request to database?

**If you can answer "YES" to all 5, you're ready to code!**

---

## 💬 Next Session Prep

**We'll start with:**
1. Creating `models/DsaProblem.js`
2. Writing the Mongoose schema together
3. Testing it in MongoDB Compass
4. Understanding each line of code

**What to have ready:**
- MongoDB connection (local or Atlas)
- Code editor open
- Questions from this document
- Your schema design notes

---

**Remember:** We're not rushing. We're building a solid foundation. Understanding > Speed.

Let's make you a backend expert! 🚀

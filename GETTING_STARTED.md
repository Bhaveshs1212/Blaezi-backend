# Getting Started - Step by Step

## Prerequisites
✅ Server running on port 4000  
✅ MongoDB connected  
✅ New packages installed (axios, cheerio, @octokit/rest)

---

## Step 1: Register a User

**Using cURL:**
```bash
curl -X POST http://localhost:4000/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"Test User\",\"email\":\"test@example.com\",\"password\":\"password123\"}"
```

**Using Postman:**
- Method: POST
- URL: `http://localhost:4000/api/auth/register`
- Body (JSON):
```json
{
  "name": "Test User",
  "email": "test@example.com",
  "password": "password123"
}
```

---

## Step 2: Login and Get Token

**Using cURL:**
```bash
curl -X POST http://localhost:4000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"test@example.com\",\"password\":\"password123\"}"
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "name": "Test User",
    "email": "test@example.com"
  }
}
```

**Save the token!** You'll need it for all other requests.

---

## Step 3: Test Striver SDE Sheet

**Using cURL:**
```bash
curl -X GET "http://localhost:4000/api/dsa/problems?source=striver&difficulty=Easy" ^
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected Response:**
```json
{
  "success": true,
  "count": 15,
  "data": [
    {
      "problemNumber": 2,
      "title": "Pascal's Triangle",
      "difficulty": "Easy",
      "topic": "Arrays",
      "platform": "LeetCode",
      "link": "https://leetcode.com/problems/pascals-triangle/",
      "sheet": "Striver SDE Sheet"
    },
    // ... more problems
  ],
  "source": "Striver SDE Sheet"
}
```

---

## Step 4: Test GitHub Integration

### 4a. Fetch GitHub Repos (No Save)

**Using cURL:**
```bash
curl -X GET "http://localhost:4000/api/projects/github/torvalds?minStars=100" ^
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected Response:**
```json
{
  "success": true,
  "count": 5,
  "username": "torvalds",
  "source": "GitHub API",
  "data": [
    {
      "githubId": 2325298,
      "name": "linux",
      "fullName": "torvalds/linux",
      "description": "Linux kernel source tree",
      "url": "https://github.com/torvalds/linux",
      "language": "C",
      "stars": 180000,
      "forks": 53000,
      // ... more fields
    }
  ]
}
```

### 4b. Sync GitHub Repos (Save to Database)

**Using cURL:**
```bash
curl -X POST http://localhost:4000/api/projects/sync ^
  -H "Authorization: Bearer YOUR_TOKEN_HERE" ^
  -H "Content-Type: application/json" ^
  -d "{\"githubUsername\":\"yourusername\",\"filters\":{\"excludeForks\":true,\"minStars\":1}}"
```

**Replace `yourusername` with your actual GitHub username!**

**Expected Response:**
```json
{
  "success": true,
  "message": "Successfully synced 12 projects from GitHub",
  "count": 12,
  "username": "yourusername",
  "data": [
    // Array of synced projects
  ]
}
```

---

## Step 5: View Synced Projects

**Using cURL:**
```bash
curl -X GET http://localhost:4000/api/projects ^
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected Response:**
```json
{
  "success": true,
  "count": 12,
  "data": [
    {
      "_id": "...",
      "userId": "...",
      "name": "my-project",
      "description": "Project description",
      "url": "https://github.com/yourusername/my-project",
      "language": "JavaScript",
      "stars": 5,
      "status": "planning",
      "progress": 0,
      "starred": false
    }
  ]
}
```

---

## All Available Endpoints

### DSA Problems
```
GET /api/dsa/problems?source=striver
GET /api/dsa/problems?source=striver&difficulty=Easy
GET /api/dsa/problems?source=striver&difficulty=Medium
GET /api/dsa/problems?source=striver&difficulty=Hard
GET /api/dsa/problems?source=striver&topic=Arrays
GET /api/dsa/problems?source=striver&topic=Linked List
GET /api/dsa/problems?source=striver&search=Two Sum
```

### GitHub Projects
```
GET /api/projects/github/:username
GET /api/projects/github/:username?language=JavaScript
GET /api/projects/github/:username?language=Python
GET /api/projects/github/:username?minStars=10
GET /api/projects/github/:username?excludeForks=true
POST /api/projects/sync
GET /api/projects
GET /api/projects/:id
GET /api/projects/starred
GET /api/projects/stats
PATCH /api/projects/:id
DELETE /api/projects/:id
```

---

## Postman Collection Example

You can create a Postman collection with these:

1. **Register** - POST `/api/auth/register`
2. **Login** - POST `/api/auth/login`
3. **Get Striver Problems** - GET `/api/dsa/problems?source=striver`
4. **Get Easy Problems** - GET `/api/dsa/problems?source=striver&difficulty=Easy`
5. **Fetch GitHub Repos** - GET `/api/projects/github/torvalds`
6. **Sync GitHub Projects** - POST `/api/projects/sync`
7. **Get My Projects** - GET `/api/projects`

---

## Tips

1. **Save your token** after login - you'll need it for every request
2. **Use your own GitHub username** when syncing projects
3. **Start with Easy problems** from Striver sheet
4. **Filter by language** when fetching GitHub repos
5. **Check rate limits** - GitHub allows 60 requests/hour without token

---

## Troubleshooting

**Error: "Invalid token"**
- Login again to get a fresh token
- Make sure you're including "Bearer " before the token

**Error: "GitHub user not found"**
- Check the username spelling
- Make sure the GitHub user exists

**Error: "Rate limit exceeded"**
- Wait an hour, or add GITHUB_TOKEN to .env
- Get token from: https://github.com/settings/tokens

**No problems returned:**
- Make sure you're using `source=striver` in the query
- Check if you have authentication header

---

## Example Frontend Integration

```javascript
// Store token after login
localStorage.setItem('token', token);

// Fetch Striver problems
async function getStriverProblems() {
  const token = localStorage.getItem('token');
  const response = await fetch(
    'http://localhost:4000/api/dsa/problems?source=striver&difficulty=Medium',
    {
      headers: { 'Authorization': `Bearer ${token}` }
    }
  );
  const data = await response.json();
  return data.data; // Array of problems
}

// Fetch GitHub repos
async function getGitHubRepos(username) {
  const token = localStorage.getItem('token');
  const response = await fetch(
    `http://localhost:4000/api/projects/github/${username}?excludeForks=true`,
    {
      headers: { 'Authorization': `Bearer ${token}` }
    }
  );
  const data = await response.json();
  return data.data; // Array of repos
}

// Sync projects
async function syncGitHubProjects(username) {
  const token = localStorage.getItem('token');
  const response = await fetch(
    'http://localhost:4000/api/projects/sync',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        githubUsername: username,
        filters: { excludeForks: true }
      })
    }
  );
  const data = await response.json();
  return data;
}
```

---

**🎉 You're all set! Start building your DSA tracker and project portfolio!**

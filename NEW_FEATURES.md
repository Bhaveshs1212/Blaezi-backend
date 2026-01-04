# New Features Documentation

## Overview
Two major features have been implemented:
1. **DSA Problems from Striver SDE Sheet** - Fetch problems directly from the curated Striver SDE Sheet
2. **GitHub Project Integration** - Fetch repositories using GitHub username

---

## 1. DSA Problems - Striver SDE Sheet

### Endpoint: GET `/api/dsa/problems`

Fetch DSA problems from the Striver SDE Sheet (150 curated problems).

#### Query Parameters:
- `source=striver` - **Required** to fetch from Striver sheet
- `difficulty` - Filter by difficulty (Easy/Medium/Hard)
- `topic` - Filter by topic (Arrays, Linked List, etc.)
- `search` - Search by problem title

#### Examples:

**Get all problems from Striver SDE Sheet:**
```bash
GET /api/dsa/problems?source=striver
```

**Get Medium difficulty problems:**
```bash
GET /api/dsa/problems?source=striver&difficulty=Medium
```

**Get Array problems:**
```bash
GET /api/dsa/problems?source=striver&topic=Arrays
```

**Search for specific problem:**
```bash
GET /api/dsa/problems?source=striver&search=Two Sum
```

#### Response Example:
```json
{
  "success": true,
  "count": 150,
  "data": [
    {
      "problemNumber": 1,
      "title": "Set Matrix Zeroes",
      "difficulty": "Medium",
      "topic": "Arrays",
      "platform": "LeetCode",
      "link": "https://leetcode.com/problems/set-matrix-zeroes/",
      "sheet": "Striver SDE Sheet"
    },
    // ... more problems
  ],
  "source": "Striver SDE Sheet"
}
```

---

## 2. GitHub Project Integration

### 2.1 Fetch Projects from GitHub (Live Data)

#### Endpoint: GET `/api/projects/github/:username`

Fetch repositories directly from GitHub API without saving to database.

#### Path Parameters:
- `username` - GitHub username

#### Query Parameters:
- `language` - Filter by programming language (JavaScript, Python, etc.)
- `minStars` - Minimum number of stars
- `excludeForks` - Set to `true` to exclude forked repos
- `onlyPublic` - Set to `true` to show only public repos

#### Examples:

**Get all repos for a user:**
```bash
GET /api/projects/github/torvalds
```

**Get only JavaScript repos:**
```bash
GET /api/projects/github/yourusername?language=JavaScript
```

**Get repos with at least 10 stars:**
```bash
GET /api/projects/github/yourusername?minStars=10
```

**Get non-forked repos only:**
```bash
GET /api/projects/github/yourusername?excludeForks=true
```

**Combine filters:**
```bash
GET /api/projects/github/yourusername?language=Python&minStars=5&excludeForks=true
```

#### Response Example:
```json
{
  "success": true,
  "count": 25,
  "username": "yourusername",
  "source": "GitHub API",
  "data": [
    {
      "githubId": 123456,
      "name": "awesome-project",
      "fullName": "yourusername/awesome-project",
      "description": "An awesome project",
      "url": "https://github.com/yourusername/awesome-project",
      "language": "JavaScript",
      "stars": 42,
      "forks": 8,
      "watchers": 5,
      "isPrivate": false,
      "isFork": false,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-12-01T00:00:00Z",
      "topics": ["react", "nodejs"],
      "homepage": "https://example.com"
    },
    // ... more repos
  ]
}
```

---

### 2.2 Sync Projects to Database

#### Endpoint: POST `/api/projects/sync`

Fetch repositories from GitHub and save them to your database for tracking.

#### Request Body:
```json
{
  "githubUsername": "yourusername",
  "filters": {
    "language": "JavaScript",
    "minStars": 5,
    "excludeForks": true,
    "onlyPublic": true
  }
}
```

#### Examples:

**Sync all repos:**
```bash
POST /api/projects/sync
{
  "githubUsername": "yourusername"
}
```

**Sync with filters:**
```bash
POST /api/projects/sync
{
  "githubUsername": "yourusername",
  "filters": {
    "language": "Python",
    "minStars": 10,
    "excludeForks": true
  }
}
```

#### Response Example:
```json
{
  "success": true,
  "message": "Successfully synced 15 projects from GitHub",
  "count": 15,
  "username": "yourusername",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "userId": "507f191e810c19729de860ea",
      "githubId": 123456,
      "name": "my-project",
      "description": "My awesome project",
      "url": "https://github.com/yourusername/my-project",
      "language": "Python",
      "stars": 42,
      "status": "planning",
      "progress": 0,
      "starred": false,
      "createdAt": "2024-01-01T00:00:00Z"
    },
    // ... more projects
  ]
}
```

---

## 3. How to Use

### Using with cURL:

**Login first:**
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

Save the token from the response.

**Fetch Striver problems:**
```bash
curl -X GET "http://localhost:4000/api/dsa/problems?source=striver" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Fetch GitHub repos:**
```bash
curl -X GET "http://localhost:4000/api/projects/github/torvalds" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Sync GitHub repos:**
```bash
curl -X POST http://localhost:4000/api/projects/sync \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"githubUsername":"yourusername","filters":{"excludeForks":true}}'
```

---

### Using with Postman:

1. **Create a new request**
2. **Set the method** (GET/POST)
3. **Enter the URL**: `http://localhost:4000/api/...`
4. **Add Authorization header**:
   - Key: `Authorization`
   - Value: `Bearer YOUR_TOKEN_HERE`
5. **For POST requests**, add JSON body in the Body tab (select raw → JSON)
6. **Send the request**

---

### Using with JavaScript/Fetch:

```javascript
// Login first
const loginResponse = await fetch('http://localhost:4000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'test@example.com',
    password: 'password123'
  })
});
const { token } = await loginResponse.json();

// Fetch Striver problems
const dsaResponse = await fetch('http://localhost:4000/api/dsa/problems?source=striver', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const problems = await dsaResponse.json();
console.log(problems);

// Fetch GitHub repos
const githubResponse = await fetch('http://localhost:4000/api/projects/github/yourusername', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const repos = await githubResponse.json();
console.log(repos);

// Sync GitHub repos
const syncResponse = await fetch('http://localhost:4000/api/projects/sync', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    githubUsername: 'yourusername',
    filters: { excludeForks: true }
  })
});
const synced = await syncResponse.json();
console.log(synced);
```

---

## 4. Important Notes

### DSA Problems:
- The Striver SDE Sheet contains **150 curated problems**
- Problems include: Arrays, Linked Lists, Binary Trees, Dynamic Programming, Graphs, etc.
- Each problem has: title, difficulty, topic, platform (LeetCode/GFG), and link

### GitHub Integration:
- **No GitHub token required** for public repos (but rate-limited to 60 requests/hour)
- For higher rate limits, add a GitHub Personal Access Token to your `.env` file:
  ```
  GITHUB_TOKEN=your_github_token_here
  ```
- You can get a token from: https://github.com/settings/tokens

### Rate Limits:
- GitHub API: 60 requests/hour (unauthenticated), 5000/hour (authenticated)
- If you exceed the limit, you'll get a 403 error

---

## 5. Testing

Run the test file to verify everything works:

```bash
node src/test/testNewFeatures.js
```

Make sure you have a test user registered:
- Email: test@example.com
- Password: password123

Or modify the test file with your credentials.

---

## 6. Next Steps

### For DSA Problems:
- Track your progress on each problem
- Mark problems as solved/weak/revising
- Add notes and your approach
- Star important problems

### For GitHub Projects:
- Sync your repositories
- Track project status (planning/in-progress/completed)
- Add custom notes and tech stack
- Monitor progress percentage
- Star your favorite projects

---

## Support

For issues or questions:
1. Check the console logs
2. Verify MongoDB is running
3. Check that you're authenticated (valid token)
4. Ensure the server is running on port 4000
5. Review the error messages in the response

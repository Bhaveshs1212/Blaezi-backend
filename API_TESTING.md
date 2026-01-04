# DSA API Testing Guide

## Base URL
```
http://localhost:5000/api/dsa
```

## Available Endpoints

### 1. Get All Problems
```http
GET /api/dsa/problems
```

**With Filters:**
```http
GET /api/dsa/problems?difficulty=Easy
GET /api/dsa/problems?topic=Array
GET /api/dsa/problems?sheet=Striver SDE Sheet
GET /api/dsa/problems?search=two sum
```

---

### 2. Get Single Problem
```http
GET /api/dsa/problems/:id
```

**Example:**
```http
GET /api/dsa/problems/507f1f77bcf86cd799439011
```

---

### 3. Get User Progress
```http
GET /api/dsa/progress?userId=YOUR_USER_ID
```

**With Filters:**
```http
GET /api/dsa/progress?userId=123&status=solved
GET /api/dsa/progress?userId=123&starred=true
```

---

### 4. Create/Update Progress
```http
POST /api/dsa/progress
Content-Type: application/json

{
  "userId": "695946e3c13c8152284586ce",
  "problemId": "507f1f77bcf86cd799439011",
  "status": "solved",
  "notes": "Used hash map for O(n) solution",
  "approach": "Hash Table",
  "starred": true
}
```

---

### 5. Update Progress
```http
PATCH /api/dsa/progress/:problemId
Content-Type: application/json

{
  "userId": "695946e3c13c8152284586ce",
  "status": "revising",
  "notes": "Need to practice edge cases"
}
```

---

### 6. Get User Stats
```http
GET /api/dsa/stats?userId=695946e3c13c8152284586ce
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

### 7. Get Stale Problems
```http
GET /api/dsa/stale?userId=695946e3c13c8152284586ce
```

Returns problems that haven't been practiced in > 7 days.

---

### 8. Delete Progress
```http
DELETE /api/dsa/progress/:problemId
Content-Type: application/json

{
  "userId": "695946e3c13c8152284586ce"
}
```

---

## Testing with cURL (PowerShell)

### Get all problems:
```powershell
curl http://localhost:5000/api/dsa/problems
```

### Create progress:
```powershell
curl -X POST http://localhost:5000/api/dsa/progress `
  -H "Content-Type: application/json" `
  -d '{\"userId\":\"123\",\"problemId\":\"abc\",\"status\":\"solved\"}'
```

---

## Testing with Thunder Client / Postman

1. Install Thunder Client extension in VS Code
2. Create new request
3. Use the endpoints above
4. Send requests!

---

## Note: userId is temporary

Currently using `userId` in query params/body.

After authentication is set up:
- `userId` will come from `req.user` (JWT token)
- No need to pass it manually
- Protected routes with middleware

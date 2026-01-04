# 🔐 Authentication Complete Guide

## ✅ What's Built

**User Model:**
- Email/password authentication
- Password hashing with bcrypt
- JWT token generation
- Profile management

**Auth Routes:**
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Get JWT token
- `GET /api/auth/me` - Get profile (protected)
- `PATCH /api/auth/profile` - Update profile (protected)

**Middleware:**
- JWT verification
- User attachment to req.user
- Token expiration handling

---

## 🧪 Testing Authentication

### 1. Register a New User

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"John Doe\",\"email\":\"john@example.com\",\"password\":\"password123\"}"
```

**PowerShell:**
```powershell
curl -X POST http://localhost:5000/api/auth/register `
  -H "Content-Type: application/json" `
  -d '{\"name\":\"John Doe\",\"email\":\"john@example.com\",\"password\":\"password123\"}'
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "isActive": true
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 2. Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"john@example.com\",\"password\":\"password123\"}"
```

**Save the token** from the response!

### 3. Get Profile (Protected Route)

```bash
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**PowerShell:**
```powershell
curl http://localhost:5000/api/auth/me `
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 4. Update Profile

```bash
curl -X PATCH http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"John Updated\",\"githubUsername\":\"johndoe\"}"
```

---

## 🔒 Using Protected Routes

### How to Add Authentication to Your Routes

**Before (temporary userId):**
```javascript
router.get('/dsa/progress', dsaController.getUserProgress);

// Controller had:
const userId = req.query.userId || req.user?.id;
```

**After (with auth middleware):**
```javascript
const auth = require('../middleware/auth');

router.get('/dsa/progress', auth, dsaController.getUserProgress);

// Controller now has:
const userId = req.user.id;  // Guaranteed to exist
```

### Example: Protecting DSA Routes

```javascript
// src/routes/dsaRoutes.js
const auth = require('../middleware/auth');

// Protected routes
router.get('/progress', auth, dsaController.getUserProgress);
router.post('/progress', auth, dsaController.createOrUpdateProgress);
router.get('/stats', auth, dsaController.getUserStats);
```

### Updating Controller to Use req.user

```javascript
// Before
const userId = req.query.userId || req.user?.id;

// After
const userId = req.user.id;  // From auth middleware
```

---

## 🎯 Complete Authentication Flow

### 1. Registration Flow
```
User → POST /api/auth/register
     → Password hashed with bcrypt
     → User saved to database
     → JWT token generated
     → Token + User data returned
```

### 2. Login Flow
```
User → POST /api/auth/login
     → Find user by email
     → Compare password with bcrypt
     → JWT token generated
     → Token + User data returned
```

### 3. Protected Route Flow
```
User → GET /api/dsa/progress
     → Authorization header checked
     → JWT token extracted & verified
     → User loaded from database
     → req.user set
     → Controller executes with req.user.id
```

---

## 🔑 How JWT Works

### Token Structure
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.      // Header
eyJpZCI6IjUwN2YxZjc3YmNmODZjZDc5OTQzOTAxMSI.  // Payload (user ID)
TJVA95OrM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ      // Signature
```

### Token Payload
```json
{
  "id": "507f1f77bcf86cd799439011",
  "iat": 1704326400,  // Issued at
  "exp": 1706918400   // Expires (30 days)
}
```

### Security Features
- ✅ Signed with secret key (JWT_SECRET)
- ✅ Expires after 30 days
- ✅ Cannot be forged without secret
- ✅ Stateless (no server session needed)

---

## 🔐 Password Security

### Hashing Process
```javascript
// Plain password: "password123"
const salt = await bcrypt.genSalt(10);
// Salt: "$2b$10$abcd1234..."

const hash = await bcrypt.hash("password123", salt);
// Hash: "$2b$10$abcd1234...XYZ" (60 characters)
```

### Verification
```javascript
// User enters: "password123"
const isMatch = await bcrypt.compare("password123", storedHash);
// Returns: true if match, false if no match
```

### Security Benefits
- ✅ Passwords never stored in plain text
- ✅ Salt makes rainbow tables useless
- ✅ Slow hashing prevents brute force
- ✅ Same password = different hash (random salt)

---

## 🛠️ Environment Variables

Add to `.env`:
```env
JWT_SECRET=your-secret-key-change-in-production
PORT=5000
MONGO_URI=mongodb://...
```

**Important:** Change JWT_SECRET in production!

---

## 📋 Testing with Thunder Client

1. **Register User:**
   - Method: POST
   - URL: `http://localhost:5000/api/auth/register`
   - Body (JSON):
     ```json
     {
       "name": "Test User",
       "email": "test@example.com",
       "password": "password123"
     }
     ```

2. **Login:**
   - Method: POST
   - URL: `http://localhost:5000/api/auth/login`
   - Body (JSON):
     ```json
     {
       "email": "test@example.com",
       "password": "password123"
     }
     ```
   - **Copy the token from response!**

3. **Get Profile:**
   - Method: GET
   - URL: `http://localhost:5000/api/auth/me`
   - Headers:
     - `Authorization: Bearer YOUR_TOKEN_HERE`

---

## ❌ Error Handling

### Common Errors

**401 Unauthorized:**
```json
{
  "success": false,
  "message": "No token provided, authorization denied"
}
```

**Invalid Token:**
```json
{
  "success": false,
  "message": "Invalid token"
}
```

**Token Expired:**
```json
{
  "success": false,
  "message": "Token expired"
}
```

**Duplicate Email:**
```json
{
  "success": false,
  "message": "Email already registered"
}
```

---

## 🚀 Next Steps

### Option 1: Protect All Routes
Update routes to require authentication:
```javascript
const auth = require('../middleware/auth');

router.get('/dsa/progress', auth, controller.getUserProgress);
router.get('/projects', auth, controller.getUserProjects);
router.get('/career', auth, controller.getAllEvents);
```

### Option 2: Mixed (Public + Protected)
```javascript
// Public
router.get('/dsa/problems', controller.getAllProblems);

// Protected
router.get('/dsa/progress', auth, controller.getUserProgress);
```

### Option 3: GitHub OAuth
Add GitHub login for project syncing:
- OAuth flow
- Get GitHub token
- Fetch repos
- Sync to database

---

## 🧪 Run Tests

```bash
npm run test:auth
```

All tests should pass! ✅

---

## 📚 Recommendation

**For your app, I recommend:**

1. **Protect these routes:**
   - All `/api/dsa/progress/*` (user-specific)
   - All `/api/projects/*` (user-specific)
   - All `/api/career/*` (user-specific)

2. **Keep these public:**
   - `GET /api/dsa/problems` (browsing problems)

3. **Frontend Integration:**
   ```javascript
   // Store token in localStorage
   localStorage.setItem('token', response.data.token);
   
   // Add to all API requests
   headers: {
     'Authorization': `Bearer ${localStorage.getItem('token')}`
   }
   ```

---

**Authentication is ready to use! 🎉**

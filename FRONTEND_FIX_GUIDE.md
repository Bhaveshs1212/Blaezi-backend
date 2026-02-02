# Frontend GitHub Username Integration Fix

## Issue
Getting 404 NOT_FOUND error when entering GitHub username in the frontend.

## Root Cause
The frontend is likely calling the wrong endpoint or using incorrect HTTP method/headers.

## Solution

### 1. Update GitHub Username Endpoint

The correct endpoint to update user profile with GitHub username is:

```javascript
// Update user profile with GitHub username
const updateGitHubUsername = async (githubUsername) => {
  try {
    const token = localStorage.getItem('token'); // or wherever you store the token
    
    const response = await fetch('http://localhost:4000/api/auth/profile', {
      method: 'PATCH', // or 'PUT' - both are supported now
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` // ⚠️ CRITICAL: Must include Bearer token
      },
      body: JSON.stringify({
        githubUsername: githubUsername
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update profile');
    }
    
    const data = await response.json();
    console.log('✅ Profile updated:', data);
    return data;
    
  } catch (error) {
    console.error('❌ Error updating profile:', error);
    throw error;
  }
};
```

### 2. Sync Projects from GitHub

After updating the username, sync projects:

```javascript
const syncGitHubProjects = async (githubUsername) => {
  try {
    const token = localStorage.getItem('token');
    
    const response = await fetch('http://localhost:4000/api/projects/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        githubUsername: githubUsername,
        filters: {
          excludeForks: true, // Optional
          minStars: 0 // Optional
        }
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to sync projects');
    }
    
    const data = await response.json();
    console.log('✅ Projects synced:', data);
    return data;
    
  } catch (error) {
    console.error('❌ Error syncing projects:', error);
    throw error;
  }
};
```

### 3. Combined Function

Here's a complete function that updates the profile and syncs projects:

```javascript
const handleGitHubUsername = async (githubUsername) => {
  try {
    // Step 1: Update profile
    console.log('Updating profile...');
    const profileResult = await updateGitHubUsername(githubUsername);
    
    // Step 2: Sync projects
    console.log('Syncing projects...');
    const syncResult = await syncGitHubProjects(githubUsername);
    
    return {
      success: true,
      profile: profileResult,
      projects: syncResult
    };
    
  } catch (error) {
    console.error('Error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};
```

### 4. Using Axios (if you prefer)

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:4000/api'
});

// Add token to all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Update GitHub username
const updateGitHubUsername = async (githubUsername) => {
  const response = await api.patch('/auth/profile', { githubUsername });
  return response.data;
};

// Sync projects
const syncGitHubProjects = async (githubUsername) => {
  const response = await api.post('/projects/sync', { githubUsername });
  return response.data;
};
```

## Common Errors & Solutions

### ❌ 404 NOT_FOUND
**Cause**: Wrong endpoint URL
**Fix**: Use `/api/auth/profile` (not `/api/users/profile` or other variants)

### ❌ 401 Unauthorized
**Cause**: Missing or invalid token
**Fix**: Make sure to include `Authorization: Bearer ${token}` in headers

### ❌ 400 Bad Request
**Cause**: Missing githubUsername in request body
**Fix**: Send `{ githubUsername: "your-username" }` in body

### ❌ CORS Error
**Cause**: Backend not configured for your frontend origin
**Fix**: Already fixed - backend now accepts all origins in development

## Testing

Test the endpoints using this curl command:

```bash
# 1. Login first
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"bhavesh1234@gmail.com","password":"your_password"}'

# 2. Update profile (replace TOKEN with actual token from step 1)
curl -X PATCH http://localhost:4000/api/auth/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"githubUsername":"bhaveshs1212"}'

# 3. Sync projects
curl -X POST http://localhost:4000/api/projects/sync \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"githubUsername":"bhaveshs1212"}'
```

## Available Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user (requires auth)
- `PATCH /api/auth/profile` - Update profile (requires auth)
- `PUT /api/auth/profile` - Update profile (requires auth) - alternative

### Projects
- `GET /api/projects` - Get user's projects (requires auth)
- `POST /api/projects/sync` - Sync from GitHub (requires auth)
- `GET /api/projects/github/:username` - Fetch live data from GitHub (requires auth)
- `GET /api/projects/:id` - Get single project (requires auth)

## Backend Changes Made

✅ Added request logging to track all incoming requests
✅ Added 404 handler to catch undefined routes
✅ Added PUT method support for `/api/auth/profile` endpoint
✅ Enhanced CORS configuration for better compatibility
✅ Server now logs all requests with method, URL, and body

## Next Steps

1. **Check your frontend code** - Make sure you're using the correct endpoint and including the Authorization header
2. **Check browser console** - Look for the actual URL being called and any error messages
3. **Check backend logs** - The server now logs all requests, so you'll see exactly what endpoint is being hit
4. **Test with curl or Postman** - Verify the backend works correctly before debugging frontend

## Server Status
- ✅ MongoDB Atlas connected
- ✅ Server running on port 4000
- ✅ All routes configured correctly
- ✅ Request logging enabled

Now restart your frontend and try again. Check the backend terminal to see what request is being made!

/**
 * Quick test script for GitHub sync
 * Run: node testGitHubSync.js
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:4000';

async function testSync() {
  console.log('🧪 Testing GitHub Sync\n');
  
  try {
    let token;
    
    // Step 1: Try to login, register if fails
    console.log('1️⃣ Logging in...');
    try {
      const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
        email: 'test@example.com',
        password: 'password123'
      });
      token = loginResponse.data.token;
      console.log('✅ Login successful\n');
    } catch (loginError) {
      if (loginError.response && loginError.response.status === 401) {
        console.log('⚠️  User not found, registering...');
        const registerResponse = await axios.post(`${BASE_URL}/api/auth/register`, {
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123'
        });
        token = registerResponse.data.token;
        console.log('✅ Registration successful\n');
      } else {
        throw loginError;
      }
    }
    
    // Step 2: Test GitHub API directly (no auth needed)
    console.log('2️⃣ Testing GitHub API (no auth)...');
    const testUsername = 'torvalds'; // Use a known GitHub user
    const testResponse = await axios.get(`${BASE_URL}/api/projects/test-github/${testUsername}`);
    console.log(`✅ Found ${testResponse.data.count} repos for ${testUsername}\n`);
    
    // Step 3: Sync repositories
    console.log('3️⃣ Syncing GitHub repos...');
    const syncResponse = await axios.post(
      `${BASE_URL}/api/projects/sync`,
      {
        githubUsername: testUsername,
        filters: {
          minStars: 1000 // Only repos with 1000+ stars
        }
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ Sync Response:');
    console.log(JSON.stringify(syncResponse.data, null, 2));
    
  } catch (error) {
    console.error('❌ Error:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Message:', error.message);
    }
  }
}

// Run the test
testSync();

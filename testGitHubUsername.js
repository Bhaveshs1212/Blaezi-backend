/**
 * Test script to debug GitHub username sync issue
 * 
 * This will test:
 * 1. Update user profile with GitHub username
 * 2. Sync projects from GitHub
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:4000';

// Test data - replace with actual values
const TEST_EMAIL = 'bhavesh1234@gmail.com';
const TEST_PASSWORD = 'your_password_here';
const GITHUB_USERNAME = 'bhaveshs1212';  // From the screenshot

async function runTests() {
  console.log('🧪 Testing GitHub Username Integration\n');
  
  try {
    // Step 1: Login to get token
    console.log('1️⃣ Logging in...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    });
    
    const token = loginResponse.data.token;
    const userId = loginResponse.data.user.id;
    console.log('✅ Login successful');
    console.log('   User ID:', userId);
    console.log('   Current GitHub username:', loginResponse.data.user.githubUsername || '(empty)');
    console.log();
    
    // Step 2: Update profile with GitHub username
    console.log('2️⃣ Updating profile with GitHub username...');
    try {
      const updateResponse = await axios.patch(`${BASE_URL}/api/auth/profile`, {
        githubUsername: GITHUB_USERNAME
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('✅ Profile updated successfully');
      console.log('   GitHub username:', updateResponse.data.user.githubUsername);
      console.log();
    } catch (error) {
      console.log('❌ Profile update failed');
      console.log('   Status:', error.response?.status);
      console.log('   Message:', error.response?.data?.message || error.message);
      console.log('   Error:', error.response?.data);
      console.log();
    }
    
    // Step 3: Sync projects from GitHub
    console.log('3️⃣ Syncing projects from GitHub...');
    try {
      const syncResponse = await axios.post(`${BASE_URL}/api/projects/sync`, {
        githubUsername: GITHUB_USERNAME
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('✅ Projects synced successfully');
      console.log('   Projects found:', syncResponse.data.count || 0);
      console.log('   First few projects:', syncResponse.data.data?.slice(0, 3).map(p => p.name) || []);
      console.log();
    } catch (error) {
      console.log('❌ Project sync failed');
      console.log('   Status:', error.response?.status);
      console.log('   Message:', error.response?.data?.message || error.message);
      console.log('   Error:', error.response?.data);
      console.log();
    }
    
    // Step 4: Get user info again
    console.log('4️⃣ Getting updated user info...');
    try {
      const meResponse = await axios.get(`${BASE_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('✅ User info retrieved');
      console.log('   Name:', meResponse.data.user.name);
      console.log('   Email:', meResponse.data.user.email);
      console.log('   GitHub username:', meResponse.data.user.githubUsername);
      console.log();
    } catch (error) {
      console.log('❌ Get user info failed');
      console.log('   Status:', error.response?.status);
      console.log('   Message:', error.response?.data?.message || error.message);
      console.log();
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('   Response:', error.response.data);
    }
  }
}

// Run the tests
runTests();

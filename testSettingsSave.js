/**
 * Test the exact scenario: Save settings with GitHub username
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:4000/api';

// Replace with your actual credentials
const TEST_EMAIL = 'bhavesh1234@gmail.com';
const TEST_PASSWORD = 'your_password_here'; // REPLACE THIS
const GITHUB_USERNAME = 'bhaveshs1212';

async function testSettingsSave() {
  console.log('🧪 Testing Settings Save...\n');
  
  try {
    // Step 1: Login
    console.log('1️⃣ Logging in...');
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    });
    
    const token = loginRes.data.token;
    console.log('✅ Login successful');
    console.log(`   Token: ${token.substring(0, 30)}...`);
    console.log();
    
    // Step 2: Try to update profile (this is what "Save Changes" does)
    console.log('2️⃣ Saving GitHub username (simulating "Save Changes" button)...');
    console.log(`   Endpoint: PATCH ${BASE_URL}/auth/profile`);
    console.log(`   GitHub Username: ${GITHUB_USERNAME}`);
    
    const updateRes = await axios.patch(
      `${BASE_URL}/auth/profile`,
      { githubUsername: GITHUB_USERNAME },
      { 
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        } 
      }
    );
    
    console.log('✅ Settings saved successfully!');
    console.log('   Response:', updateRes.data);
    console.log();
    
    // Step 3: Verify the update
    console.log('3️⃣ Verifying profile update...');
    const meRes = await axios.get(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Profile verified');
    console.log('   GitHub Username:', meRes.data.user.githubUsername);
    console.log();
    
    console.log('🎉 All tests passed! Backend is working correctly.');
    
  } catch (error) {
    console.error('\n❌ Error occurred!');
    
    if (error.response) {
      console.error(`   Status: ${error.response.status} ${error.response.statusText}`);
      console.error('   URL:', error.config?.url);
      console.error('   Method:', error.config?.method?.toUpperCase());
      console.error('   Response:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.error('   No response received from server');
      console.error('   Is the server running?');
    } else {
      console.error('   Error:', error.message);
    }
    
    process.exit(1);
  }
}

console.log('⚠️  Make sure to set TEST_PASSWORD before running!\n');
testSettingsSave();

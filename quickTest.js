/**
 * Quick API Test
 * Tests the endpoints with your actual user data
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:4000/api';

// Your credentials from the MongoDB screenshot
const TEST_EMAIL = 'bhavesh1234@gmail.com';
const TEST_PASSWORD = 'your_password_here'; // Replace with actual password
const GITHUB_USERNAME = 'bhaveshs1212';

async function quickTest() {
  console.log('🧪 Quick API Test\n');
  
  try {
    // Test 1: Health check
    console.log('1️⃣ Testing server health...');
    const pingResponse = await axios.get('http://localhost:4000/ping');
    console.log('✅', pingResponse.data);
    console.log();
    
    // Test 2: Login
    console.log('2️⃣ Testing login...');
    console.log(`   Email: ${TEST_EMAIL}`);
    
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    });
    
    if (loginResponse.data.success) {
      console.log('✅ Login successful!');
      console.log('   User:', loginResponse.data.user.name);
      console.log('   Token:', loginResponse.data.token.substring(0, 20) + '...');
      
      const token = loginResponse.data.token;
      console.log();
      
      // Test 3: Update GitHub username
      console.log('3️⃣ Testing GitHub username update...');
      console.log(`   Username: ${GITHUB_USERNAME}`);
      
      const updateResponse = await axios.patch(`${BASE_URL}/auth/profile`, 
        { githubUsername: GITHUB_USERNAME },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (updateResponse.data.success) {
        console.log('✅ GitHub username updated!');
        console.log('   Profile:', updateResponse.data.user);
        console.log();
        
        // Test 4: Sync projects
        console.log('4️⃣ Testing project sync...');
        
        const syncResponse = await axios.post(`${BASE_URL}/projects/sync`,
          { githubUsername: GITHUB_USERNAME },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        if (syncResponse.data.success) {
          console.log('✅ Projects synced!');
          console.log(`   Found ${syncResponse.data.saved} projects`);
          if (syncResponse.data.data && syncResponse.data.data.length > 0) {
            console.log('   First 3 projects:');
            syncResponse.data.data.slice(0, 3).forEach((project, i) => {
              console.log(`      ${i + 1}. ${project.name} (${project.language})`);
            });
          }
        }
      }
    }
    
    console.log('\n✅ All tests passed! Backend is working correctly.');
    console.log('\n📝 Next step: Check your frontend code');
    console.log('   Make sure it uses the correct endpoints from FRONTEND_FIX_GUIDE.md');
    
  } catch (error) {
    console.error('\n❌ Test failed!');
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Message:', error.response.data.message || error.response.data);
    } else {
      console.error('   Error:', error.message);
    }
    console.log('\n💡 Troubleshooting:');
    if (error.code === 'ECONNREFUSED') {
      console.log('   - Make sure the server is running: node src/index.js');
    } else if (error.response?.status === 401) {
      console.log('   - Check your password in this file');
    } else if (error.response?.status === 404) {
      console.log('   - Check the endpoint URL');
    }
  }
}

console.log('⚠️  IMPORTANT: Replace TEST_PASSWORD with your actual password first!\n');
quickTest();

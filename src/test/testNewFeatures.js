/**
 * Test New Features
 * 
 * 1. Test Striver SDE Sheet DSA problems fetching
 * 2. Test GitHub project fetching
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:4000/api';

// Test user credentials (you should use your registered user)
let authToken = '';

// Helper function to login and get token
async function login() {
  try {
    console.log('\n🔐 Logging in...');
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'test@example.com',
      password: 'password123'
    });
    
    authToken = response.data.token;
    console.log('✅ Login successful');
    console.log('Token:', authToken.substring(0, 20) + '...');
    return true;
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data || error.message);
    console.log('\n💡 Make sure you have a registered user with:');
    console.log('   Email: test@example.com');
    console.log('   Password: password123');
    console.log('\n   Or register first at: POST /api/auth/register');
    return false;
  }
}

// Test 1: Fetch DSA problems from Striver SDE Sheet
async function testStriverSheet() {
  try {
    console.log('\n📚 Testing Striver SDE Sheet...');
    
    // Test 1a: Get all problems from Striver sheet
    console.log('\n1️⃣  Fetching all problems from Striver SDE Sheet...');
    const allProblems = await axios.get(`${BASE_URL}/dsa/problems?source=striver`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log(`✅ Found ${allProblems.data.count} problems`);
    console.log('Sample problem:', allProblems.data.data[0]);
    
    // Test 1b: Filter by difficulty
    console.log('\n2️⃣  Fetching Medium difficulty problems...');
    const mediumProblems = await axios.get(`${BASE_URL}/dsa/problems?source=striver&difficulty=Medium`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log(`✅ Found ${mediumProblems.data.count} Medium problems`);
    
    // Test 1c: Filter by topic
    console.log('\n3️⃣  Fetching Array problems...');
    const arrayProblems = await axios.get(`${BASE_URL}/dsa/problems?source=striver&topic=Arrays`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log(`✅ Found ${arrayProblems.data.count} Array problems`);
    
    // Test 1d: Search by title
    console.log('\n4️⃣  Searching for "Two Sum"...');
    const searchResults = await axios.get(`${BASE_URL}/dsa/problems?source=striver&search=Two Sum`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log(`✅ Found ${searchResults.data.count} matching problems`);
    if (searchResults.data.count > 0) {
      console.log('Result:', searchResults.data.data[0].title);
    }
    
  } catch (error) {
    console.error('❌ Striver Sheet test failed:', error.response?.data || error.message);
  }
}

// Test 2: Fetch projects from GitHub
async function testGitHubFetch() {
  try {
    console.log('\n🐙 Testing GitHub Project Fetching...');
    
    // Test with a popular GitHub username (you can change this)
    const testUsername = 'torvalds'; // Linus Torvalds
    
    console.log(`\n1️⃣  Fetching repositories for @${testUsername}...`);
    const repos = await axios.get(`${BASE_URL}/projects/github/${testUsername}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    console.log(`✅ Found ${repos.data.count} repositories`);
    console.log('\nSample repositories:');
    repos.data.data.slice(0, 3).forEach((repo, index) => {
      console.log(`${index + 1}. ${repo.name}`);
      console.log(`   Language: ${repo.language}`);
      console.log(`   Stars: ${repo.stars}`);
      console.log(`   Description: ${repo.description || 'No description'}`);
      console.log(`   URL: ${repo.url}\n`);
    });
    
    // Test 2b: Filter by language
    console.log(`\n2️⃣  Fetching only C repositories for @${testUsername}...`);
    const cRepos = await axios.get(`${BASE_URL}/projects/github/${testUsername}?language=C`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log(`✅ Found ${cRepos.data.count} C repositories`);
    
    // Test 2c: Filter by minimum stars
    console.log(`\n3️⃣  Fetching repos with at least 100 stars...`);
    const popularRepos = await axios.get(`${BASE_URL}/projects/github/${testUsername}?minStars=100`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log(`✅ Found ${popularRepos.data.count} popular repositories`);
    
  } catch (error) {
    console.error('❌ GitHub fetch test failed:', error.response?.data || error.message);
  }
}

// Test 3: Sync projects from GitHub (saves to database)
async function testGitHubSync() {
  try {
    console.log('\n💾 Testing GitHub Project Sync (save to database)...');
    
    // Use a username to sync (change to your GitHub username)
    const username = 'torvalds';
    
    console.log(`\n1️⃣  Syncing repositories from @${username}...`);
    const syncResult = await axios.post(
      `${BASE_URL}/projects/sync`,
      {
        githubUsername: username,
        filters: {
          excludeForks: true,
          minStars: 50
        }
      },
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    
    console.log(`✅ ${syncResult.data.message}`);
    console.log(`Synced ${syncResult.data.count} projects`);
    
    // Test 3b: Get synced projects from database
    console.log('\n2️⃣  Fetching synced projects from database...');
    const savedProjects = await axios.get(`${BASE_URL}/projects`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log(`✅ Found ${savedProjects.data.count} saved projects in database`);
    
  } catch (error) {
    console.error('❌ GitHub sync test failed:', error.response?.data || error.message);
  }
}

// Run all tests
async function runTests() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('🧪 TESTING NEW FEATURES');
  console.log('═══════════════════════════════════════════════════════════');
  
  // Login first
  const loggedIn = await login();
  if (!loggedIn) {
    console.log('\n⚠️  Tests require authentication. Please create a test user first.');
    return;
  }
  
  // Run tests
  await testStriverSheet();
  await testGitHubFetch();
  await testGitHubSync();
  
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('✅ ALL TESTS COMPLETED');
  console.log('═══════════════════════════════════════════════════════════\n');
}

// Execute tests
runTests().catch(error => {
  console.error('💥 Test execution failed:', error);
  process.exit(1);
});

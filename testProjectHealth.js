const axios = require('axios');

const BASE_URL = 'http://localhost:4000';

async function testProjectHealth() {
  try {
    // Login
    console.log('Logging in...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'test@example.com',
      password: 'password123'
    });
    
    const token = loginResponse.data.token;
    
    // Fetch projects
    console.log('\nFetching projects...\n');
    const projectsResponse = await axios.get(`${BASE_URL}/api/projects`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const projects = projectsResponse.data.data;
    
    console.log('📊 Project Health Status:\n');
    console.log('='.repeat(100));
    
    projects.forEach(project => {
      const statusEmoji = {
        'on-track': '✅',
        'at-risk': '⚠️',
        'delayed': '❌',
        'unknown': '❓'
      }[project.healthStatus] || '❓';
      
      console.log(`${statusEmoji} ${project.name}`);
      console.log(`   Last Update: ${project.githubUpdatedAt ? new Date(project.githubUpdatedAt).toLocaleDateString() : 'Unknown'}`);
      console.log(`   Days Since Commit: ${project.daysSinceLastCommit || 'N/A'}`);
      console.log(`   Health Score: ${project.healthScore || 'N/A'}/100`);
      console.log(`   Status: ${project.healthStatus?.toUpperCase() || 'UNKNOWN'}`);
      console.log();
    });
    
    // Summary
    const onTrack = projects.filter(p => p.healthStatus === 'on-track').length;
    const atRisk = projects.filter(p => p.healthStatus === 'at-risk').length;
    const delayed = projects.filter(p => p.healthStatus === 'delayed').length;
    
    console.log('='.repeat(100));
    console.log(`\n📈 Summary:`);
    console.log(`   ✅ On Track: ${onTrack}`);
    console.log(`   ⚠️  At Risk: ${atRisk}`);
    console.log(`   ❌ Delayed: ${delayed}`);
    console.log(`   📊 Total: ${projects.length}\n`);
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testProjectHealth();

/**
 * Test what the API actually returns for projects
 */

const mongoose = require('mongoose');
const Project = require('./src/models/Project');
const User = require('./src/models/User');

const MONGODB_URI = 'mongodb://127.0.0.1:27017/blaezi';

async function testAPIResponse() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get user
    const user = await User.findOne({ githubUsername: 'bhaveshs1212' });
    console.log('Testing for user:', user.email);
    console.log('User ID:', user._id.toString());
    console.log('');

    // Simulate what the controller does
    const projects = await Project.getUserProjects(user._id, {});
    
    console.log('Raw Query Result (first project):');
    console.log(JSON.stringify(projects[0], null, 2));
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('API Response Format:\n');
    const apiResponse = {
      success: true,
      count: projects.length,
      data: projects
    };

    // Show what would be sent to frontend
    console.log(JSON.stringify(apiResponse, null, 2));

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
  }
}

testAPIResponse();

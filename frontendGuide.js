/**
 * Frontend Integration Guide
 * 
 * Here's what your frontend should display for each project
 */

const mongoose = require('mongoose');
const Project = require('./src/models/Project');
const User = require('./src/models/User');

const MONGODB_URI = 'mongodb://127.0.0.1:27017/blaezi';

async function showFrontendData() {
  try {
    await mongoose.connect(MONGODB_URI);

    const user = await User.findOne({ githubUsername: 'bhaveshs1212' });
    const projects = await Project.getUserProjects(user._id, {});

    console.log('📋 FRONTEND DISPLAY GUIDE\n');
    console.log('Total Projects:', projects.length);
    console.log('');

    projects.forEach(project => {
      // This is what your frontend should show
      console.log(`Project: ${project.name}`);
      console.log(`  Status Badge: ${project.healthStatus.toUpperCase()}`);
      console.log(`  Color: ${getColor(project.healthStatus)}`);
      console.log(`  Days Since Commit: ${project.daysSinceLastCommit} days`);
      console.log(`  Health Score: ${project.healthScore}/100`);
      console.log(`  Last Commit: ${new Date(project.githubUpdatedAt).toLocaleDateString()}`);
      console.log('');
    });

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('IMPORTANT: Your frontend must use these fields:');
    console.log('  • project.healthStatus    (on-track, at-risk, or delayed)');
    console.log('  • project.healthScore     (0-100)');
    console.log('  • project.daysSinceLastCommit');
    console.log('');
    console.log('DO NOT use project.status (that\'s for completion tracking)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
  }
}

function getColor(status) {
  switch(status) {
    case 'on-track': return 'green/blue';
    case 'at-risk': return 'yellow/orange';
    case 'delayed': return 'red';
    default: return 'gray';
  }
}

showFrontendData();

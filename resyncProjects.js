/**
 * Re-sync Projects with Correct pushed_at Timestamps
 * 
 * This script re-syncs all projects to use the correct pushed_at field
 * from GitHub instead of updated_at for accurate last commit tracking
 */

const mongoose = require('mongoose');
const Project = require('./src/models/Project');
const User = require('./src/models/User');
const githubService = require('./src/services/githubService');

const MONGODB_URI = 'mongodb://127.0.0.1:27017/blaezi';

async function resyncProjects() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get the user with your GitHub username
    const user = await User.findOne({ githubUsername: 'bhaveshs1212' });
    if (!user) {
      console.log('❌ No user found with GitHub username. Please check the username.');
      process.exit(1);
    }

    const userId = user._id;
    const githubUsername = user.githubUsername;

    if (!githubUsername) {
      console.log('❌ No GitHub username found for user. Please set it first.');
      process.exit(1);
    }

    console.log(`🔄 Re-syncing projects for user: ${user.email}`);
    console.log(`   GitHub Username: ${githubUsername}\n`);

    // Fetch fresh data from GitHub
    const result = await githubService.fetchUserRepositories(githubUsername);
    
    if (!result.success) {
      console.log('❌ Failed to fetch from GitHub:', result.error);
      process.exit(1);
    }

    console.log(`📦 Found ${result.count} repositories on GitHub\n`);

    // Re-sync each repository
    let successCount = 0;
    let errorCount = 0;

    for (const repo of result.data) {
      try {
        // Convert to GitHub API format
        const githubData = {
          id: repo.githubId,
          name: repo.name,
          full_name: repo.fullName,
          description: repo.description,
          html_url: repo.url,
          homepage: repo.homepage,
          language: repo.language,
          stargazers_count: repo.stars,
          forks_count: repo.forks,
          private: repo.isPrivate,
          topics: repo.topics,
          created_at: repo.createdAt,
          updated_at: repo.updatedAt,
          pushed_at: repo.pushedAt  // This is the key field we need!
        };

        // Sync to database
        const project = await Project.syncFromGitHub(userId, githubData);
        
        // Calculate health metrics
        const days = project.daysSinceLastCommit;
        const health = project.healthStatus;
        const lastCommit = new Date(project.githubUpdatedAt);
        
        console.log(`✅ ${repo.name}`);
        console.log(`   Last Commit: ${lastCommit.toLocaleDateString()}`);
        console.log(`   Days Ago: ${days}`);
        console.log(`   Health: ${health.toUpperCase()}`);
        console.log();
        
        successCount++;
      } catch (error) {
        console.log(`❌ ${repo.name}: ${error.message}\n`);
        errorCount++;
      }
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 Re-sync Summary:');
    console.log(`   ✅ Success: ${successCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Show health status breakdown
    const projects = await Project.find({ userId })
      .select('name githubUpdatedAt')
      .lean();

    const onTrack = [];
    const atRisk = [];
    const delayed = [];

    for (const proj of projects) {
      const days = Math.floor((Date.now() - new Date(proj.githubUpdatedAt)) / (1000 * 60 * 60 * 24));
      if (days <= 30) {
        onTrack.push({ name: proj.name, days });
      } else if (days <= 90) {
        atRisk.push({ name: proj.name, days });
      } else {
        delayed.push({ name: proj.name, days });
      }
    }

    console.log('📈 Health Status Breakdown:\n');
    
    if (onTrack.length > 0) {
      console.log(`✅ On Track (${onTrack.length}):`);
      onTrack.forEach(p => console.log(`   • ${p.name} (${p.days} days ago)`));
      console.log();
    }

    if (atRisk.length > 0) {
      console.log(`⚠️  At Risk (${atRisk.length}):`);
      atRisk.forEach(p => console.log(`   • ${p.name} (${p.days} days ago)`));
      console.log();
    }

    if (delayed.length > 0) {
      console.log(`❌ Delayed (${delayed.length}):`);
      delayed.forEach(p => console.log(`   • ${p.name} (${p.days} days ago)`));
      console.log();
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    await mongoose.connection.close();
    console.log('Disconnected from MongoDB');
  }
}

resyncProjects();

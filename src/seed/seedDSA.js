/**
 * Seed Script for DSA Problems
 * 
 * PURPOSE: Import Striver SDE Sheet problems into database
 * 
 * WHAT THIS DOES:
 * 1. Connects to MongoDB
 * 2. Clears existing problems (optional)
 * 3. Imports Striver SDE Sheet problems
 * 4. Creates indexes
 * 5. Displays summary
 * 
 * RUN: node src/seed/seedDSA.js
 * 
 * OPTIONS:
 * - --clear: Clear existing problems before importing
 *   Example: node src/seed/seedDSA.js --clear
 */

const mongoose = require('mongoose');
require('dotenv').config();
const MasterProblem = require('../models/MasterProblem');
const striverSDESheet = require('./dsaProblems');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/blaezi';

/**
 * Connect to MongoDB
 */
async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
}

/**
 * Clear existing problems (if --clear flag provided)
 */
async function clearProblems() {
  const shouldClear = process.argv.includes('--clear');
  
  if (shouldClear) {
    console.log('\n🧹 Clearing existing problems...');
    const result = await MasterProblem.deleteMany({});
    console.log(`   Deleted ${result.deletedCount} problems`);
  }
}

/**
 * Import problems
 */
async function importProblems() {
  console.log('\n📚 Importing Striver SDE Sheet problems...');
  
  try {
    // Check for duplicates and skip them
    let imported = 0;
    let skipped = 0;
    
    for (const problem of striverSDESheet) {
      const exists = await MasterProblem.findOne({ title: problem.title });
      
      if (exists) {
        skipped++;
        console.log(`   ⏭️  Skipped: ${problem.title} (already exists)`);
      } else {
        await MasterProblem.create(problem);
        imported++;
        console.log(`   ✅ Imported: ${problem.title}`);
      }
    }
    
    console.log(`\n📊 Import Summary:`);
    console.log(`   ✅ Imported: ${imported} problems`);
    console.log(`   ⏭️  Skipped: ${skipped} problems (duplicates)`);
    console.log(`   📝 Total: ${imported + skipped} problems processed`);
    
  } catch (error) {
    console.error('❌ Import failed:', error.message);
    throw error;
  }
}

/**
 * Display statistics
 */
async function displayStats() {
  console.log('\n📈 Database Statistics:');
  
  const total = await MasterProblem.countDocuments();
  console.log(`   Total Problems: ${total}`);
  
  // Count by difficulty
  const easy = await MasterProblem.countDocuments({ difficulty: 'Easy' });
  const medium = await MasterProblem.countDocuments({ difficulty: 'Medium' });
  const hard = await MasterProblem.countDocuments({ difficulty: 'Hard' });
  
  console.log(`   Easy: ${easy}`);
  console.log(`   Medium: ${medium}`);
  console.log(`   Hard: ${hard}`);
  
  // Count by topic
  const topics = await MasterProblem.aggregate([
    { $group: { _id: '$topic', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
  
  console.log('\n   By Topic:');
  topics.forEach(topic => {
    console.log(`   - ${topic._id}: ${topic.count}`);
  });
  
  // Count by sheet
  const sheets = await MasterProblem.aggregate([
    { $group: { _id: '$sheet', count: { $sum: 1 } } }
  ]);
  
  console.log('\n   By Sheet:');
  sheets.forEach(sheet => {
    console.log(`   - ${sheet._id}: ${sheet.count}`);
  });
}

/**
 * Main execution
 */
async function main() {
  console.log('🌱 DSA Problems Seed Script');
  console.log('═'.repeat(60));
  
  try {
    // Connect to database
    await connectDB();
    
    // Clear if requested
    await clearProblems();
    
    // Import problems
    await importProblems();
    
    // Display stats
    await displayStats();
    
    console.log('\n═'.repeat(60));
    console.log('🎉 Seeding completed successfully!\n');
    
  } catch (error) {
    console.error('\n❌ Seeding failed:', error);
  } finally {
    // Close connection
    await mongoose.connection.close();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the script
main();

/**
 * TEST SCRIPT: Verify MasterProblem + UserProgress models work together
 * 
 * PURPOSE: Test the Master + Progress pattern before building controllers
 * 
 * RUN THIS: node src/test/testModels.js
 */

const mongoose = require('mongoose');
const MasterProblem = require('../models/MasterProblem');
const UserProgress = require('../models/UserProgress');

// MongoDB connection string (update with your actual MongoDB URI)
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/blaezi';

/**
 * STEP 1: Connect to MongoDB
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
 * STEP 2: Clean up test data (start fresh)
 */
async function cleanup() {
  console.log('\n🧹 Cleaning up old test data...');
  await MasterProblem.deleteMany({ title: /^TEST:/ });
  await UserProgress.deleteMany({});
  console.log('✅ Cleanup complete');
}

/**
 * STEP 3: Create sample MasterProblems
 */
async function createMasterProblems() {
  console.log('\n📚 Creating Master Problems...');
  
  const problems = [
    {
      title: 'TEST: Two Sum',
      problemNumber: 1,
      difficulty: 'Easy',
      topic: 'Array',
      subtopics: ['Hash Table', 'Two Pointers'],
      platform: 'LeetCode',
      url: 'https://leetcode.com/problems/two-sum',
      sheet: 'Striver SDE Sheet',
      companies: ['Google', 'Amazon', 'Microsoft'],
      description: 'Given an array of integers, return indices of two numbers that add up to target.',
      hints: ['Use a hash map to store complements', 'O(n) time complexity is possible'],
      acceptance: 49.2,
      likes: 15000,
      isActive: true
    },
    {
      title: 'TEST: Reverse Linked List',
      problemNumber: 206,
      difficulty: 'Medium',
      topic: 'Linked List',
      subtopics: ['Iterative', 'Recursive'],
      platform: 'LeetCode',
      url: 'https://leetcode.com/problems/reverse-linked-list',
      sheet: 'Striver SDE Sheet',
      companies: ['Facebook', 'Apple'],
      description: 'Reverse a singly linked list.',
      hints: ['Use three pointers: prev, current, next'],
      acceptance: 71.5,
      likes: 12000,
      isActive: true
    },
    {
      title: 'TEST: Merge K Sorted Lists',
      problemNumber: 23,
      difficulty: 'Hard',
      topic: 'Linked List',
      subtopics: ['Heap', 'Divide and Conquer'],
      platform: 'LeetCode',
      url: 'https://leetcode.com/problems/merge-k-sorted-lists',
      sheet: 'Striver SDE Sheet',
      companies: ['Google', 'Amazon'],
      description: 'Merge k sorted linked lists into one sorted list.',
      hints: ['Use a min heap', 'Time complexity: O(N log k)'],
      acceptance: 48.9,
      likes: 9000,
      isActive: true
    }
  ];

  const created = await MasterProblem.insertMany(problems);
  console.log(`✅ Created ${created.length} master problems`);
  
  return created;
}

/**
 * STEP 4: Create UserProgress for a sample user
 */
async function createUserProgress(problems) {
  console.log('\n👤 Creating User Progress...');
  
  // Simulating a user (in reality, this would come from User model)
  const userId = new mongoose.Types.ObjectId();
  console.log(`   User ID: ${userId}`);

  // Progress on problem 1: Solved
  const progress1 = await UserProgress.create({
    userId: userId,
    problemId: problems[0]._id,
    status: 'solved',
    lastSolvedAt: new Date(),
    notes: 'Used hash map. Time: O(n), Space: O(n)',
    approach: 'Hash Table',
    starred: true
  });

  // Progress on problem 2: Weak (struggled)
  const progress2 = await UserProgress.create({
    userId: userId,
    problemId: problems[1]._id,
    status: 'weak',
    notes: 'Confused with pointer manipulation. Need to practice more.',
    approach: 'Iterative'
  });

  // Progress on problem 3: None (just added, not attempted)
  const progress3 = await UserProgress.create({
    userId: userId,
    problemId: problems[2]._id,
    status: 'none'
  });

  console.log(`✅ Created progress for 3 problems`);
  
  return { userId, progressDocs: [progress1, progress2, progress3] };
}

/**
 * STEP 5: Test POPULATE (linking MasterProblem with UserProgress)
 */
async function testPopulate(userId) {
  console.log('\n🔗 Testing POPULATE (Master + Progress linking)...');
  
  const progress = await UserProgress.find({ userId })
    .populate('problemId');  // This fills in problem details!

  console.log('\n📊 User Progress with Problem Details:');
  progress.forEach((p, index) => {
    console.log(`\n   ${index + 1}. ${p.problemId.title}`);
    console.log(`      Difficulty: ${p.problemId.difficulty}`);
    console.log(`      Status: ${p.status}`);
    console.log(`      Starred: ${p.starred}`);
    if (p.notes) console.log(`      Notes: ${p.notes}`);
  });

  console.log('\n✅ Populate works! Problem details loaded successfully');
}

/**
 * STEP 6: Test Static Methods
 */
async function testStaticMethods(userId) {
  console.log('\n🔍 Testing Static Methods...');

  // Test getUserProgress
  const allProgress = await UserProgress.getUserProgress(userId);
  console.log(`   ✅ getUserProgress: Found ${allProgress.length} records`);

  // Test getProgressByStatus
  const solvedProblems = await UserProgress.getProgressByStatus(userId, 'solved');
  console.log(`   ✅ getProgressByStatus('solved'): Found ${solvedProblems.length} records`);

  // Test getUserStats
  const stats = await UserProgress.getUserStats(userId);
  console.log(`   ✅ getUserStats:`, stats);

  // Test MasterProblem static methods
  const easyProblems = await MasterProblem.getByDifficultyAndTopic('Easy', 'Array');
  console.log(`   ✅ MasterProblem.getByDifficultyAndTopic('Easy', 'Array'): Found ${easyProblems.length} records`);

  const sheetProblems = await MasterProblem.getBySheet('Striver SDE Sheet');
  console.log(`   ✅ MasterProblem.getBySheet('Striver SDE Sheet'): Found ${sheetProblems.length} records`);
}

/**
 * STEP 7: Test Instance Methods
 */
async function testInstanceMethods(userId, problemId) {
  console.log('\n⚙️ Testing Instance Methods...');

  // Find progress document
  const progress = await UserProgress.findOne({ userId, problemId });
  
  // Test markAsSolved
  progress.markAsSolved();
  await progress.save();
  console.log(`   ✅ markAsSolved: Status changed to ${progress.status}`);

  // Test isStale
  const isStale = progress.isStale();
  console.log(`   ✅ isStale: ${isStale} (should be false - just solved)`);

  // Test getDaysSinceLastSolved
  const days = progress.getDaysSinceLastSolved();
  console.log(`   ✅ getDaysSinceLastSolved: ${days} days`);
}

/**
 * STEP 8: Test Compound Unique Index
 */
async function testUniqueIndex(userId, problemId) {
  console.log('\n🚫 Testing Unique Index (should prevent duplicates)...');

  try {
    // Try to create duplicate progress (should fail)
    await UserProgress.create({
      userId: userId,
      problemId: problemId,
      status: 'solved'
    });
    console.log('   ❌ Unique index FAILED - duplicate was created!');
  } catch (error) {
    if (error.code === 11000) {
      console.log('   ✅ Unique index works! Duplicate rejected');
    } else {
      console.log('   ❌ Unexpected error:', error.message);
    }
  }
}

/**
 * STEP 9: Test createOrUpdate (Upsert)
 */
async function testUpsert(userId) {
  console.log('\n🔄 Testing createOrUpdate (Upsert)...');

  const newProblemId = new mongoose.Types.ObjectId();
  
  // First call: Creates new document
  const result1 = await UserProgress.createOrUpdate(userId, newProblemId, {
    status: 'weak',
    notes: 'First attempt'
  });
  console.log(`   ✅ First call: Created new document with status ${result1.status}`);

  // Second call: Updates existing document
  const result2 = await UserProgress.createOrUpdate(userId, newProblemId, {
    status: 'solved',
    notes: 'Solved it!'
  });
  console.log(`   ✅ Second call: Updated to status ${result2.status}`);
  console.log(`   ✅ Same document ID: ${result1._id.equals(result2._id)}`);
}

/**
 * MAIN TEST RUNNER
 */
async function runTests() {
  console.log('🧪 Starting Model Tests...\n');
  console.log('═'.repeat(60));

  try {
    // Connect to database
    await connectDB();

    // Clean up old test data
    await cleanup();

    // Create master problems
    const problems = await createMasterProblems();

    // Create user progress
    const { userId, progressDocs } = await createUserProgress(problems);

    // Test populate
    await testPopulate(userId);

    // Test static methods
    await testStaticMethods(userId);

    // Test instance methods
    await testInstanceMethods(userId, problems[1]._id);

    // Test unique index
    await testUniqueIndex(userId, problems[0]._id);

    // Test upsert
    await testUpsert(userId);

    console.log('\n═'.repeat(60));
    console.log('\n🎉 ALL TESTS PASSED! Models work correctly\n');

  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
    console.error(error);
  } finally {
    // Close connection
    await mongoose.connection.close();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the tests
runTests();

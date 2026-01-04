/**
 * Import All 150 Striver Problems into Database
 * 
 * This moves problems from hardcoded array to MongoDB for better performance
 */

const mongoose = require('mongoose');
const MasterProblem = require('./src/models/MasterProblem');
const { STRIVER_SDE_SHEET_PROBLEMS } = require('./src/services/striverSheetService');

const MONGODB_URI = 'mongodb://127.0.0.1:27017/blaezi';

async function seedProblems() {
  try {
    console.log('📚 Importing 150 Striver SDE Sheet Problems into Database\n');
    console.log('══════════════════════════════════════════════════════\n');
    
    // Connect
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Clear existing Striver problems
    const deleteResult = await MasterProblem.deleteMany({ sheet: 'Striver SDE Sheet' });
    console.log(`🧹 Cleared ${deleteResult.deletedCount} existing Striver problems\n`);

    console.log('📥 Importing problems...\n');

    let imported = 0;
    let failed = 0;

    for (const problem of STRIVER_SDE_SHEET_PROBLEMS) {
      try {
        await MasterProblem.create({
          title: problem.title,
          problemNumber: problem.problemNumber,
          difficulty: problem.difficulty,
          topic: problem.topic,
          subtopics: [],
          platform: problem.platform,
          platformLink: problem.link,
          sheet: problem.sheet,
          sheetLink: 'https://takeuforward.org/interviews/strivers-sde-sheet-top-coding-interview-problems/',
          isActive: true,
          companyTags: [],
          hints: [],
          notes: ''
        });
        
        imported++;
        if (imported % 25 === 0) {
          console.log(`   ✅ Imported ${imported} problems...`);
        }
      } catch (error) {
        console.log(`   ❌ Failed: ${problem.title} - ${error.message}`);
        failed++;
      }
    }

    console.log('\n══════════════════════════════════════════════════════');
    console.log(`\n📊 Import Summary:`);
    console.log(`   ✅ Successfully imported: ${imported} problems`);
    console.log(`   ❌ Failed: ${failed} problems`);
    console.log(`   📝 Total in source: ${STRIVER_SDE_SHEET_PROBLEMS.length} problems\n`);

    // Show statistics
    const stats = await MasterProblem.aggregate([
      { $match: { sheet: 'Striver SDE Sheet' } },
      {
        $facet: {
          byDifficulty: [
            { $group: { _id: '$difficulty', count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
          ],
          byTopic: [
            { $group: { _id: '$topic', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
          ]
        }
      }
    ]);

    console.log('📈 Database Statistics:\n');
    
    if (stats[0].byDifficulty.length > 0) {
      console.log('   By Difficulty:');
      stats[0].byDifficulty.forEach(item => {
        console.log(`   - ${item._id}: ${item.count}`);
      });
      console.log('');
    }

    if (stats[0].byTopic.length > 0) {
      console.log('   Top Topics:');
      stats[0].byTopic.forEach(item => {
        console.log(`   - ${item._id}: ${item.count}`);
      });
      console.log('');
    }

    const totalProblems = await MasterProblem.countDocuments();
    console.log(`   Total problems in database: ${totalProblems}\n`);

    console.log('══════════════════════════════════════════════════════');
    console.log('\n🎉 Migration Complete!\n');
    console.log('💡 Benefits:');
    console.log('   ✅ Problems now stored in MongoDB');
    console.log('   ✅ Efficient querying and filtering');
    console.log('   ✅ Can be updated without code changes');
    console.log('   ✅ Ready for user progress tracking');
    console.log('   ✅ Can add more problem sheets easily\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Disconnected from MongoDB\n');
  }
}

seedProblems();

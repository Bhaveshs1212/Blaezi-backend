/**
 * Fix MongoDB Text Index
 * Run this once to fix the language conflict
 */

require('dotenv').config();
const mongoose = require('mongoose');

async function fixIndex() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected\n');

    const db = mongoose.connection.db;
    const collection = db.collection('projects');

    console.log('Checking existing indexes...');
    const indexes = await collection.indexes();
    console.log('Current indexes:', JSON.stringify(indexes, null, 2));

    // Drop the problematic text index if it exists
    console.log('\nDropping old text index...');
    try {
      await collection.dropIndex('name_text_description_text');
      console.log('✅ Old text index dropped');
    } catch (error) {
      if (error.codeName === 'IndexNotFound') {
        console.log('⚠️  Index not found (already dropped or never created)');
      } else {
        throw error;
      }
    }

    // Create new text index with language: 'none'
    console.log('\nCreating new text index...');
    await collection.createIndex(
      { name: 'text', description: 'text' },
      { default_language: 'none' }
    );
    console.log('✅ New text index created with language: none');

    console.log('\n✅ Index fix complete!');
    await mongoose.connection.close();
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixIndex();

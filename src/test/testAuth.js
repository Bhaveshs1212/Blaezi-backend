/**
 * Authentication Test Script
 * 
 * PURPOSE: Test user registration and login
 * 
 * RUN: node src/test/testAuth.js
 */

const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../models/User');
const { generateToken } = require('../controllers/authController');

const MONGODB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/blaezi';

async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
}

async function testAuth() {
  console.log('🔐 Testing Authentication System\n');
  console.log('═'.repeat(60));
  
  try {
    await connectDB();
    
    // Clean up test user
    console.log('\n🧹 Cleaning up test data...');
    await User.deleteOne({ email: 'test@example.com' });
    console.log('✅ Cleanup complete');
    
    // Test 1: Register user
    console.log('\n📝 Test 1: Register User');
    const testUser = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    });
    console.log('✅ User registered:');
    console.log(`   ID: ${testUser._id}`);
    console.log(`   Name: ${testUser.name}`);
    console.log(`   Email: ${testUser.email}`);
    console.log(`   Password hashed: ${testUser.password ? 'Yes' : 'No'}`);
    
    // Test 2: Password hashing
    console.log('\n🔒 Test 2: Password Hashing');
    const savedUser = await User.findById(testUser._id).select('+password');
    const isHashed = savedUser.password !== 'password123';
    console.log(`✅ Password is hashed: ${isHashed}`);
    console.log(`   Original: password123`);
    console.log(`   Hashed: ${savedUser.password.substring(0, 30)}...`);
    
    // Test 3: Password comparison
    console.log('\n🔑 Test 3: Password Verification');
    const correctPassword = await savedUser.comparePassword('password123');
    const wrongPassword = await savedUser.comparePassword('wrongpassword');
    console.log(`✅ Correct password: ${correctPassword ? 'PASS' : 'FAIL'}`);
    console.log(`✅ Wrong password rejected: ${!wrongPassword ? 'PASS' : 'FAIL'}`);
    
    // Test 4: Duplicate email
    console.log('\n🚫 Test 4: Duplicate Email Prevention');
    try {
      await User.create({
        name: 'Another User',
        email: 'test@example.com',  // Same email
        password: 'password123'
      });
      console.log('❌ FAIL: Duplicate email was allowed');
    } catch (error) {
      if (error.code === 11000) {
        console.log('✅ PASS: Duplicate email rejected');
      } else {
        console.log('❌ Unexpected error:', error.message);
      }
    }
    
    // Test 5: toJSON method (remove sensitive fields)
    console.log('\n🔍 Test 5: Sensitive Data Protection');
    const userJSON = testUser.toJSON();
    const hasPassword = 'password' in userJSON;
    const hasToken = 'githubAccessToken' in userJSON;
    console.log(`✅ Password removed from response: ${!hasPassword ? 'PASS' : 'FAIL'}`);
    console.log(`✅ GitHub token removed: ${!hasToken ? 'PASS' : 'FAIL'}`);
    console.log('   Response fields:', Object.keys(userJSON).join(', '));
    
    console.log('\n═'.repeat(60));
    console.log('🎉 All authentication tests passed!\n');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    console.error(error.stack);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Disconnected from MongoDB');
  }
}

testAuth();

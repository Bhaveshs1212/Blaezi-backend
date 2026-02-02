/**
 * Planner API Test Suite
 * 
 * Tests all planner endpoints:
 * - Task CRUD operations
 * - Goal CRUD operations
 * - Statistics and activity endpoints
 * 
 * USAGE: node testPlanner.js
 */

require('dotenv').config();
const axios = require('axios');

// Configuration
const BASE_URL = process.env.API_URL || 'http://localhost:4000';
const API_URL = `${BASE_URL}/api`;

// Test user credentials (update these with your test credentials)
const TEST_USER = {
  email: 'test@example.com',
  password: 'testpassword123'
};

let authToken = '';
let testTaskId = '';
let testGoalId = '';
let testEventId = '';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(name) {
  console.log(`\n${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.blue}Testing: ${name}${colors.reset}`);
  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
}

function logSuccess(message) {
  log(`✓ ${message}`, 'green');
}

function logError(message, error) {
  log(`✗ ${message}`, 'red');
  if (error) {
    console.error(error.response?.data || error.message);
  }
}

function logInfo(message) {
  log(`ℹ ${message}`, 'yellow');
}

// Helper function to make authenticated requests
async function apiRequest(method, endpoint, data = null) {
  const config = {
    method,
    url: `${API_URL}${endpoint}`,
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json'
    }
  };

  if (data) {
    config.data = data;
  }

  return axios(config);
}

// Test functions

async function authenticate() {
  logTest('Authentication');
  try {
    const response = await axios.post(`${API_URL}/auth/login`, TEST_USER);
    authToken = response.data.token;
    logSuccess('Authentication successful');
    logInfo(`Token: ${authToken.substring(0, 20)}...`);
    return true;
  } catch (error) {
    logError('Authentication failed', error);
    return false;
  }
}

async function testCreateGoal() {
  logTest('Create Goal');
  try {
    const goalData = {
      name: 'Complete Backend Development',
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      steps: [
        {
          id: 'step-1',
          title: 'Design API endpoints',
          completed: false
        },
        {
          id: 'step-2',
          title: 'Implement controllers',
          completed: false
        }
      ]
    };

    const response = await apiRequest('post', '/planner/goals', goalData);
    testGoalId = response.data.data._id;

    logSuccess('Goal created successfully');
    logInfo(`Goal ID: ${testGoalId}`);
    logInfo(`Goal Name: ${response.data.data.name}`);
    return true;
  } catch (error) {
    logError('Failed to create goal', error);
    return false;
  }
}

async function testGetAllGoals() {
  logTest('Get All Goals');
  try {
    const response = await apiRequest('get', '/planner/goals');
    logSuccess(`Retrieved ${response.data.data.length} goals`);
    console.log(JSON.stringify(response.data.data, null, 2));
    return true;
  } catch (error) {
    logError('Failed to get goals', error);
    return false;
  }
}

async function testCreateTask() {
  logTest('Create Task');
  try {
    const taskData = {
      title: 'Implement Planner API',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      goalId: testGoalId,
      completed: false,
      order: 0
    };

    const response = await apiRequest('post', '/planner/tasks', taskData);
    testTaskId = response.data.data._id;

    logSuccess('Task created successfully');
    logInfo(`Task ID: ${testTaskId}`);
    logInfo(`Task Title: ${response.data.data.title}`);
    return true;
  } catch (error) {
    logError('Failed to create task', error);
    return false;
  }
}

async function testGetAllTasks() {
  logTest('Get All Tasks');
  try {
    const response = await apiRequest('get', '/planner/tasks');
    logSuccess(`Retrieved ${response.data.data.length} tasks`);
    console.log(JSON.stringify(response.data.data, null, 2));
    return true;
  } catch (error) {
    logError('Failed to get tasks', error);
    return false;
  }
}

async function testGetTaskById() {
  logTest('Get Task By ID');
  try {
    const response = await apiRequest('get', `/planner/tasks/${testTaskId}`);
    logSuccess('Task retrieved successfully');
    console.log(JSON.stringify(response.data.data, null, 2));
    return true;
  } catch (error) {
    logError('Failed to get task by ID', error);
    return false;
  }
}

async function testUpdateTask() {
  logTest('Update Task');
  try {
    const updateData = {
      completed: true,
      completedAt: new Date().toISOString()
    };

    const response = await apiRequest('patch', `/planner/tasks/${testTaskId}`, updateData);
    logSuccess('Task updated successfully');
    logInfo(`Completed: ${response.data.data.completed}`);
    return true;
  } catch (error) {
    logError('Failed to update task', error);
    return false;
  }
}

async function testBulkUpdateTasks() {
  logTest('Bulk Update Tasks');
  try {
    // First, create a few more tasks
    const task2Data = {
      title: 'Write tests',
      completed: false,
      order: 1
    };
    const task3Data = {
      title: 'Deploy to production',
      completed: false,
      order: 2
    };

    const task2Response = await apiRequest('post', '/planner/tasks', task2Data);
    const task3Response = await apiRequest('post', '/planner/tasks', task3Data);

    const task2Id = task2Response.data.data._id;
    const task3Id = task3Response.data.data._id;

    // Now bulk update
    const bulkData = {
      tasks: [
        { id: task2Id, order: 2 },
        { id: task3Id, order: 1 }
      ]
    };

    const response = await apiRequest('post', '/planner/tasks/bulk-update', bulkData);
    logSuccess(`${response.data.message}`);
    return true;
  } catch (error) {
    logError('Failed to bulk update tasks', error);
    return false;
  }
}

async function testUpdateGoal() {
  logTest('Update Goal');
  try {
    const updateData = {
      name: 'Complete Full Stack Development',
      steps: [
        {
          id: 'step-1',
          title: 'Design API endpoints',
          completed: true
        },
        {
          id: 'step-2',
          title: 'Implement controllers',
          completed: true
        },
        {
          id: 'step-3',
          title: 'Write tests',
          completed: false
        }
      ]
    };

    const response = await apiRequest('patch', `/planner/goals/${testGoalId}`, updateData);
    logSuccess('Goal updated successfully');
    logInfo(`New Name: ${response.data.data.name}`);
    return true;
  } catch (error) {
    logError('Failed to update goal', error);
    return false;
  }
}

async function testGetPlannerStats() {
  logTest('Get Planner Statistics');
  try {
    const response = await apiRequest('get', '/planner/stats');
    logSuccess('Statistics retrieved successfully');
    console.log(JSON.stringify(response.data.data, null, 2));
    return true;
  } catch (error) {
    logError('Failed to get statistics', error);
    return false;
  }
}

async function testGetActivityData() {
  logTest('Get Activity Data');
  try {
    const response = await apiRequest('get', '/planner/activity');
    logSuccess('Activity data retrieved successfully');
    console.log(JSON.stringify(response.data.data, null, 2));
    return true;
  } catch (error) {
    logError('Failed to get activity data', error);
    return false;
  }
}

async function testGetTasksByFilter() {
  logTest('Get Tasks with Filters');
  try {
    // Test filtering by completed status
    const response = await apiRequest('get', '/planner/tasks?completed=true');
    logSuccess(`Retrieved ${response.data.data.length} completed tasks`);

    // Test filtering by goal
    const goalResponse = await apiRequest('get', `/planner/tasks?goalId=${testGoalId}`);
    logSuccess(`Retrieved ${goalResponse.data.data.length} tasks for goal`);
    return true;
  } catch (error) {
    logError('Failed to get filtered tasks', error);
    return false;
  }
}

async function testDeleteTask() {
  logTest('Delete Task');
  try {
    const response = await apiRequest('delete', `/planner/tasks/${testTaskId}`);
    logSuccess('Task deleted successfully');
    return true;
  } catch (error) {
    logError('Failed to delete task', error);
    return false;
  }
}

async function testDeleteGoal() {
  logTest('Delete Goal');
  try {
    const response = await apiRequest('delete', `/planner/goals/${testGoalId}`);
    logSuccess('Goal deleted successfully');
    logInfo('Associated tasks should have goalId set to null');
    return true;
  } catch (error) {
    logError('Failed to delete goal', error);
    return false;
  }
}

async function testCreateEvent() {
  logTest('Create Event');
  try {
    const eventData = {
      title: 'Product Launch Event',
      date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days from now
      description: 'Major product release celebration'
    };

    const response = await apiRequest('post', '/planner/events', eventData);
    testEventId = response.data.data._id;

    logSuccess('Event created successfully');
    logInfo(`Event ID: ${testEventId}`);
    logInfo(`Event Title: ${response.data.data.title}`);
    return true;
  } catch (error) {
    logError('Failed to create event', error);
    return false;
  }
}

async function testGetAllEvents() {
  logTest('Get All Events');
  try {
    const response = await apiRequest('get', '/planner/events');
    logSuccess(`Retrieved ${response.data.data.length} events`);
    console.log(JSON.stringify(response.data.data, null, 2));
    return true;
  } catch (error) {
    logError('Failed to get events', error);
    return false;
  }
}

async function testUpdateEvent() {
  logTest('Update Event');
  try {
    const updateData = {
      title: 'Updated Product Launch Event',
      description: 'Virtual product launch with live demo'
    };

    const response = await apiRequest('put', `/planner/events/${testEventId}`, updateData);
    logSuccess('Event updated successfully');
    logInfo(`New Title: ${response.data.data.title}`);
    return true;
  } catch (error) {
    logError('Failed to update event', error);
    return false;
  }
}

async function testDeleteEvent() {
  logTest('Delete Event');
  try {
    const response = await apiRequest('delete', `/planner/events/${testEventId}`);
    logSuccess('Event deleted successfully');
    return true;
  } catch (error) {
    logError('Failed to delete event', error);
    return false;
  }
}

// Main test runner
async function runTests() {
  console.log('\n' + '='.repeat(80));
  log('PLANNER API TEST SUITE', 'cyan');
  log(`Testing API at: ${API_URL}`, 'yellow');
  console.log('='.repeat(80) + '\n');

  const tests = [
    authenticate,
    testCreateGoal,
    testGetAllGoals,
    testCreateTask,
    testGetAllTasks,
    testGetTaskById,
    testGetTasksByFilter,
    testUpdateTask,
    testBulkUpdateTasks,
    testUpdateGoal,
    testCreateEvent,
    testGetAllEvents,
    testUpdateEvent,
    testGetPlannerStats,
    testGetActivityData,
    testDeleteEvent,
    testDeleteTask,
    testDeleteGoal
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      const result = await test();
      if (result) {
        passed++;
      } else {
        failed++;
      }
    } catch (error) {
      failed++;
      logError(`Unexpected error in ${test.name}`, error);
    }
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Summary
  console.log('\n' + '='.repeat(80));
  log('TEST SUMMARY', 'cyan');
  console.log('='.repeat(80));
  log(`Total Tests: ${passed + failed}`, 'yellow');
  log(`Passed: ${passed}`, 'green');
  log(`Failed: ${failed}`, failed > 0 ? 'red' : 'green');
  console.log('='.repeat(80) + '\n');

  if (failed === 0) {
    log('🎉 All tests passed!', 'green');
  } else {
    log('⚠️  Some tests failed. Please check the errors above.', 'red');
  }
}

// Run the tests
runTests().catch(error => {
  logError('Fatal error running tests', error);
  process.exit(1);
});

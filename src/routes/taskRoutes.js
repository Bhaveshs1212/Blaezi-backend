const express = require('express');
const router = express.Router();
const { 
  getTasks, 
  createTask, 
  getStats, 
  updateTask, 
  deleteTask 
} = require('../controllers/taskController');

router.get('/', getTasks);
router.post('/', createTask);
router.get('/stats', getStats);
router.patch('/:id', updateTask); // Use PATCH for partial updates
router.delete('/:id', deleteTask);

module.exports = router;
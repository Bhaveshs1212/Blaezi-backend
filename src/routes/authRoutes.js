const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');
console.log("✅ authRoutes file loaded");

// Public routes
router.get('/test', (req, res) => {
  res.send('AUTH ROUTE WORKING');
});

router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected routes
router.get('/me', auth, authController.getMe);
router.patch('/profile', auth, authController.updateProfile);

module.exports = router;

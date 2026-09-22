const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

// POST /api/auth/register - Register new customer or provider
router.post('/register', register);

// POST /api/auth/login - Authenticate user
router.post('/login', login);

// GET /api/auth/me - Protected route to get current user
router.get('/me', authMiddleware, getMe);

module.exports = router;

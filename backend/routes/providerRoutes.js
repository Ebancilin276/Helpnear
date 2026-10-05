const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { requireProvider } = require('../middleware/roleMiddleware');
const {
  createProfile,
  getOwnProfile,
  updateProfile,
  selectServices,
  getOwnServices,
  listProviders
} = require('../controllers/providerController');

// GET /api/providers - Public provider directory with optional city/service filters
router.get('/', listProviders);

// Provider Profile Routes (Protected: JWT + Provider role)
router.post('/profile', authMiddleware, requireProvider, createProfile);
router.get('/profile', authMiddleware, requireProvider, getOwnProfile);
router.put('/profile', authMiddleware, requireProvider, updateProfile);

// Provider Services Routes (Protected: JWT + Provider role)
router.post('/services', authMiddleware, requireProvider, selectServices);
router.get('/services', authMiddleware, requireProvider, getOwnServices);

module.exports = router;

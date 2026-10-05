const express = require('express');
const router = express.Router();
const { getCategories } = require('../controllers/serviceController');

// GET /api/services/categories - Public list of service categories
router.get('/categories', getCategories);

module.exports = router;

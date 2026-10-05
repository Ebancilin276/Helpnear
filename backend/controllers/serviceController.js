const { pool } = require('../config/db');

/**
 * GET /api/services/categories
 * Public endpoint to fetch all available service categories
 */
const getCategories = async (req, res) => {
  try {
    const [categories] = await pool.query(
      'SELECT id, name, description FROM service_categories ORDER BY id ASC'
    );

    return res.status(200).json({
      success: true,
      categories
    });
  } catch (error) {
    console.error('Error fetching service categories:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error fetching service categories'
    });
  }
};

module.exports = {
  getCategories
};

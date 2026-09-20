/**
 * Health check controller
 * Endpoint: GET /api/health
 */
const getHealth = (req, res) => {
  res.status(200).json({
    success: true,
    message: 'HelpNear backend is running'
  });
};

module.exports = {
  getHealth
};

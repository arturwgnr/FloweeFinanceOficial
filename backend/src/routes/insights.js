const express = require('express');
const { getInsights } = require('../controllers/insightsController');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', authenticate, getInsights);

module.exports = router;

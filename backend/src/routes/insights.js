const express = require('express');
const { generate, getHistory, getTokens, annual } = require('../controllers/insightsController');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authenticate);

router.post('/generate', generate);
router.get('/history', getHistory);
router.get('/tokens', getTokens);
router.post('/annual', annual);

module.exports = router;

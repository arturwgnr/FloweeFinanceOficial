const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const { list } = require('../controllers/tagsController');

router.get('/', authenticate, list);

module.exports = router;

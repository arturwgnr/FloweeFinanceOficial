const express = require('express');
const { list, upsert, remove } = require('../controllers/budgetsController');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authenticate);

router.get('/', list);
router.post('/', upsert);
router.delete('/:id', remove);

module.exports = router;

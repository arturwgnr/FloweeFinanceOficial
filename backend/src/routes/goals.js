const express = require('express');
const { list, create, update, remove, addAmount } = require('../controllers/goalsController');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authenticate);

router.get('/', list);
router.post('/', create);
router.put('/:id', update);
router.delete('/:id', remove);
router.patch('/:id/amount', addAmount);

module.exports = router;

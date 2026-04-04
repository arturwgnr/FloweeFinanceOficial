const express = require('express');
const { list, create, update, remove, removeGroup } = require('../controllers/transactionsController');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authenticate);

router.get('/', list);
router.post('/', create);
router.put('/:id', update);
router.delete('/group/:recurringGroupId', removeGroup);
router.delete('/:id', remove);

module.exports = router;

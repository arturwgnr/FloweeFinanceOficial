const express = require('express');
const { getProfile, updateProfile, changePassword, resetAccount } = require('../controllers/profileController');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authenticate);

router.get('/', getProfile);
router.put('/', updateProfile);
router.put('/password', changePassword);
router.post('/reset', resetAccount);

module.exports = router;

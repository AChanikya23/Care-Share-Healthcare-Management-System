const express = require('express');
const router = express.Router();
const { changePassword, getProfile, updateProfile } = require('../controllers/profileController');
const { authenticateToken } = require('../middleware/auth');

router.get('/', authenticateToken, getProfile);
router.put('/', authenticateToken, updateProfile);
router.post('/change-password', authenticateToken, changePassword);

module.exports = router;

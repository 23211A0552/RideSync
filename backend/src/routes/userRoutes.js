const express = require('express');
const router = express.Router();
const { getUserProfile, updateUserProfile } = require('../controllers/userController');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/profile/:id', verifyToken, getUserProfile);
router.put('/profile/:id', verifyToken, updateUserProfile);

module.exports = router;

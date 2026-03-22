const express = require('express');
const router = express.Router();
const { createRide, getRides, bookRide, getRideById } = require('../controllers/rideController');
const { verifyToken } = require('../middleware/authMiddleware');

router.post('/', verifyToken, createRide);
router.get('/', getRides);
router.get('/:id', getRideById);
router.post('/:id/book', verifyToken, bookRide);

module.exports = router;

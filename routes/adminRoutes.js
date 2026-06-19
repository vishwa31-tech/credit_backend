const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

router.get('/dashboard', verifyToken, verifyAdmin, adminController.getDashboard);

module.exports = router;

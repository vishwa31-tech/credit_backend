const express = require('express');
const router = express.Router();
const newsController = require('../controllers/newsController');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

// Public routes
router.get('/', newsController.getAllNews);
router.get('/:id', newsController.getNewsById);

// Protected routes (admin only)
router.post('/', verifyToken, verifyAdmin, newsController.createNews);

module.exports = router;

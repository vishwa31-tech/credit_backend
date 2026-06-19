const express = require('express');
const router = express.Router();
const businessController = require('../controllers/businessController');
const { verifyToken, verifyVendor } = require('../middleware/auth');

// Public routes
router.get('/', businessController.getAllBusinesses);
router.get('/:id', businessController.getBusinessById);

// Protected routes
router.post('/', verifyToken, verifyVendor, businessController.createBusiness);
router.post('/:id/review', verifyToken, businessController.addReview);

module.exports = router;

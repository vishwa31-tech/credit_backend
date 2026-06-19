const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const { verifyToken, verifyVendor } = require('../middleware/auth');

// Public routes
router.get('/', jobController.getAllJobs);
router.get('/:id', jobController.getJobById);

// Protected routes
router.post('/', verifyToken, verifyVendor, jobController.createJob);

module.exports = router;

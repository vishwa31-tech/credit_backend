const express = require('express');
const router = express.Router();
const registrationController = require('../controllers/registrationController');
const { verifyToken } = require('../middleware/auth');

// Protected routes - requires authentication
router.post('/', verifyToken, registrationController.registerForEvent);
router.get('/my-registrations', verifyToken, registrationController.getUserRegistrations);
router.put('/:id/cancel', verifyToken, registrationController.cancelRegistration);


module.exports = router;

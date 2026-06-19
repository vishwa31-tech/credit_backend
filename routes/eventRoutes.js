const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { verifyToken, verifyVendor } = require('../middleware/auth');

// Public routes
router.get('/', eventController.getAllEvents);
router.get('/:id', eventController.getEventById);

// Protected routes
router.post('/', verifyToken, verifyVendor, eventController.createEvent);
router.put('/:id', verifyToken, eventController.updateEvent);
router.delete('/:id', verifyToken, eventController.deleteEvent);

module.exports = router;

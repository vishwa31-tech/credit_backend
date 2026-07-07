const express = require('express');
const router = express.Router();
const registrationController = require('../controllers/registrationController');
const { verifyToken } = require('../middleware/auth');

// Protected routes for role requests - requires authentication
router.post('/', verifyToken, registrationController.createRoleRequest);
router.get('/my-requests', verifyToken, registrationController.getUserRoleRequests);
router.delete('/:id', verifyToken, registrationController.withdrawRoleRequest);


module.exports = router;

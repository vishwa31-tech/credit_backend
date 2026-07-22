const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const businessController = require('../controllers/businessController');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

router.get('/check-admin', verifyToken, verifyAdmin, adminController.checkAdmin);
router.get('/dashboard', verifyToken, verifyAdmin, adminController.getDashboard);

// Role request management routes
router.get('/role-requests/pending', verifyToken, verifyAdmin, adminController.getPendingRoleRequests);
router.get('/role-requests', verifyToken, verifyAdmin, adminController.getAllRoleRequests);
router.get('/role-requests/:requestId', verifyToken, verifyAdmin, adminController.getRoleRequestDetail);
router.post('/role-requests/:requestId/approve', verifyToken, verifyAdmin, adminController.approveRoleRequest);
router.post('/role-requests/:requestId/reject', verifyToken, verifyAdmin, adminController.rejectRoleRequest);
router.get('/service-leads', verifyToken, verifyAdmin, businessController.getServiceLeads);
router.put('/service-leads/:id', verifyToken, verifyAdmin, businessController.updateServiceLeadStatus);

module.exports = router;

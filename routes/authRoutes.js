const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { verifyToken } = require("../middleware/auth");

// Public routes
router.post("/register", authController.register);
router.post("/login", authController.login);

// Protected routes
router.get("/getprofile", verifyToken, authController.getProfile);
router.put("/updateprofile", verifyToken, authController.updateProfile);

// Role request routes
router.post("/submit-role-request", verifyToken, authController.submitRoleRequest);
router.get("/pending-requests", verifyToken, authController.getPendingRequests);
router.get("/request-status/:requestId", verifyToken, authController.getRequestStatus);

module.exports = router;

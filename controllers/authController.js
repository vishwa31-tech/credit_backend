const User = require("../models/User");
const RoleRequest = require("../models/RoleRequest");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Register user (Basic signup - all users start as customers)
exports.register = async (req, res) => {
  try {
    const { name, email, password, phone, city } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user - always start as customer
    const user = new User({
      name,
      email,
      password: hashedPassword,
      phone,
      city,
      role: 'customer', // Default role
      status: 'active',
      secondaryRoles: [],
    });

    await user.save();

    // Generate token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "your_secret_key",
      { expiresIn: "7d" },
    );

    res.status(201).json({
      message: "Account created successfully! Welcome to EventHub.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
      token,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('[auth/login] attempt for email:', email);
    // Find user
    const user = await User.findOne({ email });
    console.log('[auth/login] user found:', !!user);
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log('[auth/login] password valid:', !!isPasswordValid);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "your_secret_key",
      { expiresIn: "7d" },
    );

    res.json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        secondaryRoles: user.secondaryRoles || [],
      },
      token,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Submit role request (Become a Partner)
exports.submitRoleRequest = async (req, res) => {
  try {
    const userId = req.user.id;
    const { requestedRole, formData, documents } = req.body;

    // Validate role
    const validRoles = ['event-owner', 'job-seeker', 'mahal-owner', 'catering', 'decoration', 'photography', 'others'];
    if (!validRoles.includes(requestedRole)) {
      return res.status(400).json({ error: "Invalid role selected" });
    }

    // Check if user already has this role or has a pending request
    const user = await User.findById(userId);
    if (user.secondaryRoles.includes(requestedRole)) {
      return res.status(400).json({ error: "You already have this role" });
    }

    const existingRequest = await RoleRequest.findOne({
      userId,
      requestedRole,
      status: 'pending',
    });

    if (existingRequest) {
      return res.status(400).json({ error: "You already have a pending request for this role" });
    }

    // Create role request
    const roleRequest = new RoleRequest({
      userId,
      requestedRole,
      formData,
      documents: documents || [],
      status: 'pending',
    });

    await roleRequest.save();

    // Update user status to pending and clear previous rejection reason
    if (user.status !== 'pending') {
      user.status = 'pending';
      user.rejectionReason = undefined;
      await user.save();
    }

    res.status(201).json({
      message: "Role request submitted successfully. Your application is under review.",
      requestId: roleRequest._id,
      estimatedTime: "24-48 hours",
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get user's pending role requests
exports.getPendingRequests = async (req, res) => {
  try {
    const userId = req.user.id;

    const requests = await RoleRequest.find({ userId });

    res.json({
      requests,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get request status
exports.getRequestStatus = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user.id;

    const request = await RoleRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ error: "Request not found" });
    }

    if (request.userId.toString() !== userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const user = await User.findById(userId).select('-password');

    res.json({ request, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.user.id, req.body, {
      new: true,
    }).select("-password");
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

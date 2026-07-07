const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verify token middleware
exports.verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_secret_key');
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return res.status(401).json({ error: 'User not found' });

    req.user = {
      id: user._id.toString(),
      role: user.role,
      status: user.status,
      secondaryRoles: user.secondaryRoles || [],
    };
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Check vendor / partner role
exports.verifyVendor = (req, res, next) => {
  const partnerRoles = ['event-owner', 'catering', 'decoration', 'photography', 'mahal-owner', 'others'];

  if (
    req.user.role !== 'admin' &&
    req.user.role !== 'vendor' &&
    !req.user.secondaryRoles.some((role) => partnerRoles.includes(role))
  ) {
    return res.status(403).json({ error: 'Only approved partners can access this' });
  }
  next();
};

// Check admin role
exports.verifyAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

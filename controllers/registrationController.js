const RoleRequest = require('../models/RoleRequest');

// Create a new role registration (role request)
exports.createRoleRequest = async (req, res) => {
  try {
    const { requestedRole, formData, documents } = req.body;

    if (!requestedRole) {
      return res.status(400).json({ error: 'Requested role is required' });
    }

    // Prevent duplicate pending requests for same role
    const existing = await RoleRequest.findOne({ userId: req.user.id, requestedRole, status: 'pending' });
    if (existing) {
      return res.status(400).json({ error: 'You already have a pending application for this role' });
    }

    const roleRequest = new RoleRequest({
      userId: req.user.id,
      requestedRole,
      formData: formData || {},
      documents: Array.isArray(documents) ? documents : [],
      status: 'pending',
    });

    await roleRequest.save();

    res.status(201).json({ message: 'Role application submitted', roleRequest });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get role requests for the authenticated user
exports.getUserRoleRequests = async (req, res) => {
  try {
    const requests = await RoleRequest.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Withdraw (user-initiated) a pending role request
exports.withdrawRoleRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const request = await RoleRequest.findById(id);
    if (!request) return res.status(404).json({ error: 'Request not found' });
    if (request.userId.toString() !== req.user.id) return res.status(403).json({ error: 'Not authorized' });

    if (request.status !== 'pending') {
      return res.status(400).json({ error: 'Only pending requests can be withdrawn' });
    }

    request.status = 'rejected';
    request.rejectedAt = new Date();
    request.rejectionReason = 'Withdrawn by user';
    await request.save();

    res.json({ message: 'Request withdrawn', request });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const User = require('../models/User');
const RoleRequest = require('../models/RoleRequest');
const Event = require('../models/Event');
const Job = require('../models/Job');
const Registration = require('../models/Registration');

exports.getDashboard = async (req, res) => {
  try {
    const users = await User.find().select('name email role city createdAt').sort({ createdAt: -1 }).limit(20);
    const events = await Event.find().select('title category date capacity registrations status organizer').populate('organizer', 'name email').sort({ createdAt: -1 }).limit(20);
    const jobs = await Job.find().select('title company jobType applicationType location category postedBy createdAt').populate('postedBy', 'name email').sort({ createdAt: -1 }).limit(20);
    const registrations = await Registration.find().populate('user', 'name email').populate('event', 'title category').sort({ createdAt: -1 }).limit(20);

    // Get role requests counts
    const pendingRoleRequests = await RoleRequest.countDocuments({ status: 'pending' });
    const approvedRoleRequests = await RoleRequest.countDocuments({ status: 'approved' });
    const rejectedRoleRequests = await RoleRequest.countDocuments({ status: 'rejected' });

    const counts = {
      totalUsers: await User.countDocuments(),
      totalEvents: await Event.countDocuments(),
      totalJobs: await Job.countDocuments(),
      totalRegistrations: await Registration.countDocuments(),
      pendingRoleRequests,
      approvedRoleRequests,
      rejectedRoleRequests,
    };

    res.json({ counts, users, events, jobs, registrations });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all pending role requests
exports.getPendingRoleRequests = async (req, res) => {
  try {
    const requests = await RoleRequest.find({ status: 'pending' })
      .populate('userId', 'name email phone city')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all role requests with filters
exports.getAllRoleRequests = async (req, res) => {
  try {
    const { status, role, page = 1 } = req.query;
    const limit = 10;
    const skip = (page - 1) * limit;

    const filter = {};
    if (status) filter.status = status;
    if (role) filter.requestedRole = role;

    const total = await RoleRequest.countDocuments(filter);
    const requests = await RoleRequest.find(filter)
      .populate('userId', 'name email phone city')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      requests,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: page,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get request details
exports.getRoleRequestDetail = async (req, res) => {
  try {
    const { requestId } = req.params;

    const request = await RoleRequest.findById(requestId)
      .populate('userId', 'name email phone city');

    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    res.json(request);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Approve role request
exports.approveRoleRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { adminNotes } = req.body;

    const request = await RoleRequest.findByIdAndUpdate(
      requestId,
      {
        status: 'approved',
        approvedAt: new Date(),
        adminNotes,
      },
      { new: true }
    ).populate('userId');

    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    // Update user with approved role
    const user = await User.findByIdAndUpdate(
      request.userId._id,
      {
        $addToSet: { secondaryRoles: request.requestedRole },
      },
      { new: true }
    );

    res.json({
      message: 'Role request approved successfully',
      request,
      user,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Reject role request
exports.rejectRoleRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { rejectionReason } = req.body;

    if (!rejectionReason) {
      return res.status(400).json({ error: 'Rejection reason is required' });
    }

    const request = await RoleRequest.findByIdAndUpdate(
      requestId,
      {
        status: 'rejected',
        rejectedAt: new Date(),
        rejectionReason,
      },
      { new: true }
    ).populate('userId');

    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    // Save rejection reason to user
    await User.findByIdAndUpdate(
      request.userId._id,
      {
        rejectionReason,
      }
    );

    res.json({
      message: 'Role request rejected successfully',
      request,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

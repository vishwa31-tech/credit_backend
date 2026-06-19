const User = require('../models/User');
const Event = require('../models/Event');
const Job = require('../models/Job');
const Registration = require('../models/Registration');

exports.getDashboard = async (req, res) => {
  try {
    const users = await User.find().select('name email role city createdAt').sort({ createdAt: -1 }).limit(20);
    const events = await Event.find().select('title category date capacity registrations status organizer').populate('organizer', 'name email').sort({ createdAt: -1 }).limit(20);
    const jobs = await Job.find().select('title company jobType applicationType location category postedBy createdAt').populate('postedBy', 'name email').sort({ createdAt: -1 }).limit(20);
    const registrations = await Registration.find().populate('user', 'name email').populate('event', 'title category').sort({ createdAt: -1 }).limit(20);

    const counts = {
      totalUsers: await User.countDocuments(),
      totalEvents: await Event.countDocuments(),
      totalJobs: await Job.countDocuments(),
      totalRegistrations: await Registration.countDocuments(),
    };

    res.json({ counts, users, events, jobs, registrations });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

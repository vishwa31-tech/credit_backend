const Job = require('../models/Job');

// Get all jobs
exports.getAllJobs = async (req, res) => {
  try {
    const { category, location, jobType, search } = req.query;
    let query = {};

    if (category) query.category = category;
    if (location) query.location = { $regex: location, $options: 'i' };
    if (jobType) query.jobType = jobType;
    if (search) query.title = { $regex: search, $options: 'i' };

    const jobs = await Job.find(query).populate('postedBy', 'name email');
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single job
exports.getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate('postedBy');
    if (!job) return res.status(404).json({ error: 'Job not found' });
    res.json(job);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create job
exports.createJob = async (req, res) => {
  try {
    const job = new Job({
      ...req.body,
      postedBy: req.user.id,
    });
    await job.save();
    res.status(201).json(job);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

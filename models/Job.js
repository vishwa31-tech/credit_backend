const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    company: String,
    salary: {
      min: Number,
      max: Number,
      currency: String,
    },
    jobType: {
      type: String,
      enum: ['full-time', 'part-time', 'contract', 'freelance'],
      required: true,
    },
    applicationType: {
      type: String,
      enum: ['email', 'online', 'walk-in', 'portal'],
      default: 'online',
    },
    location: String,
    category: String,
    skills: [String],
    experience: String,
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    applications: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Job', jobSchema);

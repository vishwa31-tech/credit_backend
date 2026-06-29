const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: String,
    city: String,
    bio: String,
    avatar: String,
    // Primary role - default is customer
    role: {
      type: String,
      enum: ['customer', 'admin'],
      default: 'customer',
    },
    // Active secondary roles (approved partner roles)
    secondaryRoles: [
      {
        type: String,
        enum: ['event-owner', 'job-seeker', 'mahal-owner', 'catering', 'decoration', 'photography', 'others'],
      },
    ],
    // User profile status
    status: {
      type: String,
      enum: ['active', 'pending', 'rejected'],
      default: 'active',
    },
    // Role-specific documents/data
    businessDetails: {
      businessName: String,
      businessType: String,
      businessDescription: String,
      businessCategory: String,
      yearsOfExperience: Number,
      businessDocument: String, // URL to document
      businessImage: String,
    },
    jobDetails: {
      jobTitle: String,
      industry: String,
      experience: Number,
      skills: [String],
      resume: String, // URL to resume
    },
    cateringDetails: {
      businessName: String,
      cuisineTypes: [String],
      capacity: Number,
      priceRange: String,
      specialities: [String],
      cateringDocument: String,
    },
    decorationDetails: {
      businessName: String,
      themeTypes: [String],
      experience: Number,
      portfolio: String,
      specialities: [String],
    },
    // Rejection reason (if rejected)
    rejectionReason: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);

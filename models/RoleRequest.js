const mongoose = require('mongoose');

const roleRequestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    requestedRole: {
      type: String,
      enum: ['event-owner', 'job-seeker', 'mahal-owner', 'catering', 'decoration', 'photography', 'others'],
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    // Role-specific form data
    formData: {
      businessName: String,
      businessDescription: String,
      businessCategory: String,
      yearsOfExperience: Number,
      jobTitle: String,
      industry: String,
      skills: [String],
      cuisineTypes: [String],
      capacity: Number,
      priceRange: String,
      themeTypes: [String],
      specialities: [String],
      portfolio: String,
      additionalInfo: String,
    },
    // Documents
    documents: [
      {
        name: String,
        url: String,
      },
    ],
    // Admin notes
    adminNotes: String,
    // Decision details
    approvedAt: Date,
    rejectedAt: Date,
    rejectionReason: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('RoleRequest', roleRequestSchema);

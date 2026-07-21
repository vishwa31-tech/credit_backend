const mongoose = require('mongoose');

const serviceLeadSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    business: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Business',
      required: true,
    },
    businessName: String,
    serviceName: {
      type: String,
      required: true,
    },
    customerName: String,
    customerEmail: String,
    customerPhone: String,
    eventDate: Date,
    eventLocation: String,
    guestCount: Number,
    budget: Number,
    message: String,
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'completed'],
      default: 'pending',
    },
    adminNotes: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('ServiceLead', serviceLeadSchema);

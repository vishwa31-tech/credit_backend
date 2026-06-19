const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ['wedding', 'festival', 'party', 'conference', 'concert', 'sports', 'other'],
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    location: {
      address: String,
      city: String,
      state: String,
      zipCode: String,
    },
    image: String,
    price: {
      type: Number,
      default: 0,
    },
    capacity: Number,
    registrations: {
      type: Number,
      default: 0,
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    specialties: [
      {
        name: String,
        details: String,
      }
    ],
    sections: [
      {
        name: String,
        facilities: [String],
      }
    ],
    details: String,
    tags: [String],
    status: {
      type: String,
      enum: ['active', 'completed', 'cancelled'],
      default: 'active',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Event', eventSchema);

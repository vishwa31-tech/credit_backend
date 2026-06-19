const mongoose = require('mongoose');

const businessSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: String,
    category: {
      type: String,
      enum: ['catering', 'photography', 'venue', 'decoration', 'entertainment', 'florist', 'other'],
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    email: String,
    phone: String,
    address: String,
    city: String,
    website: String,
    image: String,
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviews: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        comment: String,
        rating: Number,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    services: [String],
    pricing: {
      minBudget: Number,
      maxBudget: Number,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Business', businessSchema);

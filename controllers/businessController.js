const Business = require('../models/Business');

// Get all businesses
exports.getAllBusinesses = async (req, res) => {
  try {
    const { category, city, search } = req.query;
    let query = {};

    if (category) query.category = category;
    if (city) query.city = city;
    if (search) query.name = { $regex: search, $options: 'i' };

    const businesses = await Business.find(query).populate('owner', 'name email');
    res.json(businesses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single business
exports.getBusinessById = async (req, res) => {
  try {
    const business = await Business.findById(req.params.id).populate('owner').populate('reviews.user', 'name avatar');
    if (!business) return res.status(404).json({ error: 'Business not found' });
    res.json(business);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create business
exports.createBusiness = async (req, res) => {
  try {
    const business = new Business({
      ...req.body,
      owner: req.user.id,
    });
    await business.save();
    res.status(201).json(business);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Add review to business
exports.addReview = async (req, res) => {
  try {
    const { comment, rating } = req.body;
    const business = await Business.findById(req.params.id);
    if (!business) return res.status(404).json({ error: 'Business not found' });

    business.reviews.push({
      user: req.user.id,
      comment,
      rating,
    });

    const totalRating = business.reviews.reduce((sum, r) => sum + r.rating, 0);
    business.rating = totalRating / business.reviews.length;

    await business.save();
    res.json(business);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

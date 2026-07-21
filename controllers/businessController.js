const Business = require('../models/Business');
const ServiceLead = require('../models/ServiceLead');

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

// Create a service booking lead for admin review
exports.createServiceLead = async (req, res) => {
  try {
    const business = await Business.findById(req.params.id);
    if (!business) return res.status(404).json({ error: 'Business not found' });

    const {
      serviceName,
      customerName,
      customerEmail,
      customerPhone,
      eventDate,
      eventLocation,
      guestCount,
      budget,
      message,
    } = req.body;

    if (!serviceName || !customerName || !customerEmail || !customerPhone) {
      return res.status(400).json({ error: 'Service name, customer name, email, and phone are required' });
    }

    const lead = await ServiceLead.create({
      user: req.user.id,
      business: business._id,
      businessName: business.name,
      serviceName,
      customerName,
      customerEmail,
      customerPhone,
      eventDate: eventDate ? new Date(eventDate) : undefined,
      eventLocation,
      guestCount,
      budget,
      message,
      status: 'pending',
    });

    res.status(201).json({
      message: 'Booking request submitted successfully. It has been sent to the admin for review.',
      lead,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all service leads for admin
exports.getServiceLeads = async (req, res) => {
  try {
    const leads = await ServiceLead.find().sort({ createdAt: -1 }).populate('user', 'name email').populate('business', 'name category');
    res.json(leads);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update service lead status by admin
exports.updateServiceLeadStatus = async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    const lead = await ServiceLead.findById(req.params.id);

    if (!lead) return res.status(404).json({ error: 'Lead not found' });

    lead.status = status || lead.status;
    if (adminNotes !== undefined) lead.adminNotes = adminNotes;
    await lead.save();

    res.json({ message: 'Lead status updated', lead });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

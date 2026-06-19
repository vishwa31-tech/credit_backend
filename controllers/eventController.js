const Event = require('../models/Event');

// Get all events
exports.getAllEvents = async (req, res) => {
  try {
    const { category, city, search } = req.query;
    let query = { status: 'active' };

    if (category) query.category = category;
    if (city) query['location.city'] = city;
    if (search) query.title = { $regex: search, $options: 'i' };

    const events = await Event.find(query).populate('organizer', 'name email');
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single event
exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('organizer');
    if (!event) return res.status(404).json({ error: 'Event not found' });
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create event
exports.createEvent = async (req, res) => {
  try {
    const event = new Event({
      ...req.body,
      organizer: req.user.id,
    });
    await event.save();
    res.status(201).json(event);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update event
exports.updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });
    if (event.organizer.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    Object.assign(event, req.body);
    await event.save();
    res.json(event);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete event
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });
    if (event.organizer.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    await Event.deleteOne({ _id: req.params.id });
    res.json({ message: 'Event deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

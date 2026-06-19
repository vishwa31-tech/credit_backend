const Registration = require('../models/Registration');
const Event = require('../models/Event');

// Register user for event
exports.registerForEvent = async (req, res) => {
  try {
    const { eventId, ticketCount, specialty, section, selectedFacilities } = req.body;

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ error: 'Event not found' });
    if (event.capacity && event.registrations + ticketCount > event.capacity) {
      return res.status(400).json({ error: 'Not enough seats available' });
    }

    const existingRegistration = await Registration.findOne({
      user: req.user.id,
      event: eventId,
    });

    if (existingRegistration) {
      return res.status(400).json({ error: 'Already registered for this event' });
    }

    const registration = new Registration({
      user: req.user.id,
      event: eventId,
      ticketCount,
      specialty,
      section,
      selectedFacilities,
      totalPrice: ticketCount * event.price,
      paymentStatus: 'completed',
    });

    await registration.save();
    event.registrations += ticketCount;
    await event.save();

    res.status(201).json(registration);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get user registrations
exports.getUserRegistrations = async (req, res) => {
  try {
    const registrations = await Registration.find({ user: req.user.id })
      .populate('event')
      .sort({ createdAt: -1 });
    res.json(registrations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Cancel registration
exports.cancelRegistration = async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.id);
    if (!registration) {
      return res.status(404).json({ error: 'Registration not found' });
    }

    if (registration.user.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    registration.registrationStatus = 'cancelled';
    await registration.save();
    res.json(registration);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

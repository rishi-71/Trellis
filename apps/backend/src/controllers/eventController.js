const Event = require("../models/Event");

// Create event (Faculty / Admin only)
exports.createEvent = async (req, res) => {
  try {
    const { title, description, date, venue, registrationDeadline, maxParticipants, posterUrl } = req.body;
    
    if (!title || !description || !date || !venue || !registrationDeadline) {
      return res.status(400).json({ success: false, message: "Please provide all required fields" });
    }
    
    const event = new Event({
      title,
      description,
      organizer: req.user.id,
      date,
      venue,
      registrationDeadline,
      maxParticipants,
      posterUrl
    });
    
    await event.save();
    
    res.status(201).json({ success: true, message: "Event created successfully", event });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get all events
exports.getAllEvents = async (req, res) => {
  try {
    const events = await Event.find().populate("organizer", "email");
    res.json({ success: true, events });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get single event details
exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate("organizer", "email")
      .populate("registeredParticipants", "email")
      .populate("attendedParticipants", "email");
      
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }
    
    res.json({ success: true, event });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Register for an event (Student only)
exports.registerForEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }
    
    // Check registration deadline
    if (new Date() > new Date(event.registrationDeadline)) {
      return res.status(400).json({ success: false, message: "Registration deadline has passed" });
    }
    
    // Check capacity
    if (event.maxParticipants && event.registeredParticipants.length >= event.maxParticipants) {
      return res.status(400).json({ success: false, message: "Event is fully registered" });
    }
    
    // Check if already registered
    if (event.registeredParticipants.includes(req.user.id)) {
      return res.status(400).json({ success: false, message: "You are already registered for this event" });
    }
    
    event.registeredParticipants.push(req.user.id);
    await event.save();
    
    res.json({ success: true, message: "Registered for event successfully", event });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Mark event attendance (Faculty/Admin only)
exports.markAttendance = async (req, res) => {
  try {
    const { studentId } = req.body;
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }
    
    // Verify student is registered
    if (!event.registeredParticipants.includes(studentId)) {
      return res.status(400).json({ success: false, message: "Student is not registered for this event" });
    }
    
    // Check if attendance already marked
    if (event.attendedParticipants.includes(studentId)) {
      return res.status(400).json({ success: false, message: "Attendance already marked for this student" });
    }
    
    event.attendedParticipants.push(studentId);
    await event.save();
    
    res.json({ success: true, message: "Attendance marked successfully", event });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

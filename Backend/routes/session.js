const express = require('express');
const router = express.Router();
const Session = require('../models/Session');
const Subject = require('../models/Subject');
const { protect, authorizeRoles } = require('../middleware/auth');


//Create a session (Lecturer only)
router.post('/', protect, authorizeRoles('lecturer'), async (req, res) => {
  try {
    const {
      subjectId,
      date,
      startTime,
      endTime,
      topic,
      venue,
      description
    } = req.body;

    // Validate required fields
    if (!subjectId || !date || !startTime || !endTime || !topic || !venue) {
      return res.status(400).json({
        message: 'Subject, date, start time, end time, topic and venue are required'
      });
    }

    // Check subject ownership
    const subject = await Subject.findOne({
      _id: subjectId,
      lecturer: req.user.id
    });

    if (!subject) {
      return res.status(403).json({
        message: 'Not authorized for this subject'
      });
    }

    // Create session
    const session = await Session.create({
      subject: subjectId,
      date,
      startTime,
      endTime,
      topic: topic.trim(),
      venue: venue.trim(),
      description: description?.trim() || '',
      createdBy: req.user.id
    });

    res.status(201).json(session);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// Get a single session by ID (Lecturer only)
router.get(
  "/:id",
  protect,
  authorizeRoles("lecturer"),
  async (req, res) => {
    try {
      const session = await Session.findById(req.params.id)
        .populate("subject", "name code");

      if (!session) {
        return res.status(404).json({
          message: "Session not found",
        });
      }

      // Ensure the lecturer owns this session's subject
      const subject = await Subject.findOne({
        _id: session.subject._id,
        lecturer: req.user.id,
      });

      if (!subject) {
        return res.status(403).json({
          message: "Not authorized for this session",
        });
      }

      res.status(200).json(session);
    } catch (err) {
      if (err.name === "CastError") {
        return res.status(400).json({
          message: "Invalid session ID",
        });
      }

      res.status(500).json({ message: err.message });
    }
  }
);


//Get all sessions for a subject (Lecturer and Student)
router.get('/subject/:subjectId', protect, async (req, res) => {
  try {
    const sessions = await Session.find({ subject: req.params.subjectId })
      .sort({ date: -1 });
    res.status(200).json(sessions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});



// Delete a session (Lecturer only)
router.delete('/:id', protect, authorizeRoles('lecturer'), async (req, res) => {
  try {
    await Session.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Session deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
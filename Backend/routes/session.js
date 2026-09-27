const express = require('express');
const router = express.Router();
const Session = require('../models/Session');
const Subject = require('../models/Subject');
const { protect, authorizeRoles } = require('../middleware/auth');


//Create a session (Lecturer only)
router.post('/', protect, authorizeRoles('lecturer'), async (req, res) => {
  try {
    const { subjectId, date, startTime, endTime, topic } = req.body;

    const subject = await Subject.findOne({ _id: subjectId, lecturer: req.user.id });
    if (!subject) {
      return res.status(403).json({ message: 'Not authorized for this subject' });
    }

    const session = await Session.create({
      subject: subjectId,
      date,
      startTime,
      endTime,
      topic,
      createdBy: req.user.id
    });

    res.status(201).json(session);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});



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
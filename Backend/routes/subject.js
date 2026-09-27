const express = require('express');
const router = express.Router();
const Subject = require('../models/Subject');
const { protect, authorizeRoles } = require('../middleware/auth');


const generateEnrollmentKey = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};


//Create a subject (Admin only)
router.post('/', protect, authorizeRoles('admin'), async (req, res) => {
  try {
    const { name, code, lecturerId } = req.body;

    // Check if lecturer exists
    if (!lecturerId) {
      return res.status(400).json({ message: 'Lecturer ID is required' });
    }

    const subject = await Subject.create({
      name,
      code,
      enrollmentKey: generateEnrollmentKey(),
      lecturer: lecturerId
    });

    res.status(201).json(subject);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
});


//Get all subjects (Admin only)
router.get('/', protect, authorizeRoles('admin'), async (req, res) => {
  try {
    const subjects = await Subject.find()
      .populate('lecturer', 'name email')
      .populate('enrolledStudents', 'name email');
    res.status(200).json(subjects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});



//Get subjects for logged in lecturer
router.get('/my', protect, authorizeRoles('lecturer'), async (req, res) => {
  try {
    const subjects = await Subject.find({ lecturer: req.user.id })
      .populate('enrolledStudents', 'name email studentId');
    res.status(200).json(subjects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});



//Get subjects for logged in student
router.get('/viewEnrolled', protect, authorizeRoles('student'), async (req, res) => {
  try {
    const subjects = await Subject.find({ enrolledStudents: req.user.id })
      .populate('lecturer', 'name email');
    res.status(200).json(subjects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});



//Student joins a subject using enrollment key
router.post('/enrol', protect, authorizeRoles('student'), async (req, res) => {
  try {
    const { enrollmentKey } = req.body;

    const subject = await Subject.findOne({ enrollmentKey });
    if (!subject) {
      return res.status(404).json({ message: 'Invalid enrollment key' });
    }

    if (subject.enrolledStudents.includes(req.user.id)) {
      return res.status(400).json({ message: 'Already enrolled in this subject' });
    }

    subject.enrolledStudents.push(req.user.id);
    await subject.save();

    res.status(200).json({ message: 'Successfully enrolled in subject', subject });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});



//Delete a subject (Admin only)
router.delete('/:id', protect, authorizeRoles('admin'), async (req, res) => {
  try {
    await Subject.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Subject deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
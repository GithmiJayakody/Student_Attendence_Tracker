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
    const User = require('../models/User');

    //Validate required fields
    if (!name|| !name.trim() || !code || !code.trim() || !lecturerId || !lecturerId.trim()) {
      return res.status(400).json({ 
        message: 'Subject name, code, and lecturer ID are required' });
    }

    //Validate approved lecturer
    const lecturer = await User.findOne({
      _id: lecturerId,
      role: 'lecturer',
      approvalStatus: 'approved'
    });

    // Check if lecturer exists
    if (!lecturer) {
      return res.status(400).json({ 
        message: 'Valid approved lecturer not found' });
    }

    //Create subject with unique enrollment key
    const subject = await Subject.create({
      name: name.trim(),
      code: code.trim(),
      enrollmentKey: generateEnrollmentKey(),
      lecturer: lecturerId
    });


    res.status(201).json(subject);
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ 
        message: 'Invalid lecturer ID' 
      });
    }

    if (err.code === 11000) {
      return res.status(400).json({ 
        message: 'Subject code or enrollment key already exists' 
      });
    }

    if (err.name === 'ValidationError') {
      return res.status(400).json({ 
        message: err.message 
      });
    }

    console.log(err);
    res.status(500).json({ message: 'Failed to create subject' });
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


// Update a subject (Admin only)
router.put('/:id', protect, authorizeRoles('admin'), async (req, res) => {
  try {
    const { name, code, lecturerId } = req.body;

    const subject = await Subject.findById(req.params.id);

    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    if (name !== undefined) subject.name = name.trim();
    if (code !== undefined) subject.code = code.trim();

    if (lecturerId !== undefined) {
      const User = require('../models/User');

      const lecturer = await User.findOne({
        _id: lecturerId,
        role: 'lecturer',
        approvalStatus: 'approved'
      });

      if (!lecturer) {
        return res.status(400).json({
          message: 'Valid approved lecturer not found'
        });
      }

      subject.lecturer = lecturer._id;
    }

    await subject.save();

    const updatedSubject = await subject.populate(
      'lecturer',
      'name email'
    );

    res.status(200).json({
      message: 'Subject updated successfully',
      subject: updatedSubject
    });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid subject or lecturer ID' });
    }

    if (err.code === 11000) {
      return res.status(400).json({ message: 'Subject code already exists' });
    }

    res.status(500).json({ message: 'Failed to update subject' });
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
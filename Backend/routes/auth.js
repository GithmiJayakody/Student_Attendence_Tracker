const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');


//register a new user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, studentId, lecturerId } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        message: 'Please provide name, email, password, and role',
      });
    }

    if (!['student', 'lecturer'].includes(role)) {
      return res.status(400).json({
        message: 'Invalid registration role',
      });
    }

    if (role === 'student' && !studentId) {
      return res.status(400).json({
        message: 'Student ID is required',
      });
    }

    if (role === 'lecturer' && !lecturerId) {
      return res.status(400).json({
        message: 'Lecturer ID is required',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({ 
      email: normalizedEmail 
    });
    if (existingUser) {
      return res.status(400).json({ 
        message: 'User already exists' 
      });
    }


    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);


    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role,
      studentId: role === 'student' ? studentId.trim() : undefined,
      lecturerId: role === 'lecturer' ? lecturerId.trim() : undefined,
      approvalStatus: 'pending'
    });


    res.status(201).json({
      message: 'Registration successful. Your account is pending for admin approval.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        approvalStatus: user.approvalStatus
      },
    });

  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ 
        message: 'Email or ID already exists' 
      });
    }

    res.status(500).json({ 
      message: 'Registration failed', 
    });
  }
});



//Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        message: 'Email and password are required' 
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({ 
      email: normalizedEmail 
    });

    if (!user) {
      return res.status(400).json({ 
        message: 'Invalid credentials' 
      });
    }


    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ 
        message: 'Invalid login credentials' 
      });
    }

    if (user.approvalStatus !== 'approved') {
      if (user.approvalStatus === 'rejected') {
        return res.status(403).json({
          message: 'Your registration was rejected. Please contact the administrator.',
        });
      }

      return res.status(403).json({
        message: 'Your account is awaiting admin approval.',
      });
    }


    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (err) {
    res.status(500).json({ 
      message: 'Login failed', 
    });
  }
});


// Get current user's profile
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');

    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    res.status(200).json({
      id: user._id,
      name: user.name,
      email: user.email,
      lecturerId: user.lecturerId,
      studentId: user.studentId,
      role: user.role,
      approvalStatus: user.approvalStatus
    });
  } catch (err) {
    res.status(500).json({
      message: 'Failed to load profile'
    });
  }
});


// Update current user's name
router.put('/profile', protect, async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        message: 'Name is required'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name: name.trim() },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    res.status(200).json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        lecturerId: user.lecturerId,
        studentId: user.studentId,
        role: user.role,
        approvalStatus: user.approvalStatus
      }
    });
  } catch (err) {
    res.status(500).json({
      message: 'Failed to update profile'
    });
  }
});


// Change current user's password
router.put('/change-password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: 'Current password and new password are required'
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        message: 'New password must be at least 8 characters long'
      });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    const isMatch = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isMatch) {
      return res.status(400).json({
        message: 'Current password is incorrect'
      });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    await user.save();

    res.status(200).json({
      message: 'Password changed successfully'
    });
  } catch (err) {
    res.status(500).json({
      message: 'Failed to change password'
    });
  }
});

module.exports = router;
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');


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

module.exports = router;
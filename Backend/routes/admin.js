const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

const User = require('../models/User');
const { protect, authorizeRoles } = require('../middleware/auth');

// Get all registrations awaiting admin approval
router.get(
  '/pending-users',
  protect,
  authorizeRoles('admin'),
  async (req, res) => {
    try {
      const users = await User.find({ approvalStatus: 'pending' })
        .select('-password')
        .sort({ createdAt: -1 });

      res.status(200).json({ users });
    } catch (err) {
      res.status(500).json({ message: 'Failed to retrieve pending users' });
    }
  }
);


// Approve a student or lecturer registration
router.patch(
  '/approve/:id',
  protect,
  authorizeRoles('admin'),
  async (req, res) => {
    try {
      if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({ message: 'Invalid user ID' });
      }

      const user = await User.findById(req.params.id);

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      if (!['student', 'lecturer'].includes(user.role)) {
        return res.status(400).json({
          message: 'Only student and lecturer registrations can be approved',
        });
      }

      if (user.approvalStatus === 'rejected') {
        return res.status(400).json({
          message: 'This registration was rejected and cannot be approved directly',
        });
      }

      user.approvalStatus = 'approved';
      await user.save();

      res.status(200).json({
        message: 'Registration approved successfully',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          approvalStatus: user.approvalStatus,
        },
      });
    } catch (err) {
      res.status(500).json({ message: 'Failed to approve registration' });
    }
  }
);


// Get all registered users for User Management
router.get(
  '/users',
  protect,
  authorizeRoles('admin'),
  async (req, res) => {
    try {
      const users = await User.find({})
        .select('-password')
        .sort({ createdAt: -1 });

      res.status(200).json({ users });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        message: 'Failed to retrieve users',
      });
    }
  }
);


 // Get approved lecturers for subject assignment
router.get(
  '/approved-lecturers',
  protect,
  authorizeRoles('admin'),
  async (req, res) => {
    try {
      const lecturers = await User.find({
        role: 'lecturer',
        approvalStatus: 'approved',
      })
        .select('name email lecturerId')
        .sort({ name: 1 });

      res.status(200).json({ lecturers });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        message: 'Failed to retrieve approved lecturers',
      });
    }
  }
);


// Get admin dashboard statistics
router.get(
  "/dashboard-stats",
  protect,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const [registeredStudents, pendingApprovals, totalUsers] = await Promise.all([
        User.countDocuments({
          role: "student",
          approvalStatus: "approved",
        }),
        User.countDocuments({
          approvalStatus: "pending",
          role: { $in: ["student", "lecturer"] },
        }),
        User.countDocuments(),
      ]);

      res.status(200).json({
        registeredStudents,
        pendingApprovals,
        totalUsers,
    });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        message: "Failed to retrieve dashboard statistics",
      });
    }
  }
);


// Reject a student or lecturer registration
router.patch(
  '/reject/:id',
  protect,
  authorizeRoles('admin'),
  async (req, res) => {
    try {
      if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({ message: 'Invalid user ID' });
      }

      const user = await User.findById(req.params.id);

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      if (!['student', 'lecturer'].includes(user.role)) {
        return res.status(400).json({
          message: 'Only student and lecturer registrations can be rejected',
        });
      }

      user.approvalStatus = 'rejected';
      await user.save();

      res.status(200).json({
        message: 'Registration rejected successfully',
      });
    } catch (err) {
      res.status(500).json({ message: 'Failed to reject registration' });
    }
  }
);



const bcrypt = require('bcryptjs');

// Create a new admin account (existing admin only)
router.post(
  '/create-admin',
  protect,
  authorizeRoles('admin'),
  async (req, res) => {
    try {
      const { name, email, password } = req.body;

      if (!name?.trim() || !email?.trim() || !password) {
        return res.status(400).json({
          message: 'Name, email and password are required',
        });
      }

      if (password.length < 8) {
        return res.status(400).json({
          message: 'Password must contain at least 8 characters',
        });
      }

      const normalizedEmail = email.trim().toLowerCase();

      const existingUser = await User.findOne({
        email: normalizedEmail,
      });

      if (existingUser) {
        return res.status(409).json({
          message: 'An account with this email already exists',
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const admin = await User.create({
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        role: 'admin',
        approvalStatus: 'approved',
      });

      res.status(201).json({
        message: 'Admin account created successfully',
        admin: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
        },
      });
    } catch (err) {
      if (err.code === 11000) {
        return res.status(409).json({
          message: 'An account with this email already exists',
        });
      }

      console.error(err);
      res.status(500).json({
        message: 'Failed to create admin account',
      });
    }
  }
);


module.exports = router;

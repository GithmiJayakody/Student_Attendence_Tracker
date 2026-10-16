
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

module.exports = router;

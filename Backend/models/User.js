const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },

  password: {
    type: String,
    required: true
  },
  
  role: {
    type: String,
    enum: ['student', 'lecturer', 'admin'],
    required: true
  },
  
  studentId: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },

  lecturerId: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },

  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
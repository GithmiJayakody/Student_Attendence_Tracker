const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },

  code: {
    type: String,
    required: true,
    unique: true
  },

  enrollmentKey: {
    type: String,
    required: true,
    unique: true
  },

  lecturer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  enrolledStudents: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('Subject', subjectSchema);
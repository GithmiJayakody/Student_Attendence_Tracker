const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Subject name is required'],
    trim: true,
    minlength: [2, 'Subject name must contain at least 2 characters']
  },

  code: {
    type: String,
    required: [true, 'Subject code is required'],
    trim: true,
    uppercase: true,
    unique: true
  },

  enrollmentKey: {
    type: String,
    required: [true, 'Enrollment key is required'],
    unique: true
  },

  lecturer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Lecturer is required'],
    trim: true
  },

  enrolledStudents: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('Subject', subjectSchema);
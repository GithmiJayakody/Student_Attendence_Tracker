const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const Session = require('../models/Session');
const Subject = require('../models/Subject');
const { protect, authorizeRoles } = require('../middleware/auth');



//Mark attendance for a session (Lecturer only)
router.post('/:sessionId', protect, authorizeRoles('lecturer'), async (req, res) => {
  try {
    const { attendanceData } = req.body;

    const session = await Session.findById(req.params.sessionId);
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    const attendanceRecords = await Promise.all(
      attendanceData.map(async (record) => {
        return await Attendance.findOneAndUpdate(
          { session: req.params.sessionId, student: record.studentId },
          {
            session: req.params.sessionId,
            student: record.studentId,
            subject: session.subject,
            status: record.status,
            markedBy: req.user.id
          },
          { upsert: true, new: true }
        );
      })
    );

    res.status(200).json({ message: 'Attendance marked successfully', attendanceRecords });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});



//Get attendance for a session (Lecturer only)
router.get('/session/:sessionId', protect, authorizeRoles('lecturer'), async (req, res) => {
  try {
    const attendance = await Attendance.find({ session: req.params.sessionId })
      .populate('student', 'name email studentId');
    res.status(200).json(attendance);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});



// Get student's own attendance for a subject
router.get('/my/:subjectId', protect, authorizeRoles('student'), async (req, res) => {
  try {
    const attendance = await Attendance.find({
      student: req.user.id,
      subject: req.params.subjectId
    }).populate('session', 'date startTime endTime topic');

    const totalSessions = await Session.countDocuments({ subject: req.params.subjectId });
    const presentCount = attendance.filter(a => a.status === 'present' || a.status === 'late').length;
    const percentage = totalSessions > 0 ? ((presentCount / totalSessions) * 100).toFixed(1) : 0;

    res.status(200).json({
      attendance,
      totalSessions,
      presentCount,
      percentage,
      warning: percentage < 80
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});




 // Get attendance summary for all students in a subject (Lecturer)
router.get(
  '/summary/:subjectId',
  protect,
  authorizeRoles('lecturer'),
  async (req, res) => {
    try {
      const subject = await Subject.findById(req.params.subjectId)
        .populate('enrolledStudents', 'name email studentId');

      if (!subject) {
        return res.status(404).json({
          message: 'Subject not found'
        });
      }

      const totalSessions = await Session.countDocuments({
        subject: req.params.subjectId
      });

      const summary = await Promise.all(
        subject.enrolledStudents.map(async (student) => {
          const [presentCount, absentCount, lateCount] =
            await Promise.all([
              Attendance.countDocuments({
                subject: req.params.subjectId,
                student: student._id,
                status: 'present'
              }),

              Attendance.countDocuments({
                subject: req.params.subjectId,
                student: student._id,
                status: 'absent'
              }),

              Attendance.countDocuments({
                subject: req.params.subjectId,
                student: student._id,
                status: 'late'
              })
            ]);

          // Present and late both count as attended
          const attendedCount = presentCount + lateCount;

          const percentage =
            totalSessions > 0
              ? ((attendedCount / totalSessions) * 100).toFixed(1)
              : '0.0';

          return {
            student: {
              id: student._id,
              name: student.name,
              email: student.email,
              studentId: student.studentId
            },
            totalSessions,
            presentCount,
            absentCount,
            lateCount,
            percentage,
            warning: Number(percentage) < 80
          };
        })
      );

      res.status(200).json(summary);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);


module.exports = router;
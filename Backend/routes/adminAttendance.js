const express = require("express");
const router = express.Router();

const Attendance = require("../models/Attendance");
const Session = require("../models/Session");
const Subject = require("../models/Subject");
const { protect, authorizeRoles } = require("../middleware/auth");

// Admin attendance analytics
router.get(
  "/overview",
  protect,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const [
        totalSessions,
        totalSubjects,
        attendanceRecords,
        subjectSessions,
      ] = await Promise.all([
        Session.countDocuments(),
        Subject.countDocuments(),
        Attendance.find()
          .populate("subject", "name code")
          .populate("session", "date topic"),
        Subject.find().select("name code"),
      ]);

      const presentCount = attendanceRecords.filter(
        (record) => record.status === "present"
      ).length;

      const absentCount = attendanceRecords.filter(
        (record) => record.status === "absent"
      ).length;

      const lateCount = attendanceRecords.filter(
        (record) => record.status === "late"
      ).length;

      const totalRecords = attendanceRecords.length;

      const attendanceRate =
        totalRecords > 0
          ? Number(
              (((presentCount + lateCount) / totalRecords) * 100).toFixed(1)
            )
          : 0;

      const subjectStats = subjectSessions.map((subject) => {
        const records = attendanceRecords.filter(
          (record) =>
            record.subject &&
            record.subject._id.toString() === subject._id.toString()
        );

        const attended = records.filter(
          (record) =>
            record.status === "present" || record.status === "late"
        ).length;

        return {
          subjectId: subject._id,
          subjectName: subject.name,
          subjectCode: subject.code,
          totalRecords: records.length,
          attendanceRate:
            records.length > 0
              ? Number(((attended / records.length) * 100).toFixed(1))
              : null,
        };
      });

      res.status(200).json({
        totalSessions,
        totalSubjects,
        totalRecords,
        presentCount,
        absentCount,
        lateCount,
        attendanceRate,
        subjectStats,
      });
    } catch (err) {
      res.status(500).json({
        message: err.message,
      });
    }
  }
);

module.exports = router;
const Student = require("../models/student");
const Attendance = require("../models/attendance");

// today's date in India time, format YYYY-MM-DD
const getToday = () =>
  new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });

// GET /api/attendance/today
exports.getTodayAttendance = async (req, res) => {
  try {
    const date = getToday();
    const students = await Student.find().sort({ name: 1 });
    const record = await Attendance.findOne({ date });
    const presentIds = record
      ? record.presentStudents.map((id) => String(id))
      : [];
    res.json({ date, students, presentIds });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/attendance/today   body: { studentIds: [ ... ] }
exports.saveTodayAttendance = async (req, res) => {
  try {
    const date = getToday();
    const studentIds = Array.isArray(req.body.studentIds)
      ? req.body.studentIds
      : [];
    const record = await Attendance.findOneAndUpdate(
      { date },
      { presentStudents: studentIds },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.json({
      message: "Attendance saved",
      date,
      count: record.presentStudents.length,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

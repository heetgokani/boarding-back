const Student = require("../models/student");
const Attendance = require("../models/attendance");

// today's date in India time, format YYYY-MM-DD
const getToday = () =>
  new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });

// GET /api/attendance/today
exports.getTodayAttendance = async (req, res) => {
  try {
    const date = getToday();

    const students = await Student.find();
    students.sort((a, b) =>
      a.studentId.localeCompare(b.studentId, undefined, { numeric: true })
    );

    // only keep ids of students that still exist (ignores deleted students)
    const validIds = new Set(students.map((s) => String(s._id)));
    const record = await Attendance.findOne({ date });
    const presentIds = record
      ? record.presentStudents
          .map((id) => String(id))
          .filter((id) => validIds.has(id))
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
    const requested = Array.isArray(req.body.studentIds)
      ? req.body.studentIds
      : [];

    // save only ids of students that really exist
    const existing = await Student.find({ _id: { $in: requested } }).select(
      "_id"
    );
    const studentIds = existing.map((s) => s._id);

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

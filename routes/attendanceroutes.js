const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  getTodayAttendance,
  saveTodayAttendance,
} = require("../controllers/attendancecontroller");

router.get("/today", auth, getTodayAttendance);
router.put("/today", auth, saveTodayAttendance);

module.exports = router;

const express = require("express");
const multer = require("multer");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  getStudents,
  createStudent,
  updateStudent,
  deleteStudent,
  importStudents,
  exportStudents,
} = require("../controllers/studentcontroller");

const upload = multer({ storage: multer.memoryStorage() });

router.get("/export", auth, exportStudents);
router.post("/import", auth, upload.single("file"), importStudents);
router.get("/", auth, getStudents);
router.post("/", auth, createStudent);
router.put("/:id", auth, updateStudent);
router.delete("/:id", auth, deleteStudent);
//test
module.exports = router;

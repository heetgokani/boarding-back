const ExcelJS = require("exceljs");
const Student = require("../models/student");

// GET /api/students
exports.getStudents = async (req, res) => {
  try {
    const students = await Student.find().sort({ name: 1 });
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/students  (manual)
exports.createStudent = async (req, res) => {
  try {
    const name = (req.body.name || "").trim();
    const studentId = String(req.body.studentId || "").trim();
    if (!name || !studentId) {
      return res.status(400).json({ message: "Name and ID are required" });
    }
    const student = await Student.create({ name, studentId });
    res.status(201).json(student);
  } catch (err) {
    if (err.code === 11000) {
      return res
        .status(400)
        .json({ message: "This student ID already exists" });
    }
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/students/:id
exports.deleteStudent = async (req, res) => {
  try {
    await Student.findByIdAndDelete(req.params.id);
    res.json({ message: "Student deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/students/import  (excel: col A = Student Name, col B = Student ID)
exports.importStudents = async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ message: "Please upload an Excel file" });

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(req.file.buffer);
    const sheet = workbook.worksheets[0];
    if (!sheet)
      return res.status(400).json({ message: "Excel sheet is empty" });

    const rows = [];
    sheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // header
      const name = String(row.getCell(1).text || "").trim();
      const studentId = String(row.getCell(2).text || "").trim();
      if (name && studentId) rows.push({ name, studentId });
    });

    if (rows.length === 0) {
      return res.status(400).json({ message: "No valid rows found in Excel" });
    }

    const ops = rows.map((r) => ({
      updateOne: {
        filter: { studentId: r.studentId },
        update: { $setOnInsert: { name: r.name, studentId: r.studentId } },
        upsert: true,
      },
    }));

    const result = await Student.bulkWrite(ops, { ordered: false });
    const added = result.upsertedCount || 0;
    res.json({
      message: `${added} students added, ${
        rows.length - added
      } skipped (ID already exists)`,
      added,
      skipped: rows.length - added,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/students/export
exports.exportStudents = async (req, res) => {
  try {
    const students = await Student.find().sort({ name: 1 });
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Students");
    sheet.columns = [
      { header: "Student Name", key: "name", width: 35 },
      { header: "Student ID", key: "studentId", width: 20 },
    ];
    sheet.getRow(1).font = { bold: true };
    students.forEach((s) =>
      sheet.addRow({ name: s.name, studentId: s.studentId })
    );

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", "attachment; filename=students.xlsx");
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

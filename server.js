require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();
app.use(
  cors({
    origin: ["https://boarding-front.vercel.app", "http://localhost:5173"],
  })
);
app.use(express.json());

// health check (for uptime bot)
app.get("/", (req, res) => {
  res.status(200).send("Server is running");
});

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", time: new Date().toISOString() });
});

app.use("/api/auth", require("./routes/authroutes"));
app.use("/api/students", require("./routes/studentroutes"));
app.use("/api/attendance", require("./routes/attendanceroutes"));

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});

const express = require("express");
const router = express.Router();
const { entrance, login } = require("../controllers/authcontroller");

router.post("/entrance", entrance);
router.post("/login", login);

module.exports = router;

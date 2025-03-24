require("dotenv").config();
const express = require("express");
const { registerUser, loginUser } = require("../controllers/authController");
const router = express.Router();

// Serve the login page
router.get("/login", (req, res) => {
  res.render("login", { siteKey: process.env.RECAPTCHA_SITE_KEY });
});

// Serve the registration page
router.get("/register", (req, res) => {
  res.render("register");
});

router.post("/register", registerUser);
router.post("/login", loginUser);

module.exports = router;

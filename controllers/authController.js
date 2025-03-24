const bcrypt = require("bcrypt");
const axios = require("axios");
const jwt = require("jsonwebtoken");
const { pool } = require("../config/db");

exports.registerUser = async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).send("All fields are required.");
  }

  try {
    // Check if email or username already exists
    const existingUser = await pool.query("SELECT * FROM users WHERE email = $1 OR username = $2", [email, username]);
    if (existingUser.rows.length > 0) {
      return res.status(400).send("Username or Email already exists.");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user into database
    await pool.query(
      "INSERT INTO users (username, email, password) VALUES ($1, $2, $3)",
      [username, email, hashedPassword]
    );

    res.redirect("/auth/login");
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error. Please try again later.");
  }
};

exports.loginUser = async (req, res) => {
  const { username, password, "g-recaptcha-response": recaptchaToken } = req.body;

  if (!username || !password || !recaptchaToken) {
    return res.status(400).send("All fields are required.");
  }

  try {
    // Verify reCAPTCHA
    const recaptchaResponse = await axios.post(
      "https://www.google.com/recaptcha/api/siteverify",
      null,
      {
        params: {
          secret: process.env.RECAPTCHA_SECRET_KEY,
          response: recaptchaToken
        }
      }
    );

    if (!recaptchaResponse.data.success) {
      return res.status(400).send("Invalid reCAPTCHA. Please try again.");
    }

    // Check if user exists
    const userQuery = await pool.query(
      "SELECT * FROM users WHERE username = $1 OR email = $1",
      [username]
    );
    
    if (userQuery.rows.length === 0) {
      return res.status(400).send("Invalid username or password.");
    }
    

    const user = userQuery.rows[0];

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).send("Invalid username or password.");
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    // Set cookie and respond
    res.cookie("token", token, { httpOnly: true });
    res.redirect("/profile");
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error. Please try again later.");
  }
};

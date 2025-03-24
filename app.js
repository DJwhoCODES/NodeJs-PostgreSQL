// server.js - Entry point
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const path = require("path");
const { Pool } = require("pg");

// Initialize Express
const app = express();
const PORT = process.env.PORT || 3000;

// Database Connection
const pool = new Pool({ connectionString: process.env.DB_URL });

pool.connect()
  .then(() => console.log("Connected to PostgreSQL"))
  .catch((err) => console.error("Database connection error:", err));

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
  secret: process.env.JWT_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Set to true if using HTTPS
}));

// Set up EJS as template engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Routes Placeholder
app.get("/", (req, res) => res.send("Welcome to Auth System"));

// Start Server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

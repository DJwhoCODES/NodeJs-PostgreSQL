// server.js - Entry point
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const path = require("path");
const authRoutes = require("./routes/authRoutes");
const { authenticateUser } = require("./middleware/authMiddleware");
const { pool } = require("./config/db");

// Initialize Express
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
// app.use(session({
//   secret: process.env.JWT_SECRET,
//   resave: false,
//   saveUninitialized: false,
//   cookie: { secure: false } // Set to true if using HTTPS
// }));

// Set up EJS as template engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Serve static files
app.use(express.static("public"));

// Routes
app.use("/auth", authRoutes);
app.get("/", (req, res) => res.render("home"));
app.get("/profile", authenticateUser, (req, res) => {
  res.render("profile", { user: req.user });
});
app.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("/auth/login");
});
app.get("*", (req, res)=>{res.send("404, Page Not Found!")});

// Start Server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

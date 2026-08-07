const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUserProfile,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

/**
 * Auth Routes
 * - POST /api/auth/register - Register a new user
 * - POST /api/auth/login    - Login and get JWT token
 * - GET  /api/auth/profile  - Get logged-in user's profile (protected)
 */
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", protect, getUserProfile);

module.exports = router;

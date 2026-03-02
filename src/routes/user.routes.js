import express from "express";
import { registerUser, loginUser } from "../controllers/auth.controller.js";
import { userAuth, authAdmin } from "../middleware/auth.js";
import { upload } from "../middleware/multer.js";
import User from "../models/User.js";
const router = express.Router();

/* ============================
   Public Routes
============================ */

// Info route
router.get("/register", (req, res) => {
  res.send("Welcome to the registration page. Please use POST method to register.");
});

// Register user with profile photo upload
router.post(
  "/register",
  upload.single("profilePhoto"),
  registerUser
);

// Login user
router.post("/login", loginUser);


/* ============================
   Protected Routes
============================ */

// User profile
router.get("/profile", userAuth, (req, res) => {
  res.json({
    message: "Profile accessed successfully",
    user: req.user,
  });
});


/* ============================
   Admin Routes
============================ */

// Admin dashboard
router.get("/admin/dashboard", userAuth, authAdmin, (req, res) => {
  res.json({
    message: "Admin dashboard accessed successfully",
    admin: req.user,
  });
});

// Get all users (Admin only)
router.get("/users", userAuth, authAdmin, async (req, res) => {
  try {
    const users = await User.find({}).select("-passwordHash");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users" });
  }
});


/* ============================
   Multer Error Handling
============================ */

router.use((error, req, res, next) => {
  if (error.name === "MulterError") {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ message: "File too large. Max size is 5MB" });
    }
    return res.status(400).json({ message: error.message });
  }

  if (error) {
    return res.status(400).json({ message: error.message });
  }

  next();
});

export default router;
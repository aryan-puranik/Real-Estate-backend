import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// Helper function to remove sensitive data from user object
const sanitizeUser = (user) => {
  const { passwordHash, ...userWithoutPassword } = user._doc;
  return userWithoutPassword;
};

// Validate password strength
const validatePassword = (password) => {
  if (password.length < 6) {
    return "Password must be at least 6 characters long";
  }
  // Add more validation as needed (uppercase, numbers, special chars, etc.)
  return null;
};

export const registerUser = async (req, res) => {
  try {
    console.log("📝 Registration attempt started");
    console.log("Request body:", req.body);
    console.log("Request file:", req.file);

    const { firstName, lastName, email, phone, password, role } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !password) {
      console.log("❌ Missing required fields:", { firstName, lastName, email, password });
      return res.status(400).json({
        message: "Please provide all required fields",
        missing: {
          firstName: !firstName,
          lastName: !lastName,
          email: !email,
          password: !password
        }
      });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      console.log("❌ User already exists:", email);
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    console.log("✅ Password hashed successfully");

    // Process profile photo
    let profilePhoto = "";
    if (req.file) {
      profilePhoto = `/uploads/${req.file.filename}`;
      console.log("📸 Profile photo saved:", profilePhoto);
    }

    const userData = {
      firstName,
      lastName,
      email,
      phone,
      password: passwordHash,
      role: role || 'buyer',
      profilePhoto
    };

    console.log("Attempting to create user with data:", {
      ...userData,
      password: '[HIDDEN]'
    });

    const user = await User.create(userData);

    console.log("✅ User created successfully:", user._id);

    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    console.log("✅ JWT token generated");

    res.status(201).json({
      message: "User registered successfully",
      user: sanitizeUser(user),
      token
    });

  } catch (error) {
    console.error("❌ Registration Error:", error);

    // Check for validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        message: "Validation Error",
        errors
      });
    }

    // Check for duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        message: "Duplicate field value entered",
        field: Object.keys(error.keyPattern)[0]
      });
    }

    res.status(500).json({
      message: "Internal Server Error",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email?.trim() || !password?.trim()) {
      return res.status(400).json({
        message: "Email and password are required"
      });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      // Use generic message for security
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Get the password hash (check both possible field names)
    const passwordHash = user.password || user.passwordHash;

    if (!passwordHash) {
      console.error(`User ${user._id} has no password hash`);
      return res.status(500).json({ message: "Account configuration error" });
    }

    // Compare passwords
    const isValid = await bcrypt.compare(password, passwordHash);

    if (!isValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate token
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return success
    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
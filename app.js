import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";

// Import routes
import userRoutes from "./src/routes/user.routes.js";
import adminRoutes from "./src/routes/admin.routes.js";
import propertyRoutes from "./src/routes/property.routes.js";
import consultationRoutes from "./src/routes/consultation.routes.js";
import adminSubmissionRoutes from "./src/routes/admin.submission.routes.js";
import submissionRoutes from "./src/routes/propertySubmission.routes.js";
import inquiryRoutes from "./src/routes/inquiry.routes.js";
import adminInquiryRoutes from "./src/routes/admin.dashboard.routes.js";
import adminDashboardRoutes from "./src/routes/admin.dashboard.routes.js";
import buyPropertyRoutes from "./src/routes/buyerProperty.routes.js";


dotenv.config();

const app = express();

// Ensure uploads directory exists
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log("Uploads directory created:", uploadDir);
}

// CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true
}));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
app.use("/uploads", express.static(uploadDir));

/* ---------- ROUTES ---------- */
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/consultations", consultationRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/admin/submissions", adminSubmissionRoutes);
app.use("/api/inquiries", inquiryRoutes);
app.use("/api/admin/inquiries", adminInquiryRoutes);
app.use("/api/admin/dashboard", adminDashboardRoutes);
app.use("/api/buyerProperty", buyPropertyRoutes);




// Use a more specific route pattern or check if no routes matched
app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
    path: req.originalUrl
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Error:", err);

  // Handle multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ message: "File too large. Max size is 5MB" });
  }

  if (err.message === 'Only image files are allowed') {
    return res.status(400).json({ message: err.message });
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ message: "Invalid token" });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ message: "Token expired" });
  }

  // Handle path-to-regexp errors
  if (err instanceof TypeError && err.message.includes('Missing parameter name')) {
    return res.status(500).json({
      message: "Server configuration error: Invalid route pattern"
    });
  }

  // Default error
  res.status(500).json({
    message: "Internal Server Error",
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

/* ---------- DATABASE CONNECTION & SERVER START ---------- */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected successfully");

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📍 http://localhost:${PORT}`);
      console.log(`📁 Uploads directory: ${uploadDir}`);
      console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

export default app;
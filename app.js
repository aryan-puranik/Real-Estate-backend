import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

import path from "path";

import userRoutes from "./src/routes/user.routes.js";
import adminRoutes from "./src/routes/admin.routes.js";
import propertyRoutes from "./src/routes/property.routes.js";
import consultationRoutes from "./src/routes/consultation.routes.js";
import adminSubmissionRoutes from "./src/routes/admin.submission.routes.js";
import submissionRoutes from "./src/routes/propertySubmission.routes.js";
import inquiryRoutes from "./src/routes/inquiry.routes.js";
import adminInquiryRoutes from "./src/routes/admin.dashboard.routes.js";
import adminDashboardRoutes from "./src/routes/admin.dashboard.routes.js";


dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve the uploads folder as a static directory
// This allows you to view images at http://localhost:5000/uploads/filename.jpg
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/consultations", consultationRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/admin/submissions", adminSubmissionRoutes);
app.use("/api/inquiries", inquiryRoutes);
app.use("/api/admin/inquiries", adminInquiryRoutes);
app.use("/api/admin/dashboard", adminDashboardRoutes);


mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(process.env.PORT || 5000, () =>{
      console.log("Server running")
      console.log("http://localhost:5000")}
    );
  })
  .catch((err) => console.error(err));

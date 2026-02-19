import express from "express";
import multer from "multer";
import { registerUser, loginUser } from "../controllers/auth.controller.js";

const router = express.Router();

// Configuration for where to save the files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Make sure this folder exists!
  },
  filename: (req, file, cb) => {
    // Rename file to prevent naming collisions
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

router.post("/register", upload.single("profilePhoto"), registerUser);

router.get("/register", async(req,res)=>{
  res.send("hello welcome to register page:");
});

router.post("/login", loginUser);

export default router;

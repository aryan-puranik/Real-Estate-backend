import express from "express";
import { userAuth } from "../middleware/auth.js";
import PropertyInquiry from "../models/PropertyInquiry.js";

const router = express.Router();

/* ---------- USER: CREATE INQUIRY ---------- */
router.post("/", userAuth, async (req, res) => {
  const { propertyId, message, contactPhone } = req.body;

  const inquiry = await PropertyInquiry.create({
    propertyId,
    userId: req.user.id,
    message,
    contactPhone
  });

  res.status(201).json(inquiry);
});

/* ---------- USER: VIEW OWN INQUIRIES ---------- */
router.get("/my", userAuth, async (req, res) => {
  const inquiries = await PropertyInquiry.find({
    userId: req.user.id
  })
    .populate("propertyId")
    .sort({ createdAt: -1 });

  res.json(inquiries);
});

export default router;

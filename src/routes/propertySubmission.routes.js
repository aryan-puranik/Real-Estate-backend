import express from "express";
import { userAuth } from "../middleware/auth.js";
import PropertySubmission from "../models/PropertySubmission.js";

const router = express.Router();

/* ---------- SELLER: SUBMIT PROPERTY ---------- */
router.post("/", userAuth, async (req, res) => {
  if (req.user.role !== "seller") {
    return res.status(403).json({ message: "Only sellers can submit property" });
  }

  const submission = await PropertySubmission.create({
    sellerId: req.user.id,
    propertyDetails: req.body.propertyDetails,
    documents: req.body.documents || []
  });

  res.status(201).json(submission);
});

/* ---------- SELLER: VIEW OWN SUBMISSIONS ---------- */
router.get("/my", userAuth, async (req, res) => {
  const submissions = await PropertySubmission.find({
    sellerId: req.user.id
  }).sort({ createdAt: -1 });

  res.json(submissions);
});

export default router;

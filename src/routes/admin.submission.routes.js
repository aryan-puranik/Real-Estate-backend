import express from "express";
import { authAdmin } from "../middleware/auth.js";
import PropertySubmission from "../models/PropertySubmission.js";
import Property from "../models/Property.js";

const router = express.Router();

/* ---------- ADMIN: VIEW ALL SUBMISSIONS ---------- */
router.get("/", authAdmin, async (req, res) => {
  const submissions = await PropertySubmission.find()
    .populate("sellerId")
    .sort({ createdAt: -1 });

  res.json(submissions);
});

/* ---------- ADMIN: APPROVE SUBMISSION ---------- */
router.patch("/:id/approve", authAdmin, async (req, res) => {
  const submission = await PropertySubmission.findById(req.params.id);
  if (!submission) {
    return res.status(404).json({ message: "Submission not found" });
  }

  // Create property from submission
  const property = await Property.create({
    ...submission.propertyDetails,
    sellerId: submission.sellerId,
    assignedAdminId: req.admin.id,
    status: "Active"
  });

  submission.status = "Approved";
  submission.reviewedBy = req.admin.id;
  await submission.save();

  res.json({ submission, property });
});

/* ---------- ADMIN: REJECT SUBMISSION ---------- */
router.patch("/:id/reject", authAdmin, async (req, res) => {
  const { remarks } = req.body;

  const submission = await PropertySubmission.findByIdAndUpdate(
    req.params.id,
    {
      status: "Rejected",
      reviewedBy: req.admin.id,
      remarks
    },
    { new: true }
  );

  res.json(submission);
});

export default router;

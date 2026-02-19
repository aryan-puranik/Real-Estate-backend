import express from "express";
import { adminAuth } from "../middleware/auth.js";
import PropertyInquiry from "../models/PropertyInquiry.js";

const router = express.Router();

/* ---------- ADMIN: VIEW ALL LEADS ---------- */
router.get("/", adminAuth, async (req, res) => {
  const inquiries = await PropertyInquiry.find()
    .populate("userId")
    .populate("propertyId")
    .populate("handledBy")
    .sort({ createdAt: -1 });

  res.json(inquiries);
});

/* ---------- ADMIN: ASSIGN LEAD ---------- */
router.patch("/:id/assign", adminAuth, async (req, res) => {
  const inquiry = await PropertyInquiry.findByIdAndUpdate(
    req.params.id,
    { handledBy: req.admin.id, status: "Contacted" },
    { new: true }
  );

  res.json(inquiry);
});

/* ---------- ADMIN: UPDATE STATUS ---------- */
router.patch("/:id/status", adminAuth, async (req, res) => {
  const { status } = req.body;

  const inquiry = await PropertyInquiry.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true }
  );

  res.json(inquiry);
});

/* ---------- ADMIN: ADD FOLLOW-UP NOTE ---------- */
router.post("/:id/follow-up", adminAuth, async (req, res) => {
  const { note } = req.body;

  const inquiry = await PropertyInquiry.findByIdAndUpdate(
    req.params.id,
    {
      $push: {
        followUps: {
          note,
          addedBy: req.admin.id
        }
      }
    },
    { new: true }
  );

  res.json(inquiry);
});

export default router;

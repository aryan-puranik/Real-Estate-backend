import express from "express";
import { authAdmin } from "../middleware/auth.js";

import PropertyInquiry from "../models/PropertyInquiry.js";
import PropertySubmission from "../models/PropertySubmission.js";
import Consultation from "../models/Consultation.js";

const router = express.Router();

router.get("/summary", authAdmin, async (req, res) => {
  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    /* ---------- NEW LEADS TODAY ---------- */
    const newLeadsToday = await PropertyInquiry.countDocuments({
      createdAt: { $gte: startOfToday }
    });

    /* ---------- PENDING SUBMISSIONS ---------- */
    const pendingSubmissions = await PropertySubmission.countDocuments({
      status: { $in: ["Submitted", "UnderReview"] }
    });

    /* ---------- UPCOMING CONSULTATIONS ---------- */
    const upcomingConsultations = await Consultation.find({
      scheduledAt: { $gte: new Date() },
      status: { $in: ["Requested", "Confirmed"] }
    })
      .populate("userId", "name phone")
      .populate("propertyId", "title")
      .sort({ scheduledAt: 1 })
      .limit(5);

    res.json({
      metrics: {
        newLeadsToday,
        pendingSubmissions
      },
      upcomingConsultations
    });
  } catch (error) {
    res.status(500).json({ message: "Dashboard fetch failed" });
  }
});

export default router;

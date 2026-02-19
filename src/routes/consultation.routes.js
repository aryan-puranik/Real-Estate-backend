import express from "express";
import Consultation from "../models/Consultation.js";
import { userAuth, authAdmin } from "../middleware/auth.js";
import { isSlotAvailable } from "../services/consultation.service.js";

const router = express.Router();

/* ---------- USER: REQUEST CONSULTATION ---------- */
router.post("/", userAuth, async (req, res) => {
  const { officeLocation, scheduledAt } = req.body;

  const available = await isSlotAvailable(officeLocation, scheduledAt);
  if (!available) {
    return res
      .status(409)
      .json({ message: "Slot already booked" });
  }

  const consultation = await Consultation.create({
    ...req.body,
    userId: req.user.id
  });

  res.status(201).json(consultation);
});

/* ---------- ADMIN: VIEW ALL ---------- */
router.get("/", authAdmin, async (req, res) => {
  const consultations = await Consultation.find()
    .populate("userId")
    .populate("propertyId");

  res.json(consultations);
});

/* ---------- ADMIN: CONFIRM ---------- */
router.patch("/:id/confirm", authAdmin, async (req, res) => {
  const consultation = await Consultation.findByIdAndUpdate(
    req.params.id,
    {
      status: "Confirmed",
      assignedAdminId: req.admin.id
    },
    { new: true }
  );

  res.json(consultation);
});

export default router;

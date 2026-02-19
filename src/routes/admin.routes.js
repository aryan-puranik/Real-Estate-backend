import express from "express";
import {
  getPendingListings,
  getNewInquiries,
  getTodaysConsultations
} from "../controllers/adminDashboard.controller.js";

import { authAdmin } from "../middleware/auth.js";

const router = express.Router();

router.get("/dashboard/pending-listings", authAdmin, getPendingListings);
router.get("/dashboard/new-inquiries", authAdmin, getNewInquiries);
router.get("/dashboard/today-consultations", authAdmin, getTodaysConsultations);

export default router;

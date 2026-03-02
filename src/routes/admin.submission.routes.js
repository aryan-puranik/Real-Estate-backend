import express from "express";
import { authAdmin } from "../middleware/auth.js";
import Property from "../models/Property.js";

const router = express.Router();

/* ---------- ADMIN: VIEW ALL SUBMISSIONS ---------- */
router.get("/", authAdmin, async (req, res) => {
  const submissions = await Property.find()
    .populate("sellerId")
    .sort({ createdAt: -1 });

  res.json(submissions);
});




export default router;

import express from "express";
import { userAuth } from "../middleware/auth.js";
import Property from "../models/Property.js";

const router = express.Router();

/* ---------- GET ALL PROPERTIES (with pagination) ---------- */
router.get("/", userAuth, async (req, res) => {
    try {
        // Pagination parameters: page and limit (defaults: page=1, limit=10)
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Fetch properties with pagination, sorted by newest first
        const properties = await Property.find({})
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        // Get total count of properties (for pagination metadata)
        const total = await Property.countDocuments();

        res.json({
            properties,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        });

    } catch (error) {
        console.error("Error fetching properties:", error);
        res.status(500).json({
            message: "Failed to fetch properties",
            error: error.message,
        });
    }
});

/* ---------- GET SINGLE PROPERTY BY ID ---------- */
router.get("/:id", userAuth, async (req, res) => {
    try {
        const property = await Property.findById(req.params.id);
        if (!property) {
            return res.status(404).json({ message: "Property not found" });
        }
        res.json(property);
    } catch (error) {
        console.error("Error fetching property:", error);
        res.status(500).json({
            message: "Failed to fetch property",
            error: error.message,
        });
    }
});

export default router;
import express from "express";
import { userAuth } from "../middleware/auth.js";
import Property from "../models/Property.js";
import { upload, handleMulterError } from "../middleware/multer.js"; // Import your multer config

const router = express.Router();

/* ---------- SELLER: SUBMIT PROPERTY ---------- */
router.post(
  "/",
  userAuth,
  upload.array('images', 10), // Use multer to handle file uploads (max 10 files)
  handleMulterError, // Handle any multer errors
  async (req, res) => {
    try {
      if (req.user.role !== "seller") {
        return res.status(403).json({ message: "Only sellers can submit property" });
      }

      // Log received data for debugging
      console.log("Received form data:", req.body);
      console.log("Received files:", req.files);

      // Get uploaded file paths
      const imagePaths = req.files ? req.files.map(file => file.path) : [];

      // Convert string booleans to actual booleans
      const roadAccess = req.body.roadAccess === 'true' || req.body.roadAccess === true;
      const highway = req.body.highway === 'true' || req.body.highway === true;

      // Create property with all fields matching your Property model
      const propertyData = {
        propertyType: req.body.propertyType,
        district: req.body.district,
        area: parseFloat(req.body.area),
        unit: req.body.unit,
        pricePerUnit: parseFloat(req.body.pricePerUnit),
        totalPrice: parseFloat(req.body.totalPrice),
        description: req.body.description || '',
        roadAccess: roadAccess,
        highway: highway,
        waterLevel: req.body.waterLevel ? parseFloat(req.body.waterLevel) : null,
        landType: req.body.landType || '',
        soilType: req.body.soilType || '',
        images: imagePaths,
        lat: parseFloat(req.body.lat),
        lng: parseFloat(req.body.lng),
        sellerId: req.user.id // Add sellerId from auth middleware
      };

      // Validate required fields
      const requiredFields = ['propertyType', 'district', 'area', 'unit', 'pricePerUnit', 'totalPrice', 'lat', 'lng'];
      for (const field of requiredFields) {
        if (!propertyData[field]) {
          return res.status(400).json({
            message: `Missing required field: ${field}`
          });
        }
      }

      // Create the property in database
      const submission = await Property.create(propertyData);

      res.status(201).json({
        message: "Property submitted successfully",
        property: submission
      });

    } catch (error) {
      console.error("Error creating property:", error);

      // Handle validation errors
      if (error.name === 'ValidationError') {
        return res.status(400).json({
          message: "Validation error",
          errors: Object.values(error.errors).map(e => e.message)
        });
      }

      res.status(500).json({
        message: "Failed to create property",
        error: error.message
      });
    }
  }
);

/* ---------- SELLER: VIEW OWN SUBMISSIONS ---------- */
router.get("/my", userAuth, async (req, res) => {
  try {
    const submissions = await Property.find({
      sellerId: req.user.id
    }).sort({ createdAt: -1 });

    res.json(submissions);
  } catch (error) {
    console.error("Error fetching properties:", error);
    res.status(500).json({
      message: "Failed to fetch properties",
      error: error.message
    });
  }
});

export default router;
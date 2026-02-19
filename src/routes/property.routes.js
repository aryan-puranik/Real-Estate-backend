import express from "express";
import Property from "../models/Property.js";
import { authAdmin } from "../middleware/auth.js";

const router = express.Router();

/* ---------- PUBLIC ---------- */
router.get("/", async (req, res) => {
  const {
    city,
    locality,
    minPrice,
    maxPrice,
    propertyType,
    listingType,
    sort
  } = req.query;

  const query = { status: "Active" };

  if (city) query["address.city"] = city;
  if (locality) query["address.locality"] = locality;

  if (propertyType) query.propertyType = propertyType;
  if (listingType) query.listingType = listingType;

  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  let sortOption = { createdAt: -1 }; // default newest
  if (sort === "price_asc") sortOption = { price: 1 };
  if (sort === "price_desc") sortOption = { price: -1 };

  const properties = await Property.find(query).sort(sortOption);

  res.json(properties);
});

/* ---------- ADMIN: CREATE PROPERTY ---------- */
router.post("/", authAdmin, async (req, res) => {
  const property = await Property.create({
    ...req.body,
    assignedAdminId: req.admin.id,
    status: "Pending"
  });

  res.status(201).json(property);
});

/* ---------- ADMIN: APPROVE PROPERTY ---------- */
router.patch("/:id/approve", authAdmin, async (req, res) => {
  const property = await Property.findByIdAndUpdate(
    req.params.id,
    { status: "Active" },
    { new: true }
  );

  res.json(property);
});

/* ---------- ADMIN: MARK SOLD ---------- */
router.patch("/:id/sold", authAdmin, async (req, res) => {
  const property = await Property.findByIdAndUpdate(
    req.params.id,
    { status: "Sold" },
    { new: true }
  );

  res.json(property);
});

export default router;

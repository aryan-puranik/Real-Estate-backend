import Property from "../models/Property.js";
import PropertyInquiry from "../models/PropertyInquiry.js";
import Consultation from "../models/Consultation.js";


export const getPendingListings = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [listings, total] = await Promise.all([
      Property.find({ status: "pending" })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Property.countDocuments({ status: "pending" })
    ]);

    res.status(200).json({
      data: listings,
      pagination: {
        page,
        limit,
        total,
        hasMore: skip + listings.length < total
      }
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch pending listings" });
  }
};


export const getNewInquiries = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [inquiries, total] = await Promise.all([
      PropertyInquiry.find({ status: "new" })
        .populate("propertyId", "title location price")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      PropertyInquiry.countDocuments({ status: "new" })
    ]);

    res.status(200).json({
      data: inquiries,
      pagination: {
        page,
        limit,
        total,
        hasMore: skip + inquiries.length < total
      }
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch inquiries" });
  }
};


export const getTodaysConsultations = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const query = {
      consultationDate: { $gte: start, $lte: end }
    };

    const [consultations, total] = await Promise.all([
      Consultation.find(query)
        .populate("propertyId", "title location")
        .sort({ consultationDate: 1 })
        .skip(skip)
        .limit(limit),
      Consultation.countDocuments(query)
    ]);

    res.status(200).json({
      data: consultations,
      pagination: {
        page,
        limit,
        total,
        hasMore: skip + consultations.length < total
      }
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch consultations" });
  }
};

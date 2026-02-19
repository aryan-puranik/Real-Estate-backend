import mongoose from "mongoose";

const consultationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property"
    },

    officeLocation: {
      type: String,
      required: true
    },

    scheduledAt: {
      type: Date,
      required: true
    },

    assignedAdminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin"
    },

    purpose: {
      type: String,
      enum: ["Buy", "Sell", "Valuation", "General"],
      required: true
    },

    status: {
      type: String,
      enum: ["Requested", "Confirmed", "Completed", "Cancelled", "NoShow"],
      default: "Requested"
    },

    notes: String
  },
  { timestamps: true }
);

export default mongoose.model("Consultation", consultationSchema);

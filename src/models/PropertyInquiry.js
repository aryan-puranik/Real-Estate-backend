import mongoose from "mongoose";

const inquirySchema = new mongoose.Schema(
  {
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    message: String,
    contactPhone: String,

    handledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin"
    },

    status: {
      type: String,
      enum: ["New", "Contacted", "Interested", "NotInterested", "Closed"],
      default: "New"
    },

    followUps: [
      {
        note: String,
        addedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Admin"
        },
        createdAt: {
          type: Date,
          default: Date.now
        }
      }
    ]
  },
  { timestamps: true }
);

export default mongoose.model("PropertyInquiry", inquirySchema);

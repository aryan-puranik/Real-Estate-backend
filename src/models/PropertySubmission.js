import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema(
  {
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    propertyDetails: { type: Object, required: true },
    documents: [String],

    status: {
      type: String,
      enum: ["Submitted", "UnderReview", "Approved", "Rejected"],
      default: "Submitted"
    },

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin"
    },

    remarks: String
  },
  { timestamps: true }
);

export default mongoose.model("PropertySubmission", submissionSchema);

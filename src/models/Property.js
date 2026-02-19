import mongoose from "mongoose";

const propertySchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,

    landType: {
      type: String,
      enum: ["Agriculture", "Residential", "Industrial", "Commercial"],
      required: true
    },

    price: { type: Number, required: true },
    areaSqFt: Number,

    address: {
      city: String,
      state: String,
      locality: String,
      pincode: String
    },

    images: [String],
    amenities: [String],

    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },

    assignedAdminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin"
    },

    status: {
      type: String,
      enum: ["Pending", "Approved", "Active", "Sold", "Rejected"],
      default: "Pending"
    },

    isFeatured: { type: Boolean, default: false }
  },
  { timestamps: true }
);

propertySchema.index({
  "address.city": 1,
  "address.locality": 1,
  price: 1,
  propertyType: 1,
  listingType: 1,
  status: 1
});


export default mongoose.model("Property", propertySchema);

import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firstName: { 
      type: String, 
      required: true,
      trim: true 
    },
    lastName: { 
      type: String, 
      required: true,
      trim: true 
    },
    email: { 
      type: String, 
      unique: true, 
      required: true,
      lowercase: true // Ensures "User@Example.com" is stored as "user@example.com"
    },
    phone: { type: String },
    passwordHash: { type: String, required: true },

    
    profilePhoto: { 
      type: String, 
      default: "" // Can store a URL from Cloudinary, AWS S3, etc.
    },

    role: {
      type: String,
      enum: ["buyer", "seller"],
      required: true
    },

    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

// Optional: Virtual for getting the full name easily
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

export default mongoose.model("User", userSchema);
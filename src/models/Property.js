const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema(
  {
    // === Step 1: Basic Land Details ===
    propertyType: {
      type: String,
      required: [true, 'Property type is required'],
      enum: ['Agricultural', 'Farm', 'Plot'],
    },
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    district: {
      type: String,
      required: [true, 'District is required'],
    },
    area: {
      type: Number,
      required: [true, 'Area is required'],
    },
    unit: {
      type: String,
      required: [true, 'Unit is required'],
      enum: ['Acre', 'Bigha', 'Sq.ft'],
    },
    pricePerUnit: {
      type: Number,
      required: [true, 'Price per unit is required'],
    },
    totalPrice: {
      type: Number,
      required: [true, 'Total price is required'],
    },
    description: {
      type: String,
      default: '',
    },

    // === Site Details ===
    roadAccess: {
      type: Boolean,
      default: false,
    },
    roadWidth: {
      type: Number,
      default: null, // Depending on if you plan to capture this in the future
    },
    highway: {
      type: Boolean,
      default: false,
    },
    waterLevel: {
      type: Number,
      default: null, // e.g. "In Feet"
    },
    landType: {
      type: String,
      enum: ['Irrigated', 'Non-Irrigated', 'Commercial', 'Residential', ''],
      default: '',
    },
    soilType: {
      type: String,
      enum: ['Black Soil', 'Red Soil', 'Clay', 'Sandy', ''],
      default: '',
    },
    // === Step 2: Upload Images ===
    images: {
      type: [String],
      required: [true, 'At least 1 image is required'], // This ensures array isn't empty
      validate: {
        validator: function (v) {
          return v && v.length > 0;
        },
        message: 'At least 1 image is required'
      }
    },

    // === Step 3: Map Location ===
    lat: {
      type: Number,
      required: [true, 'Latitude is required'],
    },
    lng: {
      type: Number,
      required: [true, 'Longitude is required'],
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
  }
);

const Property = mongoose.model('Property', propertySchema);

module.exports = Property;

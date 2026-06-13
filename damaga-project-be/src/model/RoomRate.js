// models/RoomRate.js
const mongoose = require("mongoose");

const RoomRateSchema = new mongoose.Schema(
  {
    roomType: {
      type: String,
      required: true,
      unique: true, // 1 roomType cuma boleh 1
      trim: true,
    },
    roomTypeName: {
      type: String,
      required: true,
      trim: true,
    },
    priceUSD: {
      type: Number,
      required: true,
      min: 0,
    },
    priceIDR: {
      type: Number,
      required: true,
      min: 0,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    updatedBy: {
      type: String,
      default: "",
      trim: true,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // tambah createdAt & updatedAt otomatis
  }
);

module.exports = mongoose.model("RoomRate", RoomRateSchema);

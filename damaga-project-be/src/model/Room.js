// backend/model/Room.js
const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
  {
    roomNumber: { type: String, required: true, unique: true },
    roomType: { type: String, required: true },
    floor: { type: Number, required: true },
    status: {
      type: String,
      enum: ["VD", "VC", "VCI", "OD", "OC", "OS", "OO"],
      default: "VC",
    },
  },
  { timestamps: true }
);

// ❗ penting: pastikan collection name = "rooms"
const Room = mongoose.model("Room", roomSchema, "rooms");

module.exports = Room;

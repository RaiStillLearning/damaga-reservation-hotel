// routes/roomRateRoutes.js
const express = require("express");
const RoomRate = require("../model/RoomRate");
const router = express.Router();

/**
 * GET /api/room-rates
 * Ambil semua room rate
 */
router.get("/", async (req, res) => {
  try {
    const rates = await RoomRate.find().sort({ roomType: 1 });
    // Frontend bisa handle baik array langsung atau { rates }
    return res.json(rates);
  } catch (err) {
    console.error("GET /room-rates error:", err);
    return res.status(500).json({ message: "Failed to fetch room rates" });
  }
});

/**
 * POST /api/room-rates
 * Tambah room rate baru
 */
router.post("/", async (req, res) => {
  try {
    const { roomType, roomTypeName, priceUSD, priceIDR, description, updatedBy, updatedAt } =
      req.body;

    if (!roomType || !roomTypeName || priceUSD == null || priceIDR == null) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Cek jika roomType sudah ada
    const existing = await RoomRate.findOne({ roomType });
    if (existing) {
      return res
        .status(409)
        .json({ message: `RoomType ${roomType} already exists` });
    }

    const rate = new RoomRate({
      roomType,
      roomTypeName,
      priceUSD,
      priceIDR,
      description,
      updatedBy,
      updatedAt: updatedAt || new Date(),
    });

    await rate.save();
    return res.status(201).json(rate);
  } catch (err) {
    console.error("POST /room-rates error:", err);
    return res.status(500).json({ message: "Failed to create room rate" });
  }
});

/**
 * PUT /api/room-rates/:id
 * Update room rate
 */
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { roomType, roomTypeName, priceUSD, priceIDR, description, updatedBy, updatedAt } =
      req.body;

    const rate = await RoomRate.findById(id);
    if (!rate) {
      return res.status(404).json({ message: "Room rate not found" });
    }

    // roomType dari frontend kamu di-disable saat editing,
    // jadi jarang berubah. Tapi kalau mau boleh update juga.
    if (roomType) rate.roomType = roomType;
    if (roomTypeName) rate.roomTypeName = roomTypeName;
    if (priceUSD != null) rate.priceUSD = priceUSD;
    if (priceIDR != null) rate.priceIDR = priceIDR;
    if (description !== undefined) rate.description = description;
    if (updatedBy) rate.updatedBy = updatedBy;
    rate.updatedAt = updatedAt || new Date();

    await rate.save();
    return res.json(rate);
  } catch (err) {
    console.error("PUT /room-rates/:id error:", err);
    return res.status(500).json({ message: "Failed to update room rate" });
  }
});

/**
 * DELETE /api/room-rates/:id
 * Hapus room rate
 */
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await RoomRate.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "Room rate not found" });
    }

    return res.json({ message: "Room rate deleted successfully" });
  } catch (err) {
    console.error("DELETE /room-rates/:id error:", err);
    return res.status(500).json({ message: "Failed to delete room rate" });
  }
});

module.exports = router;

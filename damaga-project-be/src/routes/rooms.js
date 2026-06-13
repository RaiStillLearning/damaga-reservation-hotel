const express = require("express");
const router = express.Router();
const Room = require("../model/Room");

// 🔹 Daftar default rooms (samakan dengan frontend)
const defaultRooms = [
  // Floor 2
  { roomNumber: "201", roomType: "DSD", floor: 2, status: "VC" },
  { roomNumber: "202", roomType: "DST", floor: 2, status: "VC" },
  { roomNumber: "203", roomType: "DDD", floor: 2, status: "VC" },
  { roomNumber: "204", roomType: "DDT", floor: 2, status: "VC" },
  { roomNumber: "205", roomType: "DSTD", floor: 2, status: "VC" },
  { roomNumber: "206", roomType: "DSTT", floor: 2, status: "VC" },
  { roomNumber: "207", roomType: "DDT", floor: 2, status: "VC" },
  { roomNumber: "208", roomType: "DSTD", floor: 2, status: "VC" },
  { roomNumber: "209", roomType: "DSTT", floor: 2, status: "VC" },
  { roomNumber: "210", roomType: "DSTT", floor: 2, status: "VC" },

  // Floor 3
  { roomNumber: "301", roomType: "DSD", floor: 3, status: "VC" },
  { roomNumber: "302", roomType: "DST", floor: 3, status: "VC" },
  { roomNumber: "303", roomType: "DDD", floor: 3, status: "VC" },
  { roomNumber: "304", roomType: "DDT", floor: 3, status: "VC" },
  { roomNumber: "305", roomType: "DSTD", floor: 3, status: "VC" },
  { roomNumber: "306", roomType: "DSTT", floor: 3, status: "VC" },
  { roomNumber: "307", roomType: "DDT", floor: 3, status: "VC" },
  { roomNumber: "308", roomType: "DSTD", floor: 3, status: "VC" },
  { roomNumber: "309", roomType: "DSTT", floor: 3, status: "VC" },
  { roomNumber: "310", roomType: "DSTT", floor: 3, status: "VC" },

  // Floor 4
  { roomNumber: "401", roomType: "DSD", floor: 4, status: "VC" },
  { roomNumber: "402", roomType: "DST", floor: 4, status: "VC" },
  { roomNumber: "403", roomType: "DDD", floor: 4, status: "VC" },
  { roomNumber: "404", roomType: "DDT", floor: 4, status: "VC" },
  { roomNumber: "405", roomType: "DSTD", floor: 4, status: "VC" },
  { roomNumber: "406", roomType: "DSTT", floor: 4, status: "VC" },
  { roomNumber: "407", roomType: "DDT", floor: 4, status: "VC" },
  { roomNumber: "408", roomType: "DSTD", floor: 4, status: "VC" },
  { roomNumber: "409", roomType: "DSTT", floor: 4, status: "VC" },
  { roomNumber: "410", roomType: "DSTT", floor: 4, status: "VC" },
];

// ✅ SEED ROUTE – panggil 1x aja dari browser / Postman
router.get("/seed", async (req, res) => {
  try {
    console.log("🔥 Seeding rooms... (delete + insert defaultRooms)");
    await Room.deleteMany({});
    const inserted = await Room.insertMany(defaultRooms);
    console.log("✅ Seeded rooms:", inserted.length);

    res.json({
      message: "Rooms seeded successfully",
      total: inserted.length,
    });
  } catch (err) {
    console.error("Error seeding rooms:", err);
    res.status(500).json({ message: "Failed to seed rooms" });
  }
});

// GET /api/rooms -> ambil semua rooms
router.get("/", async (req, res) => {
  try {
    const count = await Room.estimatedDocumentCount();
    console.log("📊 Rooms in DB:", count);

    const rooms = await Room.find().sort({ floor: 1, roomNumber: 1 }).lean();
    console.log("🔎 Return /api/rooms ->", rooms.length, "rooms");

    res.json({ rooms });
  } catch (err) {
    console.error("Error fetching rooms:", err);
    res.status(500).json({ message: "Failed to fetch rooms" });
  }
});

// PUT /api/rooms/:roomNumber -> update status room
router.put("/:roomNumber", async (req, res) => {
  try {
    const { roomNumber } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    const allowedStatuses = ["VD", "VC", "VCI", "OD", "OC", "OS", "OO"];
    if (!allowedStatuses.includes(status)) {
      return res
        .status(400)
        .json({ message: "Invalid status code", allowedStatuses });
    }

    const room = await Room.findOneAndUpdate(
      { roomNumber },
      { status },
      { new: true }
    );

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    res.json(room);
  } catch (err) {
    console.error("Error updating room:", err);
    res.status(500).json({ message: "Failed to update room" });
  }
});

module.exports = router;

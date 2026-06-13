// src/routes/users.js
const express = require("express");
const User = require("../model/Users"); // path sesuaikan
const auth = require("../middleware/auth");
const { requireRole } = require("../middleware/role");

const router = express.Router();

// GET /api/users
// optional query: ?page=1&limit=20&search=rakha
router.get("/", auth, requireRole("admin"), async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, parseInt(req.query.limit) || 20);
    const skip = (page - 1) * limit;
    const search = (req.query.search || "").trim();

    const filter = {};
    if (search) {
      // cari by username, email, atau divisi (case-insensitive)
      const regex = new RegExp(search, "i");
      filter.$or = [{ username: regex }, { email: regex }];
    }

    const [users, total] = await Promise.all([
      User.find(filter)
        .select("-password -otp -otpExpires -__v") // hide sensitive fields
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(filter),
    ]);

    res.json({
      data: users,
      meta: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/users/:id
router.get("/:id", auth, requireRole("admin"), async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-password -otp -otpExpires -__v")
      .lean();
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ data: user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

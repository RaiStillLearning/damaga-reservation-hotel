// routes/tiles.js
const express = require("express");
const router = express.Router();
const User = require("../model/Users");
const jwt = require("jsonwebtoken");

// Middleware untuk autentikasi
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error("Token verification failed:", error);
    return res.status(401).json({ message: "Invalid token" });
  }
};

// GET - Load tiles
router.get("/api/tiles", authMiddleware, async (req, res) => {
  try {
    console.log("GET /api/tiles - User ID:", req.user.id);

    const user = await User.findById(req.user.id).select("dashboardTiles");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ tiles: user.dashboardTiles || [] });
  } catch (error) {
    console.error("Error loading tiles:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// POST - Save tiles
router.post("/api/tiles", authMiddleware, async (req, res) => {
  try {
    console.log("POST /api/tiles - User ID:", req.user.id);
    console.log("POST /api/tiles - Tiles:", req.body.tiles);

    const { tiles } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { dashboardTiles: tiles },
      { new: true, select: "dashboardTiles" }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "Tiles saved successfully",
      tiles: updatedUser.dashboardTiles,
    });
  } catch (error) {
    console.error("Error saving tiles:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;

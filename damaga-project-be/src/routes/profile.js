// routes/profile.js
const express = require("express");
const auth = require("../middleware/auth");
const upload = require("../middleware/upload");
const User = require("../model/Users");
const path = require("path");
const fs = require("fs");
const router = express.Router();

/**
 * @route   GET /api/profile
 * @desc    Get user profile
 * @access  Private
 */
router.get("/", auth, async (req, res) => {
  try {
    const u = req.user; // populated by auth middleware

    res.json({
      user: {
        id: u._id,
        username: u.username,
        email: u.email,
        avatar: u.avatar || "/default-avatar.png",
        role: u.role,
      },
    });
  } catch (err) {
    console.error("Profile fetch error:", err);
    res.status(500).json({ error: "Server error while fetching profile" });
  }
});

/**
 * @route   PUT /api/profile
 * @desc    Update user profile (username & avatar)
 * @access  Private
 */
router.put("/", auth, upload.single("avatar"), async (req, res) => {
  try {
    const { username } = req.body;
    const userId = req.user._id;

    // Prepare update object
    const updateData = {};
    if (username) updateData.username = username;

    // If file was uploaded
    if (req.file) {
      // Create URL for the avatar (will be served as static)
      // Assuming original URL looks like: http://domain/uploads/avatars/filename
      const avatarUrl = `/uploads/avatars/${req.file.filename}`;
      
      // OPTIONAL: Delete old avatar if it exists and is not the default
      const oldUser = await User.findById(userId);
      if (oldUser.avatar && oldUser.avatar.startsWith("/uploads/avatars/")) {
        // Path joining fix: strip leading slash or join more robustly
        const fileName = path.basename(oldUser.avatar);
        const oldFilePath = path.join(__dirname, "..", "uploads", "avatars", fileName);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }
      
      updateData.avatar = avatarUrl;
    }

    // Update user in DB
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      message: "Profile updated successfully",
      user: {
        id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        avatar: updatedUser.avatar,
        role: updatedUser.role,
      },
    });
  } catch (err) {
    console.error("Profile update error:", err);
    res.status(500).json({ error: "Failed to update profile: " + err.message });
  }
});

module.exports = router;

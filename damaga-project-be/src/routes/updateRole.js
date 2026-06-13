const express = require("express");
const User = require("../model/Users");
const router = express.Router();

router.patch("/:id/role", async (req, res) => {
  try {
    const { role } = req.body;

    if (!["admin", "front-office"].includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    );

    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({ message: "Role updated", user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

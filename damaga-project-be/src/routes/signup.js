const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../model/Users");
const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { username, email, password, role, adminCode } = req.body;

    if (!username || !email || !password)
      return res.status(400).json({ error: "All fields are required" });

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ error: "Email already registered" });

    // Default role user biasa
    let finalRole = "front-office";

    // Jika user ingin menjadi admin
    if (role === "admin") {
      if (adminCode !== process.env.ADMIN_SECRET) {
        return res.status(403).json({ error: "Invalid admin code" });
      }
      finalRole = "admin";
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      // divisi,
      email,
      password: hashed,
      role: finalRole,
    });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        username: user.username,
        // divisi: user.divisi,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

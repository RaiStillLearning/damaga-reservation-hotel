// routes/authLogin.js (nama asumsi, pakai punya kamu saja)
const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../model/Users");
const jwt = require("jsonwebtoken");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "Email dan password wajib diisi" });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "User tidak ditemukan" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Password salah" });

    // ✅ Sign token (boleh tetap cuma id, karena di middleware kita ambil user fresh)
    const payload = {
      id: user._id,
      role: user.role, // opsional, tapi nice to have
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    // ✅ Pastikan role ikut dikirim ke frontend
    const userData = {
      id: user._id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      // divisi: user.divisi,
      role: user.role || "front-office", // fallback kalau user lama belum punya role
    };

    console.log("Login success for:", userData);

    // Kirim token + userData sekaligus
    return res.status(200).json({ token, user: userData });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Terjadi kesalahan server" });
  }
});

module.exports = router;

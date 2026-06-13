const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../model/Users");
const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword)
      return res
        .status(400)
        .json({ error: "Email dan password baru wajib diisi" });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "User tidak ditemukan" });

    if (!user.otpVerified)
      return res.status(400).json({ error: "OTP belum diverifikasi" });

    user.password = await bcrypt.hash(newPassword, 10);
    user.otp = null;
    user.otpExpires = null;
    user.otpVerified = false;

    await user.save();
    res.json({ message: "Password berhasil direset" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

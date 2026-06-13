const express = require("express");
const User = require("../model/Users");
const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp)
      return res.status(400).json({ error: "Email dan OTP wajib diisi" });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "User tidak ditemukan" });

    if (user.otp !== otp || user.otpExpires < new Date())
      return res
        .status(400)
        .json({ error: "OTP tidak valid atau sudah expired" });

    user.otpVerified = true;
    await user.save();

    res.json({ message: "OTP berhasil diverifikasi" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

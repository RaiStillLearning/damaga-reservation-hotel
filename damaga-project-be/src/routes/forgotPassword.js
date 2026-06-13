// routes/forgotPassword.js
const express = require("express");
const User = require("../model/Users");
const { sendEmail } = require("../utils/sendEmail");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    const user = await User.findOne({ email });

    // ⚠️ Pilihan A (lebih aman): selalu balas generic
    if (!user) {
      // jangan bocorin "User not found"
      return res.json({
        message:
          "Jika email terdaftar, kami telah mengirimkan kode ke email tersebut.",
      });
    }

    // generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 menit

    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    // 🔥 KIRIM EMAIL TANPA await → supaya request gak nunggu SMTP
    sendEmail(
      email,
      "DAMAGA OTP Code",
      `<p>Your OTP is:</p><h2>${otp}</h2><p>Valid for 10 minutes.</p>`
    ).catch((err) => {
      console.error("Error sending email (background):", err);
    });

    // ✅ Langsung respond ke client
    return res.json({
      message:
        "Jika email terdaftar, kami telah mengirimkan kode ke email tersebut.",
    });
  } catch (err) {
    console.error("Forgot password error:", err);
    res
      .status(500)
      .json({ error: "Terjadi kesalahan, silakan coba kembali nanti." });
  }
});

module.exports = router;

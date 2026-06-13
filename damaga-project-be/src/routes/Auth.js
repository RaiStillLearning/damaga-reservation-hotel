// const express = require("express");
// const bcrypt = require("bcrypt");
// const jwt = require("jsonwebtoken");
// const User = require("../model/Users");
// const { sendEmail } = require("../utils/sendEmail");
// const router = express.Router();

// // Signup
// router.post("/signup", async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     const hashed = await bcrypt.hash(password, 10);
//     const user = await User.create({ email, password: hashed });
//     res.status(201).json({ message: "User created", user });
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// });

// // Login
// router.post("/login", async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     const user = await User.findOne({ email });
//     if (!user) return res.status(400).json({ error: "User not found" });

//     const match = await bcrypt.compare(password, user.password);
//     if (!match) return res.status(400).json({ error: "Invalid password" });

//     const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
//       expiresIn: "1d",
//     });
//     res.json({ token });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // Forgot Password
// router.post("/forgot-password", async (req, res) => {
//   try {
//     const { email } = req.body;
//     const user = await User.findOne({ email });
//     if (!user) return res.status(400).json({ error: "User not found" });

//     const otp = Math.floor(100000 + Math.random() * 900000).toString();
//     const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 menit
//     user.otp = otp;
//     user.otpExpires = otpExpires;
//     await user.save();

//     await sendEmail(email, "Your OTP Code", `Your OTP is: ${otp}`);
//     res.json({ message: "OTP sent to your email" });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // Reset Password
// router.post("/reset-password", async (req, res) => {
//   try {
//     const { email, otp, newPassword } = req.body;
//     const user = await User.findOne({ email });
//     if (!user) return res.status(400).json({ error: "User not found" });

//     if (user.otp !== otp || user.otpExpires < new Date()) {
//       return res.status(400).json({ error: "Invalid or expired OTP" });
//     }

//     user.password = await bcrypt.hash(newPassword, 10);
//     user.otp = null;
//     user.otpExpires = null;
//     await user.save();

//     res.json({ message: "Password reset successfully" });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// module.exports = router;

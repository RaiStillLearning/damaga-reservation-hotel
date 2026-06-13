// middleware/auth.js
const jwt = require("jsonwebtoken");
const User = require("../model/Users"); // pastikan path sesuai

async function authMiddleware(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header) {
      console.log("❌ No Authorization header");
      return res.status(401).json({ error: "No token provided" });
    }

    const parts = header.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
      console.log("❌ Invalid token format:", header);
      return res.status(401).json({ error: "Invalid token format" });
    }

    const token = parts[1];
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("🔑 Token decoded:", decoded);
    } catch (err) {
      console.log("❌ JWT verify error:", err.message);
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    // Ambil user fresh dari DB pakai decoded.id
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      console.log("❌ User not found for ID:", decoded.id);
      return res.status(404).json({ error: "User not found" });
    }

    req.user = user; // req.user = data fresh dari DB (include role, divisi, dll)
    next();
  } catch (err) {
    console.error("❌ Middleware server error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}

module.exports = authMiddleware;

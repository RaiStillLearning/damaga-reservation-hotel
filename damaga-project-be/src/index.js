const express = require("express");
const cors = require("cors");
const path = require("path");
const app = express();

/**
 * 1. Konfigurasi CORS (Paling Atas)
 * origin: true akan otomatis mencocokkan domain pengirim (www.damaga.my.id / damaga.my.id)
 */
app.use(
  cors({
    origin: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Handle Preflight OPTIONS request untuk semua rute dihapus karena cukup app.use(cors)

/**
 * 2. Middleware Dasar
 */
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

/**
 * 3. Static Files for Uploads
 */
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/**
 * 4. Logger untuk memantau request yang masuk
 */
app.use((req, res, next) => {
  console.log(`🔥 Incoming Request: ${req.method} ${req.url}`);
  next();
});

/**
 * 5. Import Routes
 */
const signupRoutes = require("./routes/signup");
const loginRoutes = require("./routes/login");
const forgotRoutes = require("./routes/forgotPassword");
const verifyRoutes = require("./routes/verify-otp");
const resetRoutes = require("./routes/resetPassword");
const usersRoutes = require("./routes/users");
const profileRoutes = require("./routes/profile");
const updateRoleRoute = require("./routes/updateRole");
const tilesRoutes = require("./routes/tiles");
const bookARoomRoutes = require("./routes/Book-A-Room/controllers");
const roomRateRoutes = require("./routes/roomRateRutes");
const roomsRouter = require("./routes/rooms");

/**
 * 6. Registrasi Routes
 */
app.use("/api/auth/signup", signupRoutes);
app.use("/api/auth/login", loginRoutes);
app.use("/api/auth/forgot-password", forgotRoutes);
app.use("/api/auth/reset-password/verify-otp", verifyRoutes);
app.use("/api/auth/reset-password", resetRoutes);
app.use("/api/users", usersRoutes);
app.use(tilesRoutes); 
app.use("/api/profile", profileRoutes);
app.use("/api/book-a-room", bookARoomRoutes);
app.use("/api/admin", updateRoleRoute);
app.use("/api/room-rates", roomRateRoutes);
app.use("/api/rooms", roomsRouter);

module.exports = app;

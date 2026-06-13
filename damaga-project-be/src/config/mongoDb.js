const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.API_PH);
    console.log("✅ Berhasil Terhubung ke MongoDB");
  } catch (err) {
    console.error("❌ Gagal Terhubung ke MongoDB", err);
    process.exit(1);
  }
};

module.exports = connectDB;

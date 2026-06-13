const express = require("express");
const router = express.Router();
const {
  createBooking,
  getAllBookings,
  getBookingById,
  updateBooking,
  deleteBooking,
} = require("../../controllers/BookARoomControllers");

// Routes
router.post("/", createBooking); // CREATE
router.get("/", getAllBookings); // READ ALL
router.get("/:id", getBookingById); // READ ONE
router.put("/:id", updateBooking); // UPDATE
router.delete("/:id", deleteBooking); // DELETE

module.exports = router;

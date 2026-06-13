const BookARoom = require("../model/BookARoom");

// CREATE
exports.createBooking = async (req, res) => {
  try {
    const newBooking = new BookARoom(req.body);
    const savedBooking = await newBooking.save();
    res.status(201).json(savedBooking);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// READ ALL
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await BookARoom.find();
    res.json({
      success: true,
      count: bookings.length,
      bookings: bookings,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// READ ONE
exports.getBookingById = async (req, res) => {
  try {
    const booking = await BookARoom.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE
exports.updateBooking = async (req, res) => {
  try {
    const updatedBooking = await BookARoom.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedBooking)
      return res.status(404).json({ message: "Booking not found" });
    res.json(updatedBooking);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// DELETE
exports.deleteBooking = async (req, res) => {
  try {
    const deletedBooking = await BookARoom.findByIdAndDelete(req.params.id);
    if (!deletedBooking)
      return res.status(404).json({ message: "Booking not found" });
    res.json({ message: "Booking deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

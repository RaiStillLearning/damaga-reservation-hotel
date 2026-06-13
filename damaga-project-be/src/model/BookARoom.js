const mongoose = require("mongoose");

const bookARoomSchema = new mongoose.Schema(
  {
    FirstName: {
      type: String,
      required: true,
    },
    LastName: {
      type: String,
      required: true,
    },
    Address: {
      type: String,
      required: true,
    },
    Country: {
      type: String,
      required: true,
    },
    Phone: {
      type: Number,
      required: true,
    },
    RoomType: {
      type: String,
      required: true,
    },
    NoOfRoom: {
      type: Number,
      required: true,
    },
    RoomNumber: {
      type: String,
      required: false,
    },
    IDNumber: {
      type: String,
      required: false,
    },
    DateOfIssue: {
      type: Date,
      required: false,
    },
    DateOfBirth: {
      type: Date,
      required: false,
    },
    Source: {
      type: String,
      required: false,
    },
    Note: {
      type: String,
      required: false,
    },
    ArrDate: {
      type: Date,
      default: Date.now,
    },
    DeptDate: {
      type: Date,
    },
    TypeOfGuest: {
      type: String,
      required: false,
      default: "Walk-in",
    },
    City: {
      type: String,
      required: false,
      default: "-",
    },
    ZipCode: {
      type: Number,
      required: false,
      default: 0,
    },
    Fax: {
      type: String,
      required: false,
    },
    RoomRate: {
      type: Number,
      required: true,
    },
    // ✅ TAMBAHKAN INI - Currency untuk room rate
    RoomRateCurrency: {
      type: String,
      enum: ["USD", "IDR"],
      default: "USD",
      required: false,
    },
    NoOfPerson: {
      type: Number,
      required: true,
      alias: "NumberOfPerson",
    },
    ArrTime: {
      type: String,
      required: true,
    },
    DeptTime: {
      type: String,
      required: true,
    },
    Payment: {
      type: String,
      required: true,
    },
    ReservationMadeBy: {
      type: String,
      enum: ["Phone", "Direct", "Letter", "Fax"],
      default: "Direct",
    },
    Request: {
      type: String,
      required: false,
      default: "None",
    },
    Clerk: {
      type: String,
      required: true,
    },
    Discount: {
      type: Number,
      required: false,
      default: 0,
    },
    // ✅ TAMBAHKAN INI - Advance Deposit
    AdvanceDeposit: {
      type: Number,
      required: false,
      default: 0,
    },
    // ✅ TAMBAHKAN INI - Company Information
    CompanyName: {
      type: String,
      required: false,
    },
    CompanyPhone: {
      type: String,
      required: false,
    },
    CompanyAddress: {
      type: String,
      required: false,
    },
    // ✅ TAMBAHKAN INI - Payment Details
    VoucherNumber: {
      type: String,
      required: false,
    },
    CreditCardNumber: {
      type: String,
      required: false,
    },
    ApprovalCode: {
      type: String,
      required: false,
    },
    // Status check-in
    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "checked-in",
        "checked-out",
        "cancelled",
        "in-house",
        "stay-over",
      ],
      default: "pending",
      lowercase: true,
    },

    checkInDate: {
      type: Date,
      required: false,
    },
    checkOutDate: {
      type: Date,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

const BookARoom = mongoose.model("BookARoom", bookARoomSchema, "book_a_room");
module.exports = BookARoom;

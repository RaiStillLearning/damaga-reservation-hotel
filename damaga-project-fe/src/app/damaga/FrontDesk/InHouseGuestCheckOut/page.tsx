"use client";

import { useState, useEffect } from "react";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileText } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";

export default function CheckOutGuestPage() {
  return (
    <Suspense fallback={<div className="p-5 text-center">Loading...</div>}>
      <CheckOutGuest />
    </Suspense>
  );
}

const roomTypePrices = {
  DSD: { USD: 75, IDR: 1200000 },
  DST: { USD: 80, IDR: 1280000 },
  DDD: { USD: 120, IDR: 1920000 },
  DDT: { USD: 125, IDR: 2000000 },
  DSDT: { USD: 200, IDR: 3200000 },
  DSTD: { USD: 200, IDR: 3200000 },
  DSTT: { USD: 210, IDR: 3360000 },
};

interface RegistrationFormData {
  arrivalDate: string;
  departureDate: string;
  numberOfRooms: string;
  roomType: string;
  dailyRate: number;
  currency: "USD" | "IDR";
  lastName: string;
  firstName: string;
  address: string;
  advanceDeposit: string;
  companyName: string;
  companyPhone: string;
  companyAddress: string;
  personalPhone: string;
  dateOfBirth: string;
  passportId: string;
  nationality: string;
  dateOfIssue: string;
  paymentCash: boolean;
  paymentCredit: boolean;
  voucherNumber: string;
  creditCardNumber: string;
  approvalCode: string;
  remark: string;
  clerk: string;
  roomNo: string;
  discount: string;
  person: string;
}

function CheckOutGuest() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("bookingId");

  // 🔹 isCheckedOut: hanya untuk switch ke print view
  const [isCheckedOut, setIsCheckedOut] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [bookingStatus, setBookingStatus] = useState<string | undefined>("");

  const [formData, setFormData] = useState<RegistrationFormData>({
    arrivalDate: "",
    departureDate: "",
    numberOfRooms: "",
    roomType: "",
    dailyRate: 0,
    currency: "USD",
    lastName: "",
    firstName: "",
    address: "",
    advanceDeposit: "",
    companyName: "",
    companyPhone: "",
    companyAddress: "",
    personalPhone: "",
    dateOfBirth: "",
    passportId: "",
    nationality: "",
    dateOfIssue: "",
    paymentCash: false,
    paymentCredit: false,
    voucherNumber: "",
    creditCardNumber: "",
    approvalCode: "",
    remark: "",
    clerk: "",
    roomNo: "",
    discount: "",
    person: "",
  });

  const formatNumber = (num: number) => {
    if (num === 0) return "";
    return num.toLocaleString("en-US", {
      minimumFractionDigits: formData.currency === "USD" ? 2 : 0,
      maximumFractionDigits: formData.currency === "USD" ? 2 : 0,
    });
  };

  const getCurrencySymbol = () => {
    return formData.currency === "USD" ? "$" : "Rp";
  };

  const handleRoomTypeChange = (roomType: string) => {
    const newRoomRate =
      roomTypePrices[roomType as keyof typeof roomTypePrices]?.[
        formData.currency
      ] || 0;
    setFormData((prev) => ({
      ...prev,
      roomType: roomType,
      dailyRate: newRoomRate,
    }));
  };

  const handleCurrencyChange = (newCurrency: "USD" | "IDR") => {
    setFormData((prev) => {
      let newRoomRate = prev.dailyRate;
      if (prev.roomType) {
        newRoomRate =
          roomTypePrices[prev.roomType as keyof typeof roomTypePrices]?.[
            newCurrency
          ] || 0;
      }
      return {
        ...prev,
        currency: newCurrency,
        dailyRate: newRoomRate,
      };
    });
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        const clerkName = parsed.username || parsed.name || "Admin";
        setFormData((prev) => ({ ...prev, clerk: clerkName }));
      } catch (error) {
        console.error("Failed to parse user from localStorage", error);
      }
    }
  }, []);

  useEffect(() => {
    if (bookingId) {
      fetchBookingData(bookingId);
    }
  }, [bookingId]);

  const fetchBookingData = async (id: string) => {
    setIsLoadingData(true);
    try {
      const res = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL
        }/api/book-a-room/${id}?t=${Date.now()}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
        }
      );

      if (!res.ok) throw new Error("Failed to fetch booking data");

      const booking = await res.json();

      setBookingStatus(booking.status);

      // 🔹 Untuk form checkout:
      // - kalau status sudah "checked-out" → view saja (tidak bisa edit / check out lagi)
      // - kalau "checked-in" → boleh edit lalu check out
      if (booking.status === "checked-out") {
        setIsViewMode(true);
      }

      const formatDate = (
        dateValue: string | number | Date | null | undefined
      ): string => {
        if (!dateValue) return "";
        try {
          const date = new Date(dateValue);
          if (isNaN(date.getTime())) return "";
          return date.toISOString().split("T")[0];
        } catch {
          return "";
        }
      };

      const toString = (
        value: string | number | null | undefined,
        defaultValue: string = ""
      ): string => {
        if (value === null || value === undefined) return defaultValue;
        return String(value);
      };

      setFormData((prev) => ({
        ...prev,
        arrivalDate: formatDate(booking.ArrDate),
        departureDate: formatDate(booking.DeptDate),
        numberOfRooms: toString(booking.NoOfRoom || booking.numberOfRooms),
        roomType: booking.RoomType || booking.roomType || "",
        dailyRate: Number(booking.RoomRate || booking.dailyRate) || 0,
        currency: (booking.RoomRateCurrency || booking.currency || "USD") as
          | "USD"
          | "IDR",
        lastName: booking.LastName || booking.lastName || "",
        firstName: booking.FirstName || booking.firstName || "",
        address: booking.Address || booking.address || "",
        advanceDeposit: toString(
          booking.AdvanceDeposit || booking.advanceDeposit
        ),
        companyName: booking.CompanyName || booking.companyName || "",
        companyPhone: toString(
          booking.CompanyPhone || booking.Phone || booking.companyPhone
        ),
        companyAddress: booking.CompanyAddress || booking.companyAddress || "",
        personalPhone: booking.PersonalPhone || booking.personalPhone || "",
        dateOfBirth: formatDate(booking.DateOfBirth || booking.dateOfBirth),
        passportId:
          booking.IDNumber || booking.passportId || booking.PassportId || "",
        nationality:
          booking.Country || booking.nationality || booking.Nationality || "",
        dateOfIssue: formatDate(booking.DateOfIssue || booking.dateOfIssue),
        paymentCash: booking.Payment === "Cash" || booking.paymentCash === true,
        paymentCredit:
          booking.Payment === "Credit" ||
          booking.Payment === "Credit Card" ||
          booking.paymentCredit === true,
        voucherNumber: booking.VoucherNumber || booking.voucherNumber || "",
        creditCardNumber:
          booking.CreditCardNumber || booking.creditCardNumber || "",
        approvalCode: booking.ApprovalCode || booking.approvalCode || "",
        remark:
          booking.Request ||
          booking.Note ||
          booking.remark ||
          booking.note ||
          "",
        clerk: prev.clerk,
        roomNo: booking.RoomNumber || booking.roomNo || booking.NoOfRoom || "",
        discount: toString(booking.Discount || booking.discount),
        person: toString(
          booking.NoOfPerson || booking.NumberOfPerson || booking.person
        ),
      }));
    } catch (error) {
      console.error("Error fetching booking:", error);
      alert("Gagal memuat data booking. Silakan coba lagi.");
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // 🔹 Khusus CHECK-OUT: update status & checkOutDate, lalu masuk ke print view
  const handleCheckOutAndPrint = async () => {
    if (!bookingId) {
      alert("Booking ID tidak ditemukan. Tidak dapat melakukan check-out.");
      return;
    }

    if (!formData.firstName || !formData.lastName) {
      alert("Please fill in guest name");
      return;
    }

    if (bookingStatus?.toLowerCase() === "checked-out") {
      alert("Tamu ini sudah di-check-out sebelumnya.");
      return;
    }

    const confirmCheckOut = confirm(
      "Apakah Anda yakin ingin melakukan CHECK-OUT untuk tamu ini?\n\nStatus akan menjadi CHECKED-OUT dan data akan masuk ke Guest History Record."
    );
    if (!confirmCheckOut) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/book-a-room/${bookingId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: "checked-out",
            checkOutDate: new Date().toISOString(),
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || "Failed to check-out");
      }

      const savedData = await response.json();
      console.log(savedData);

      alert(
        "Check-out successful! Opening print preview...\nData tamu sekarang tersimpan sebagai CHECKED-OUT dan akan tampil di Guest History Record."
      );

      setBookingStatus("checked-out");
      setIsViewMode(true);
      setIsCheckedOut(true);
    } catch (error) {
      console.error("Check-out error:", error);
      alert(
        `Check-out failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleBack = () => {
    // Ubah route ini kalau mau langsung ke halaman GuestHistoryRecord
    router.push("/damaga/Reservations/ReservationHistory?refresh=true");
  };

  if (isLoadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-2xl">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Loading Booking Data...
            </h2>
            <p className="text-gray-600">
              Please wait while we fetch the reservation details
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 🔹 Tampilan form (sebelum print)
  if (!isCheckedOut) {
    const statusLower = (bookingStatus || "").toLowerCase();
    const canCheckOut = statusLower === "checked-in" || statusLower === "in-house";

    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-4xl shadow-2xl">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Damaga Suites
              </h1>
              <p className="text-gray-600">CHECK-OUT GUEST FORM</p>
              {bookingStatus && (
                <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-800 rounded-full text-sm font-medium">
                  <span className="w-2 h-2 bg-slate-500 rounded-full"></span>
                  Status: {bookingStatus}
                </div>
              )}
            </div>

            <div className="space-y-6">
              {/* Room Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Arrival Date
                  </label>
                  <Input
                    name="arrivalDate"
                    type="date"
                    value={formData.arrivalDate}
                    onChange={handleChange}
                    className="w-full"
                    disabled={isViewMode}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Departure Date
                  </label>
                  <Input
                    name="departureDate"
                    type="date"
                    value={formData.departureDate}
                    onChange={handleChange}
                    className="w-full"
                    disabled={isViewMode}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Rooms
                  </label>
                  <Input
                    name="numberOfRooms"
                    type="number"
                    value={formData.numberOfRooms}
                    onChange={handleChange}
                    placeholder="1"
                    disabled={isViewMode}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Room Type *
                  </label>
                  <Select
                    value={formData.roomType}
                    onValueChange={handleRoomTypeChange}
                    disabled={isViewMode}
                  >
                    <SelectTrigger className="w-full h-10">
                      <SelectValue placeholder="Select room type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DSD">
                        DSD (Damaga Standard Double)
                      </SelectItem>
                      <SelectItem value="DST">
                        DST (Damaga Standard Twin)
                      </SelectItem>
                      <SelectItem value="DDD">
                        DDD (Damaga Deluxe Double)
                      </SelectItem>
                      <SelectItem value="DDT">
                        DDT (Damaga Deluxe Twin)
                      </SelectItem>
                      <SelectItem value="DSTD">
                        DSTD (Damaga Suite Double)
                      </SelectItem>
                      <SelectItem value="DSTT">
                        DSTT (Damaga Suite Twin)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Daily Rate *
                  </label>
                  <div className="flex gap-2">
                    <Select
                      value={formData.currency}
                      onValueChange={handleCurrencyChange}
                      disabled={isViewMode}
                    >
                      <SelectTrigger className="w-24 h-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="IDR">IDR</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                        {getCurrencySymbol()}
                      </span>
                      <Input
                        name="dailyRate"
                        type="text"
                        value={
                          formData.dailyRate > 0
                            ? formatNumber(formData.dailyRate)
                            : ""
                        }
                        onChange={(e) => {
                          const value = e.target.value.replace(/,/g, "");
                          if (!isNaN(Number(value)) || value === "") {
                            setFormData({
                              ...formData,
                              dailyRate: Number(value) || 0,
                            });
                          }
                        }}
                        placeholder="Select room type first"
                        className="pl-12"
                        disabled={isViewMode}
                      />
                    </div>
                  </div>
                  {formData.roomType && !isViewMode && (
                    <p className="text-xs text-gray-500 mt-1">
                      Auto-filled based on room type
                    </p>
                  )}
                </div>
              </div>

              {/* Guest Information */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Guest Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Family Name/Last Name *
                    </label>
                    <Input
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="SMITH"
                      className="uppercase"
                      required
                      disabled={isViewMode}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name *
                    </label>
                    <Input
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="JOHN"
                      className="uppercase"
                      required
                      disabled={isViewMode}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address
                    </label>
                    <Input
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Street address"
                      disabled={isViewMode}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Personal Phone Number
                    </label>
                    <Input
                      name="personalPhone"
                      value={formData.personalPhone}
                      onChange={handleChange}
                      placeholder="e.g., +62 812 3456 7890"
                      disabled={isViewMode}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Advance Deposit
                    </label>
                    <Input
                      name="advanceDeposit"
                      value={formData.advanceDeposit}
                      onChange={handleChange}
                      placeholder="Amount"
                      disabled={isViewMode}
                    />
                  </div>
                </div>
              </div>

              {/* Company & Document Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name
                  </label>
                  <Input
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    placeholder="Company name"
                    disabled={isViewMode}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Phone
                  </label>
                  <Input
                    name="companyPhone"
                    value={formData.companyPhone}
                    onChange={handleChange}
                    placeholder="Phone number"
                    disabled={isViewMode}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Address
                  </label>
                  <Input
                    name="companyAddress"
                    value={formData.companyAddress}
                    onChange={handleChange}
                    placeholder="Company address"
                    disabled={isViewMode}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Passport/ID Card Number
                  </label>
                  <Input
                    name="passportId"
                    value={formData.passportId}
                    onChange={handleChange}
                    placeholder="A1234567"
                    disabled={isViewMode}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nationality
                  </label>
                  <Input
                    name="nationality"
                    value={formData.nationality}
                    onChange={handleChange}
                    placeholder="Indonesian"
                    disabled={isViewMode}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date of Issue
                  </label>
                  <Input
                    name="dateOfIssue"
                    type="date"
                    value={formData.dateOfIssue}
                    onChange={handleChange}
                    disabled={isViewMode}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date of Birth
                </label>
                <Input
                  name="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className="max-w-xs"
                  disabled={isViewMode}
                />
              </div>

              {/* Payment Information */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Form of Settlement
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center gap-2 mb-2">
                      <input
                        type="checkbox"
                        name="paymentCash"
                        checked={formData.paymentCash}
                        onChange={handleChange}
                        className="w-4 h-4"
                        disabled={isViewMode}
                      />
                      <span className="text-sm font-medium">CASH</span>
                    </label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Voucher Number
                    </label>
                    <Input
                      name="voucherNumber"
                      value={formData.voucherNumber}
                      onChange={handleChange}
                      placeholder="Voucher number"
                      disabled={isViewMode}
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 mb-2">
                      <input
                        type="checkbox"
                        name="paymentCredit"
                        checked={formData.paymentCredit}
                        onChange={handleChange}
                        className="w-4 h-4"
                        disabled={isViewMode}
                      />
                      <span className="text-sm font-medium">CREDIT CARD</span>
                    </label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Credit Card Number
                    </label>
                    <Input
                      name="creditCardNumber"
                      value={formData.creditCardNumber}
                      onChange={handleChange}
                      placeholder="Card number"
                      disabled={isViewMode}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Approval Code
                    </label>
                    <Input
                      name="approvalCode"
                      value={formData.approvalCode}
                      onChange={handleChange}
                      placeholder="Approval code"
                      disabled={isViewMode}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Remark
                </label>
                <textarea
                  name="remark"
                  value={formData.remark}
                  onChange={handleChange}
                  placeholder="Additional notes..."
                  className="w-full h-20 px-3 py-2 rounded-md border border-gray-300"
                  disabled={isViewMode}
                />
              </div>

              {/* Clerk Name */}
              <div className="border-t pt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Clerk (Staff Name)
                </label>
                <Input
                  name="clerk"
                  value={formData.clerk}
                  readOnly
                  className="bg-gray-100 cursor-not-allowed text-gray-700"
                  placeholder="Loading..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  This field is automatically filled from your account
                </p>
              </div>

              {/* Additional Check-in Information */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Stay Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Room Number
                    </label>
                    <Input
                      name="roomNo"
                      value={formData.roomNo}
                      onChange={handleChange}
                      placeholder="e.g., 101, 205"
                      disabled={isViewMode}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Discount (%)
                    </label>
                    <Input
                      name="discount"
                      type="number"
                      min="0"
                      max="100"
                      value={formData.discount}
                      onChange={handleChange}
                      placeholder="e.g., 10"
                      disabled={isViewMode}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Number of Persons
                    </label>
                    <Input
                      name="person"
                      type="number"
                      min="1"
                      value={formData.person}
                      onChange={handleChange}
                      placeholder="e.g., 2"
                      disabled={isViewMode}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                >
                  {isViewMode ? "Back" : "Cancel"}
                </Button>
                <Button
                  type="button"
                  onClick={handleCheckOutAndPrint}
                  disabled={!canCheckOut}
                  className={`${
                    canCheckOut
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "bg-gray-300 cursor-not-allowed"
                  }`}
                >
                  {canCheckOut ? "Check Out & Print →" : "Already Checked-Out"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 🔹 Print View (setelah berhasil check-out)
  return (
    <div className="min-h-screen p-8 print:p-0">
      <div className="max-w-5xl mx-auto">
        <style>{`
          @media print {
            @page { size: A4 portrait; margin: 6mm; }
            html, body { margin: 0 !important; padding: 0 !important; height: auto !important; min-height: 0 !important; overflow: visible !important; }
            body * { visibility: hidden; }
            .print-area, .print-area * { visibility: visible; }
            .print-area {
              position: absolute; left: 0; top: 0;
              width: 100%; padding: 4px !important;
              min-height: 0 !important;
              height: auto !important;
              page-break-inside: avoid;
            }
            .no-print { display: none !important; }
            .min-h-screen { min-height: 0 !important; }
            table { page-break-inside: avoid; border-collapse: collapse; width: 100%; }
            td, th { border: 1px solid #000; padding: 3px; font-size: 9px; }
            .blue-bg { background-color: #6CB4EE !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            img { max-height: 70px !important; width: auto !important; }
          }
        `}</style>

        <div className="no-print mb-6 flex justify-between items-center">
          <Button variant="outline" onClick={handleBack}>
            ← Back to History
          </Button>
          <Button
            onClick={handlePrint}
            className="bg-green-600 hover:bg-green-700"
          >
            <FileText className="w-4 h-4 mr-2" />
            Print / Save PDF
          </Button>
        </div>

        <div className="print-area bg-white border-4 border-blue-600 p-4 print:border-4">
          <div className="flex justify-between items-center mb-2">
            <Image
              src="/logo/DAMAGA SUITES MRR.png"
              alt="DAMAGA Logo"
              width={100}
              height={100}
              className="object-contain"
            />
            <h1 className="text-3xl font-bold tracking-wider">
              CHECK-OUT FORM
            </h1>
          </div>

          <table className="w-full border-2 border-black mb-0">
            <thead>
              <tr className="blue-bg bg-blue-300">
                <th className="border-2 border-black p-2 text-xs font-bold">
                  Arrival Date
                </th>
                <th className="border-2 border-black p-2 text-xs font-bold">
                  Departure Date
                </th>
                <th className="border-2 border-black p-2 text-xs font-bold">
                  Number of Room
                </th>
                <th className="border-2 border-black p-2 text-xs font-bold">
                  Room Type
                </th>
                <th className="border-2 border-black p-2 text-xs font-bold">
                  Daily Rate
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border-2 border-black p-3 text-center text-sm">
                  {formData.arrivalDate}
                </td>
                <td className="border-2 border-black p-3 text-center text-sm">
                  {formData.departureDate}
                </td>
                <td className="border-2 border-black p-3 text-center text-sm">
                  {formData.numberOfRooms}
                </td>
                <td className="border-2 border-black p-3 text-center text-sm uppercase">
                  {formData.roomType}
                </td>
                <td className="border-2 border-black p-3 text-center text-sm">
                  {getCurrencySymbol()} {formatNumber(formData.dailyRate)}
                </td>
              </tr>
            </tbody>
          </table>

          <table className="w-full border-2 border-black border-t-0 mb-0">
            <tbody>
              <tr>
                <td
                  className="border-2 border-black p-2 w-2/3 align-top"
                  colSpan={3}
                >
                  <div className="blue-bg bg-blue-300 font-bold text-xs mb-1 p-1 text-center">
                    PLEASE USE BLOCK LETTERS
                  </div>
                  <div className="space-y-0.5 text-xs">
                    <div className="flex items-center gap-1">
                      <span className="font-semibold">Family Name/Last Name</span>
                      <span>:</span>
                      <span className="uppercase font-bold">{formData.lastName}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-semibold">First Name</span>
                      <span>:</span>
                      <span className="uppercase font-bold">{formData.firstName}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-semibold">Address</span>
                      <span>:</span>
                      <span>{formData.address}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-semibold">Phone Number</span>
                      <span>:</span>
                      <span>{formData.personalPhone || "-"}</span>
                    </div>
                    <div className="border-t border-gray-400 my-1 pt-1">
                      <div className="font-semibold text-xs mb-0.5">Form of Settlement</div>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
                        <div className="flex items-center gap-1">
                          <span className="font-semibold">CASH</span>
                          <span>{formData.paymentCash ? "☑" : "☐"}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="font-semibold">VOUCHER</span>
                          <span>:</span>
                          <span>{formData.voucherNumber || "-"}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="font-semibold">CREDIT CARD</span>
                          <span>{formData.paymentCredit ? "☑" : "☐"}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="font-semibold">Number</span>
                          <span>:</span>
                          <span>{formData.creditCardNumber || "-"}</span>
                        </div>
                        <div className="flex items-center gap-1 col-span-2">
                          <span className="font-semibold">Approval Code</span>
                          <span>:</span>
                          <span>{formData.approvalCode || "-"}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="border-2 border-black p-2 w-1/3 align-top">
                  <div className="blue-bg bg-blue-300 font-bold text-xs mb-2 p-1 text-center">
                    Advance Deposit
                  </div>
                  <div className="h-12 flex items-center justify-center text-base font-bold">
                    {formData.advanceDeposit || "-"}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <table className="w-full border-2 border-black border-t-0 mb-0">
            <tbody>
              <tr>
                <td className="border-2 border-black p-2 w-1/2 align-top">
                  <div className="blue-bg bg-blue-300 font-bold text-xs mb-2 p-1 text-center">
                    Company
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex gap-1">
                      <span className="font-semibold">Name</span>
                      <span>:</span>
                      <span>{formData.companyName || "-"}</span>
                    </div>
                    <div className="flex gap-1">
                      <span className="font-semibold">Phone</span>
                      <span>:</span>
                      <span>{formData.companyPhone || "-"}</span>
                    </div>
                    <div className="flex gap-1">
                      <span className="font-semibold">Address</span>
                      <span>:</span>
                      <span>{formData.companyAddress || "-"}</span>
                    </div>
                    <div className="flex gap-1 mt-2">
                      <span className="font-semibold">
                        Passport/ID Card Number
                      </span>
                      <span>:</span>
                      <span>{formData.passportId || "-"}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-semibold">Nationality</span>
                      <span>:</span>
                      <span>{formData.nationality || "-"}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-semibold">Date of Issue</span>
                      <span>:</span>
                      <span>{formData.dateOfIssue || "-"}</span>
                    </div>
                  </div>
                </td>
                <td className="border-2 border-black p-2 w-1/2 align-top">
                  <div className="blue-bg bg-blue-300 font-bold text-xs mb-2 p-1 text-center">
                    Date of Birth
                  </div>
                  <div className="text-xs p-2">
                    <span className="font-semibold">Date of Birth</span>
                    <span>: </span>
                    <span>{formData.dateOfBirth || "-"}</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>


          <table className="w-full border-2 border-black border-t-0 mb-0">
            <tbody>
              <tr>
                <td className="border-2 border-black p-2" colSpan={5}>
                  <div className="text-xs leading-relaxed">
                    Money, jewels and other valuables must be placed in the
                    hotel safety box, otherwise the management will{" "}
                    <strong>not be responsible</strong> for any loss. Signature
                    authorizes after departure billing indicated in method of
                    payment.
                  </div>
                </td>
                <td
                  className="border-2 border-black p-2 text-center"
                  rowSpan={2}
                >
                  <div className="text-xs font-semibold mb-1">
                    Guest Signature
                  </div>
                  <div className="h-16"></div>
                </td>
              </tr>
              <tr className="blue-bg bg-blue-300">
                <th className="border-2 border-black p-2 text-xs font-bold">
                  Room No
                </th>
                <th className="border-2 border-black p-2 text-xs font-bold">
                  Discount
                </th>
                <th className="border-2 border-black p-2 text-xs font-bold">
                  Person
                </th>
                <th className="border-2 border-black p-2 text-xs font-bold">
                  Time
                </th>
                <th className="border-2 border-black p-2 text-xs font-bold">
                  Clerk
                </th>
              </tr>
              <tr>
                <td className="border-2 border-black p-3 text-center text-xs">
                  {formData.roomNo || "-"}
                </td>
                <td className="border-2 border-black p-3 text-center text-xs">
                  {formData.discount ? `${formData.discount}%` : "-"}
                </td>
                <td className="border-2 border-black p-3 text-center text-xs">
                  {formData.person || "-"}
                </td>
                <td className="border-2 border-black p-3 text-center text-xs">
                  {new Date().toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>
                <td className="border-2 border-black p-3 text-center text-xs">
                  {formData.clerk || "-"}
                </td>
                <td className="border-2 border-black p-2"></td>
              </tr>
            </tbody>
          </table>

          <table className="w-full border-2 border-black border-t-0">
            <tbody>
              <tr>
                <td className="border-2 border-black p-2">
                  <div className="text-xs">
                    <span className="font-semibold">Remark Client:</span>
                    <span className="ml-2">{formData.remark || "-"}</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

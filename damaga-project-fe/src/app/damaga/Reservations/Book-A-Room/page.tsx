"use client";

import React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown, CheckCircle } from "lucide-react";

const countries = [
  { value: "afghanistan", label: "Afghanistan" },
  { value: "albania", label: "Albania" },
  { value: "algeria", label: "Algeria" },
  { value: "andorra", label: "Andorra" },
  { value: "argentina", label: "Argentina" },
  { value: "australia", label: "Australia" },
  { value: "austria", label: "Austria" },
  { value: "bangladesh", label: "Bangladesh" },
  { value: "belgium", label: "Belgium" },
  { value: "brazil", label: "Brazil" },
  { value: "brunei", label: "Brunei" },
  { value: "cambodia", label: "Cambodia" },
  { value: "canada", label: "Canada" },
  { value: "chile", label: "Chile" },
  { value: "china", label: "China" },
  { value: "colombia", label: "Colombia" },
  { value: "denmark", label: "Denmark" },
  { value: "egypt", label: "Egypt" },
  { value: "finland", label: "Finland" },
  { value: "france", label: "France" },
  { value: "germany", label: "Germany" },
  { value: "greece", label: "Greece" },
  { value: "india", label: "India" },
  { value: "indonesia", label: "Indonesia" },
  { value: "iran", label: "Iran" },
  { value: "iraq", label: "Iraq" },
  { value: "ireland", label: "Ireland" },
  { value: "italy", label: "Italy" },
  { value: "japan", label: "Japan" },
  { value: "jordan", label: "Jordan" },
  { value: "malaysia", label: "Malaysia" },
  { value: "mexico", label: "Mexico" },
  { value: "netherlands", label: "Netherlands" },
  { value: "new zealand", label: "New Zealand" },
  { value: "norway", label: "Norway" },
  { value: "pakistan", label: "Pakistan" },
  { value: "philippines", label: "Philippines" },
  { value: "poland", label: "Poland" },
  { value: "portugal", label: "Portugal" },
  { value: "qatar", label: "Qatar" },
  { value: "russia", label: "Russia" },
  { value: "saudi arabia", label: "Saudi Arabia" },
  { value: "singapore", label: "Singapore" },
  { value: "south africa", label: "South Africa" },
  { value: "south korea", label: "South Korea" },
  { value: "spain", label: "Spain" },
  { value: "sweden", label: "Sweden" },
  { value: "switzerland", label: "Switzerland" },
  { value: "thailand", label: "Thailand" },
  { value: "turkey", label: "Turkey" },
  { value: "uae", label: "United Arab Emirates" },
  { value: "uk", label: "United Kingdom" },
  { value: "usa", label: "United States" },
  { value: "vietnam", label: "Vietnam" },
];

// ✅ FIXED: Semua nomor kamar yang tersedia (konsisten dengan AvailabilityCalendar)
const roomNumbers = [
  "201", "202", "203", "204", "205", "206", "207", "208", "209", "210",
  "301", "302", "303", "304", "305", "306", "307", "308", "309", "310",
  "401", "402", "403", "404", "405", "406", "407", "408", "409", "410",
];

interface RoomRate {
  _id?: string;
  roomType: string;
  roomTypeName?: string;
  priceUSD: number;
  priceIDR: number;
}

export default function BookARoomForm() {
  const router = useRouter();
  const [countryOpen, setCountryOpen] = useState(false);
  const [roomsPopoverOpen, setRoomsPopoverOpen] = useState(false);
  const [currency, setCurrency] = useState<"USD" | "IDR">("USD");

  const [roomRates, setRoomRates] = useState<RoomRate[]>([]);
  const [roomRateLoading, setRoomRateLoading] = useState<boolean>(false);
  const [roomRateError, setRoomRateError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    FirstName: "",
    LastName: "",
    Address: "",
    Country: "",
    Phone: "",
    RoomType: "",
    NoOfRoom: 1,
    ArrDate: new Date().toISOString().split("T")[0],
    DeptDate: new Date().toISOString().split("T")[0],
    TypeOfGuest: "",
    City: "",
    ZipCode: 0,
    Fax: "",
    RoomRate: 0,
    NumberOfPerson: 1,
    ArrTime: "12:00",
    DeptTime: "12:00",
    Payment: "",
    ReservationMadeBy: "Direct",
    Request: "None",
    Clerk: "Admin",
  });

  const [selectedRooms, setSelectedRooms] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State for existing bookings to filter out already-booked rooms
  const [existingBookings, setExistingBookings] = useState<Array<{
    RoomNumber?: string;
    ArrDate: string;
    DeptDate: string;
    status?: string;
  }>>([]);

  // Fetch existing bookings to check room availability
  const fetchExistingBookings = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/book-a-room?t=${Date.now()}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
        }
      );
      if (!res.ok) return;
      const data = await res.json();
      const bookings = Array.isArray(data) ? data : data.bookings || [];
      setExistingBookings(bookings);
    } catch (err) {
      console.error("Failed to fetch existing bookings:", err);
    }
  };

const roomTypeMapping: Record<string, string> = {
  "201": "DSD", "202": "DST", "203": "DDD", "204": "DDT", "205": "DSTD", "206": "DSTT", "207": "DDT", "208": "DSTD", "209": "DSTT", "210": "DSTT",
  "301": "DSD", "302": "DST", "303": "DDD", "304": "DDT", "305": "DSTD", "306": "DSTT", "307": "DDT", "308": "DSTD", "309": "DSTT", "310": "DSTT",
  "401": "DSD", "402": "DST", "403": "DDD", "404": "DDT", "405": "DSTD", "406": "DSTT", "407": "DDT", "408": "DSTD", "409": "DSTT", "410": "DSTT",
};

  // Compute available rooms and booked rooms
  const getRoomOptions = () => {
    // Active statuses that occupy a room
    const activeStatuses = ["confirmed", "checked-in", "in-house", "stay-over", "pending"];
    const bookedRooms = new Set<string>();

    if (formData.ArrDate && formData.DeptDate) {
      const selectedArr = new Date(formData.ArrDate).getTime();
      const selectedDept = new Date(formData.DeptDate).getTime();

      existingBookings.forEach((booking) => {
        if (!booking.RoomNumber) return;
        const statusLower = (booking.status || "").toLowerCase();
        if (!activeStatuses.includes(statusLower)) return;

        const bookingArr = new Date(booking.ArrDate).getTime();
        const bookingDept = new Date(booking.DeptDate).getTime();

        // Check date overlap: two ranges overlap if one starts before the other ends
        if (selectedArr < bookingDept && selectedDept > bookingArr) {
          bookedRooms.add(booking.RoomNumber);
        }
      });
    }

    return roomNumbers
      .filter((room) => {
        // Must match selected room type, if a room type is selected
        if (formData.RoomType && roomTypeMapping[room] !== formData.RoomType) return false;
        return true;
      })
      .map((room) => ({
        roomNo: room,
        isBooked: bookedRooms.has(room)
      }));
  };

  const roomOptions = getRoomOptions();

  const getCurrencySymbol = () => {

    return currency === "USD" ? "$" : "Rp";
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString("en-US", {
      minimumFractionDigits: currency === "USD" ? 2 : 0,
      maximumFractionDigits: currency === "USD" ? 2 : 0,
    });
  };

  const getRoomRateFromBackend = (
    roomType: string,
    curr: "USD" | "IDR"
  ): number => {
    const rate = roomRates.find((r) => r.roomType === roomType);
    if (!rate) return 0;
    return curr === "USD" ? rate.priceUSD : rate.priceIDR;
  };

  const handleRoomTypeChange = (roomType: string) => {
    setFormData((prev) => {
      const newRoomRate = getRoomRateFromBackend(roomType, currency);
      return {
        ...prev,
        RoomType: roomType,
        RoomRate: newRoomRate,
      };
    });
  };

  const handleCurrencyChange = (newCurrency: "USD" | "IDR") => {
    setCurrency(newCurrency);
    if (formData.RoomType) {
      const newRoomRate = getRoomRateFromBackend(
        formData.RoomType,
        newCurrency
      );
      setFormData((prev) => ({
        ...prev,
        RoomRate: newRoomRate,
      }));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (
      name === "NoOfRoom" ||
      name === "NumberOfPerson" ||
      name === "ZipCode"
    ) {
      setFormData({
        ...formData,
        [name]: Number(value) || 0,
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const requiredFields = [
        "FirstName",
        "LastName",
        "Address",
        "Country",
        "Phone",
        "RoomType",
        "TypeOfGuest",
        "City",
        "RoomRate",
        "NumberOfPerson",
        "ArrTime",
        "DeptTime",
        "Payment",
        "Clerk",
      ];

      for (const field of requiredFields) {
        const value = formData[field as keyof typeof formData];
        if (value === "" || value === null || value === undefined) {
          alert(`${field} harus diisi`);
          setIsSubmitting(false);
          return;
        }
      }

      const totalRooms = Number(formData.NoOfRoom) || 0;

      if (totalRooms < 1) {
        alert("No Of Room minimal 1");
        setIsSubmitting(false);
        return;
      }

      if (selectedRooms.length === 0) {
        alert("Pilih minimal 1 Room Number untuk dibooking");
        setIsSubmitting(false);
        return;
      }

      if (selectedRooms.length !== totalRooms) {
        alert(
          `Jumlah Room Number yang dipilih (${selectedRooms.length}) tidak sama dengan No Of Room (${totalRooms}). Sesuaikan dulu.`
        );
        setIsSubmitting(false);
        return;
      }

      // ✅ FIXED: Kirim multiple booking dengan RoomNumber yang jelas
      for (const roomNo of selectedRooms) {
        const submitData = {
          ...formData,
          Phone: Number(formData.Phone),
          NoOfRoom: totalRooms,
          RoomNumber: roomNo, // ✅ Field ini WAJIB ada dan berisi nomor kamar
          ZipCode: Number(formData.ZipCode) || 0,
          RoomRate: Number(formData.RoomRate) || 0,
          RoomRateCurrency: currency,
          NumberOfPerson: Number(formData.NumberOfPerson) || 1,
          Fax: formData.Fax?.toString() || "",
          status: "confirmed", // ✅ Status confirmed agar muncul di availability
          Source: "Book A Room Form",
        };

        console.log("📤 Sending booking data:", {
          RoomNumber: roomNo,
          Name: `${formData.FirstName} ${formData.LastName}`,
          ArrDate: formData.ArrDate,
          DeptDate: formData.DeptDate,
          status: submitData.status
        });

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/book-a-room`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(submitData),
          }
        );

        const data = await res.json();

        if (!res.ok) {
          throw new Error(
            data.message || `Error pada kamar ${roomNo}: ${res.status}`
          );
        }

        console.log("✅ Booking success untuk kamar", roomNo, ":", data);
      }

      alert(
        `✅ Booking berhasil dikonfirmasi!\n\nGuest: ${formData.FirstName} ${
          formData.LastName
        }\nRoom Type: ${
          formData.RoomType
        }\nJumlah Kamar: ${totalRooms}\nRoom Numbers: ${selectedRooms.join(
          ", "
        )}\nStatus: Confirmed\n\nSemua booking akan muncul di Reservation History & Availability.`
      );

      // Reset form
      setFormData({
        FirstName: "",
        LastName: "",
        Address: "",
        Country: "",
        Phone: "",
        RoomType: "",
        NoOfRoom: 1,
        ArrDate: new Date().toISOString().split("T")[0],
        DeptDate: new Date().toISOString().split("T")[0],
        TypeOfGuest: "",
        City: "",
        ZipCode: 0,
        Fax: "",
        RoomRate: 0,
        NumberOfPerson: 1,
        ArrTime: "12:00",
        DeptTime: "12:00",
        Payment: "",
        ReservationMadeBy: "Direct",
        Request: "None",
        Clerk: formData.Clerk,
      });
      setSelectedRooms([]);
      setCurrency("USD");

      setTimeout(() => {
        const confirmRedirect = confirm(
          "Apakah Anda ingin melihat booking di Reservation History?"
        );
        if (confirmRedirect) {
          router.push("/damaga/Reservations/ReservationHistory?refresh=true");
        }
      }, 1000);
    } catch (err: unknown) {
      console.error("❌ Error submitting booking:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      alert(`❌ Gagal submit booking: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setFormData((prev) => ({
          ...prev,
          Clerk: parsed.username || parsed.name || "Unknown Clerk",
        }));
      } catch {}
    }
    fetchExistingBookings();
  }, []);

  // Re-fetch bookings when dates change to update available rooms
  useEffect(() => {
    fetchExistingBookings();
    // Clear selected rooms that are no longer available
    setSelectedRooms((prev) => {
      const validOptions = getRoomOptions()
        .filter((r) => !r.isBooked)
        .map((r) => r.roomNo);
      return prev.filter((room) => validOptions.includes(room));
    });
  }, [formData.ArrDate, formData.DeptDate, formData.RoomType]);

  useEffect(() => {
    const fetchRoomRates = async () => {
      setRoomRateLoading(true);
      setRoomRateError(null);

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/room-rates`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }
        );

        if (!res.ok) {
          throw new Error("Failed to fetch room rates");
        }

        const data = await res.json();
        const rates: RoomRate[] = Array.isArray(data) ? data : data.rates || [];
        setRoomRates(rates);
      } catch (err) {
        console.error("Error fetching room rates:", err);
        setRoomRateError("Gagal mengambil data room rate dari server.");
      } finally {
        setRoomRateLoading(false);
      }
    };

    fetchRoomRates();
  }, []);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-7xl mx-auto">
        <div className="bg-white p-6 sm:p-8 lg:p-10 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl font-semibold text-sky-500">
              Book A Room
            </h2>
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg border border-blue-200">
              <CheckCircle className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">
                Status: Confirmed
              </span>
            </div>
          </div>

          <div className="mb-6 p-4 bg-sky-50 rounded-lg border border-sky-200">
            <p className="text-sm text-sky-700">
              <strong>ℹ️ Info:</strong> Semua booking yang dibuat melalui form
              ini akan otomatis memiliki status{" "}
              <span className="font-semibold">CONFIRMED</span> dan akan muncul
              di Reservation History & Availability. Untuk multiple booking,
              sistem akan membuat 1 record per nomor kamar.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 mb-8">
            {/* First Name */}
            <div className="w-full">
              <Label className="text-sm font-medium mb-2 block text-sky-500">
                First Name *
              </Label>
              <Input
                name="FirstName"
                value={formData.FirstName}
                onChange={handleChange}
                placeholder="Enter first name"
                className="w-full h-10"
              />
            </div>

            {/* Last Name */}
            <div className="w-full">
              <Label className="text-sm font-medium mb-2 block text-sky-500">
                Last Name *
              </Label>
              <Input
                name="LastName"
                value={formData.LastName}
                onChange={handleChange}
                placeholder="Enter last name"
                className="w-full h-10"
              />
            </div>

            {/* Phone */}
            <div className="w-full">
              <Label className="text-sm font-medium mb-2 block text-sky-500">
                Phone *
              </Label>
              <Input
                name="Phone"
                type="tel"
                value={formData.Phone}
                onChange={handleChange}
                placeholder="Enter phone number"
                className="w-full h-10"
              />
            </div>

            {/* Address */}
            <div className="w-full sm:col-span-2 lg:col-span-1">
              <Label className="text-sm font-medium mb-2 block text-sky-500">
                Address *
              </Label>
              <Input
                name="Address"
                value={formData.Address}
                onChange={handleChange}
                placeholder="Enter address"
                className="w-full h-10"
              />
            </div>

            {/* City */}
            <div className="w-full">
              <Label className="text-sm font-medium mb-2 block text-sky-500">
                City *
              </Label>
              <Input
                name="City"
                value={formData.City}
                onChange={handleChange}
                placeholder="Enter city"
                className="w-full h-10"
              />
            </div>

            {/* Country */}
            <div className="w-full">
              <Label className="text-sm font-medium mb-2 block text-sky-500">
                Country *
              </Label>
              <Popover open={countryOpen} onOpenChange={setCountryOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={countryOpen}
                    className="w-full h-10 justify-between font-normal"
                  >
                    {formData.Country
                      ? countries.find(
                          (country) => country.label === formData.Country
                        )?.label
                      : "Select country..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0">
                  <Command>
                    <CommandInput placeholder="Search country..." />
                    <CommandEmpty>No country found.</CommandEmpty>
                    <CommandGroup className="max-h-64 overflow-auto">
                      {countries.map((country) => (
                        <CommandItem
                          key={country.value}
                          value={country.value}
                          onSelect={() => {
                            setFormData({
                              ...formData,
                              Country: country.label,
                            });
                            setCountryOpen(false);
                          }}
                        >
                          <Check
                            className={`mr-2 h-4 w-4 ${
                              formData.Country === country.label
                                ? "opacity-100"
                                : "opacity-0"
                            }`}
                          />
                          {country.label}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* ZipCode */}
            <div className="w-full">
              <Label className="text-sm font-medium mb-2 block text-sky-500">
                Zip Code
              </Label>
              <Input
                name="ZipCode"
                type="number"
                value={formData.ZipCode}
                onChange={handleChange}
                placeholder="Enter zip code"
                className="w-full h-10"
              />
            </div>

            {/* Fax */}
            <div className="w-full">
              <Label className="text-sm font-medium mb-2 block text-sky-500">
                Fax
              </Label>
              <Input
                name="Fax"
                value={formData.Fax}
                onChange={handleChange}
                placeholder="Enter Fax"
                className="w-full h-10"
              />
            </div>

            {/* Room Type */}
            <div className="w-full">
              <Label className="text-sm font-medium mb-2 block text-sky-500">
                Room Type *
              </Label>
              <Select
                name="RoomType"
                value={formData.RoomType}
                onValueChange={handleRoomTypeChange}
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
                  <SelectItem value="DDT">DDT (Damaga Deluxe Twin)</SelectItem>
                  <SelectItem value="DSTD">
                    DSTD (Damaga Suite Double)
                  </SelectItem>
                  <SelectItem value="DSTT">
                    DSTT (Damaga Suite Twin)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* No Of Room */}
            <div className="w-full">
              <Label className="text-sm font-medium mb-2 block text-sky-500">
                No Of Room *
              </Label>
              <Input
                name="NoOfRoom"
                type="number"
                min={1}
                value={formData.NoOfRoom}
                onChange={handleChange}
                placeholder="Masukkan jumlah kamar"
                className="w-full h-10"
              />
              <p className="text-xs text-gray-500 mt-1">
                Ini adalah jumlah kamar yang akan dibooking.
              </p>
            </div>

            {/* Room Numbers (multi-select) */}
            <div className="w-full">
              <Label className="text-sm font-medium mb-2 block text-sky-500">
                Room Numbers (multi) *
              </Label>
              <Popover
                open={roomsPopoverOpen}
                onOpenChange={setRoomsPopoverOpen}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={roomsPopoverOpen}
                    className="w-full h-10 justify-between font-normal"
                  >
                    {selectedRooms.length > 0
                      ? selectedRooms.join(", ")
                      : "Select room numbers..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[260px] p-0">
                  <Command>
                    <CommandInput placeholder="Search room..." />
                    <CommandEmpty>No room found.</CommandEmpty>
                    <CommandGroup className="max-h-64 overflow-auto">
                      {roomOptions.map(({ roomNo, isBooked }) => {
                        const isSelected = selectedRooms.includes(roomNo);
                        return (
                          <CommandItem
                            key={roomNo}
                            value={roomNo}
                            disabled={isBooked}
                            className={isBooked ? "opacity-50 cursor-not-allowed text-gray-400" : ""}
                            onSelect={() => {
                              if (isBooked) return;
                              setSelectedRooms((prev) =>
                                isSelected
                                  ? prev.filter((r) => r !== roomNo)
                                  : [...prev, roomNo]
                              );
                            }}
                          >
                            <Check
                              className={`mr-2 h-4 w-4 ${
                                isSelected ? "opacity-100" : "opacity-0"
                              }`}
                            />
                            {roomNo} {isBooked && "(Booked)"}
                          </CommandItem>
                        );
                      })}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
              <p className="text-xs text-gray-500 mt-1">
                Pilih {formData.NoOfRoom || 0} kamar. Sistem akan membuat 1
                booking per nomor kamar.
              </p>
            </div>

            {/* Type of Guest */}
            <div className="w-full">
              <Label className="text-sm font-medium mb-2 block text-sky-500">
                Type of Guest *
              </Label>
              <Input
                name="TypeOfGuest"
                value={formData.TypeOfGuest}
                onChange={handleChange}
                placeholder="e.g., Business, Tourist"
                className="w-full h-10"
              />
            </div>

            {/* Number of Persons */}
            <div className="w-full">
              <Label className="text-sm font-medium mb-2 block text-sky-500">
                No of Persons *
              </Label>
              <Input
                name="NumberOfPerson"
                type="number"
                min="1"
                step="1"
                value={formData.NumberOfPerson}
                onChange={handleChange}
                placeholder="Enter number"
                className="w-full h-10"
              />
            </div>

            {/* Arrival Date */}
            <div className="w-full">
              <Label className="text-sm font-medium mb-2 block text-sky-500">
                Arrival Date *
              </Label>
              <Input
                name="ArrDate"
                type="date"
                value={formData.ArrDate}
                onChange={handleChange}
                className="w-full h-10"
              />
            </div>

            {/* Arrival Time */}
            <div className="w-full">
              <Label className="text-sm font-medium mb-2 block text-sky-500">
                Arrival Time *
              </Label>
              <Input
                name="ArrTime"
                type="time"
                value={formData.ArrTime}
                onChange={handleChange}
                className="w-full h-10"
              />
            </div>

            {/* Departure Date */}
            <div className="w-full">
              <Label className="text-sm font-medium mb-2 block text-sky-500">
                Departure Date *
              </Label>
              <Input
                name="DeptDate"
                type="date"
                value={formData.DeptDate}
                onChange={handleChange}
                className="w-full h-10"
              />
            </div>

            {/* Departure Time */}
            <div className="w-full">
              <Label className="text-sm font-medium mb-2 block text-sky-500">
                Departure Time *
              </Label>
              <Input
                name="DeptTime"
                type="time"
                value={formData.DeptTime}
                onChange={handleChange}
                className="w-full h-10"
              />
            </div>

            {/* Currency Selector */}
            <div className="w-full">
              <Label className="text-sm font-medium mb-2 block text-sky-500">
                Currency *
              </Label>
              <Select value={currency} onValueChange={handleCurrencyChange}>
                <SelectTrigger className="w-full h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="IDR">IDR (Rp)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Room Rate */}
            <div className="w-full">
              <Label className="text-sm font-medium mb-2 block text-sky-500">
                Room Rate ({getCurrencySymbol()}) *
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                  {getCurrencySymbol()}
                </span>
                <Input
                  name="RoomRate"
                  type="text"
                  value={
                    formData.RoomRate > 0 ? formatNumber(formData.RoomRate) : ""
                  }
                  onChange={(e) => {
                    const value = e.target.value.replace(/,/g, "");
                    if (!isNaN(Number(value)) || value === "") {
                      setFormData({
                        ...formData,
                        RoomRate: Number(value) || 0,
                      });
                    }
                  }}
                  placeholder={
                    roomRateLoading
                      ? "Loading room rates..."
                      : "Select room type first"
                  }
                  className="w-full h-10 pl-12"
                />
              </div>
              {roomRateError && (
                <p className="text-xs text-red-500 mt-1">{roomRateError}</p>
              )}
              {formData.RoomType && !roomRateError && (
                <p className="text-xs text-gray-500 mt-1">
                  Auto-filled based on latest room rate
                </p>
              )}
            </div>

            {/* Payment */}
            <div className="w-full">
              <Label className="text-sm font-medium mb-2 block text-sky-500">
                Payment Method *
              </Label>
              <Select
                name="Payment"
                value={formData.Payment}
                onValueChange={(val) =>
                  setFormData({ ...formData, Payment: val })
                }
              >
                <SelectTrigger className="w-full h-10">
                  <SelectValue placeholder="Select Payment Method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="Debit">Debit</SelectItem>
                  <SelectItem value="Credit">Credit</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* Reservation Made By */}
            <div className="w-full">
              <Label className="text-sm font-medium mb-2 block text-sky-500">
                Reservation Made By *
              </Label>
              <Select
                name="ReservationMadeBy"
                value={formData.ReservationMadeBy}
                onValueChange={(val) =>
                  setFormData({ ...formData, ReservationMadeBy: val })
                }
              >
                <SelectTrigger className="w-full h-10">
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Phone">Phone</SelectItem>
                  <SelectItem value="Direct">Direct</SelectItem>
                  <SelectItem value="Letter">Letter</SelectItem>
                  <SelectItem value="Fax">Fax</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="w-full mb-4">
            <Label className="text-sm font-medium mb-2 block text-sky-500">
              Request *
            </Label>
            <Input
              name="Request"
              value={formData.Request}
              onChange={handleChange}
              placeholder="Enter Request"
              className="w-full h-20"
            />
          </div>

          <div className="w-full">
            <Label className="text-sm font-medium mb-2 block text-sky-500">
              Clerk *
            </Label>
            <Input
              name="Clerk"
              value={formData.Clerk}
              readOnly
              className="w-full h-10 bg-gray-100 cursor-not-allowed text-gray-700"
            />
          </div>

          <div className="flex justify-end pt-4 border-t mt-6">
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-8 h-11 text-base font-medium bg-sky-600 hover:bg-sky-700 text-white disabled:opacity-50"
            >
              {isSubmitting ? "Submitting..." : "Book Rooms (Confirm)"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

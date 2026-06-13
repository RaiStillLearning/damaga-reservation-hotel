"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Home, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";

interface RoomBooking {
  _id: string;
  RoomNumber?: string;
  NoOfRoom?: string | number;
  RoomType: string;
  ArrDate: string;
  DeptDate: string;
  FirstName: string;
  LastName: string;
  status?: string;
}

interface CalendarCell {
  date: Date;
  guestName?: string;
  isCheckIn?: boolean;
  isCheckOut?: boolean;
  isOccupied?: boolean;
}

interface RoomCalendar {
  roomNumber: string;
  roomType: string;
  days: CalendarCell[];
}

// ✅ Helper: parse date tanpa masalah timezone
const parseDateOnly = (dateStr: string): Date => {
  if (!dateStr) return new Date(NaN);
  const raw = dateStr.split("T")[0];
  const [y, m, d] = raw.split("-").map((v) => Number(v));
  return new Date(y, m - 1, d);
};

export default function AvailabilityCalendar() {
  const router = useRouter();
  const [bookings, setBookings] = useState<RoomBooking[]>([]);
  const [calendar, setCalendar] = useState<RoomCalendar[]>([]);
  const [loading, setLoading] = useState(false);
  const [userRole, setUserRole] = useState<string>("");
  const [mounted, setMounted] = useState(false);

  const [filters, setFilters] = useState({
    month: (new Date().getMonth() + 1).toString(),
    year: new Date().getFullYear().toString(),
    startDate: "",
    endDate: "",
  });

  const [viewMode, setViewMode] = useState<"month" | "range">("month");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUserRole(parsed.role || parsed.divisi || "");
      } catch (error) {
        console.error("Failed to parse user", error);
      }
    }
    setMounted(true);
  }, []);

  const generateCalendar = (sourceBookings: RoomBooking[] = bookings) => {
    let startDate: Date;
    let endDate: Date;

    if (viewMode === "month") {
      const year = parseInt(filters.year);
      const month = parseInt(filters.month) - 1;
      startDate = new Date(year, month, 1);
      endDate = new Date(year, month + 1, 0);
    } else {
      if (!filters.startDate || !filters.endDate) return;
      startDate = new Date(filters.startDate);
      endDate = new Date(filters.endDate);
    }

    const allRooms = [
      { number: "201", type: "DSD" },
      { number: "202", type: "DST" },
      { number: "203", type: "DDD" },
      { number: "204", type: "DDT" },
      { number: "205", type: "DSTD" },
      { number: "206", type: "DSTT" },
      { number: "207", type: "DDT" },
      { number: "208", type: "DSTD" },
      { number: "209", type: "DSTT" },
      { number: "210", type: "DSTT" },
      { number: "301", type: "DSD" },
      { number: "302", type: "DST" },
      { number: "303", type: "DDD" },
      { number: "304", type: "DDT" },
      { number: "305", type: "DSTD" },
      { number: "306", type: "DSTT" },
      { number: "307", type: "DDT" },
      { number: "308", type: "DSTD" },
      { number: "309", type: "DSTT" },
      { number: "310", type: "DSTT" },
      { number: "401", type: "DSD" },
      { number: "402", type: "DST" },
      { number: "403", type: "DDD" },
      { number: "404", type: "DDT" },
      { number: "405", type: "DSTD" },
      { number: "406", type: "DSTT" },
      { number: "407", type: "DDT" },
      { number: "408", type: "DSTD" },
      { number: "409", type: "DSTT" },
      { number: "410", type: "DSTT" },
    ];

    const roomCalendars: RoomCalendar[] = [];

    allRooms.forEach((room) => {
      const days: CalendarCell[] = [];
      const currentDate = new Date(startDate);

      while (currentDate <= endDate) {
        const booking = sourceBookings.find((b) => {
          const roomNum = b.RoomNumber;
          
          if (!roomNum || roomNum !== room.number) {
            return false;
          }

          // Hanya tampilkan status confirmed & checked-in
          if (
            b.status &&
            !["confirmed", "checked-in", "in-house"].includes(b.status.toLowerCase())
          ) {
            return false;
          }

          const arrDate = parseDateOnly(b.ArrDate);
          const deptDate = parseDateOnly(b.DeptDate);

          if (isNaN(arrDate.getTime()) || isNaN(deptDate.getTime())) {
            return false;
          }

          // ✅ FIX: Kurangi 1 hari dari departure date untuk availability
          // Jika check-in 18, check-out 20 → tampil 18-19 di kalender
          const adjustedDeptDate = new Date(deptDate);
          adjustedDeptDate.setDate(adjustedDeptDate.getDate() - 1);

          // Guest menempati room dari arrDate sampai sehari sebelum deptDate
          return currentDate >= arrDate && currentDate <= adjustedDeptDate;
        });

        const cell: CalendarCell = {
          date: new Date(currentDate),
        };

        if (booking) {
          const arrDate = parseDateOnly(booking.ArrDate);
          const deptDate = parseDateOnly(booking.DeptDate);
          
          // ✅ Adjust departure date untuk tampilan
          const adjustedDeptDate = new Date(deptDate);
          adjustedDeptDate.setDate(adjustedDeptDate.getDate() - 1);

          cell.guestName = `${booking.FirstName} ${booking.LastName}`;
          cell.isCheckIn =
            currentDate.toDateString() === arrDate.toDateString();
          // ✅ Check-out ditampilkan di hari terakhir stay (bukan hari check-out sebenarnya)
          cell.isCheckOut =
            currentDate.toDateString() === adjustedDeptDate.toDateString();
          cell.isOccupied = true;
        }

        days.push(cell);
        currentDate.setDate(currentDate.getDate() + 1);
      }

      roomCalendars.push({
        roomNumber: room.number,
        roomType: room.type,
        days,
      });
    });

    setCalendar(roomCalendars);
  };

  const fetchBookingData = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/book-a-room`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      const data = await res.json();
      const bookingData: RoomBooking[] = Array.isArray(data)
        ? data
        : data.bookings || [];
      
      console.log("📊 Total bookings loaded:", bookingData.length);
      console.log("📊 Sample booking data:", bookingData.slice(0, 3).map(b => ({
        RoomNumber: b.RoomNumber,
        Name: `${b.FirstName} ${b.LastName}`,
        ArrDate: b.ArrDate,
        DeptDate: b.DeptDate,
        Status: b.status,
        DisplayDates: `${parseDateOnly(b.ArrDate).toLocaleDateString()} - ${new Date(parseDateOnly(b.DeptDate).getTime() - 86400000).toLocaleDateString()} (Dept: ${parseDateOnly(b.DeptDate).toLocaleDateString()})`
      })));
      
      setBookings(bookingData);
      generateCalendar(bookingData);
    } catch (error) {
      console.error("❌ Fetch error:", error);
      alert("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookingData();
  }, []);

  const handleSort = () => {
    console.log("🔄 Regenerating calendar with current bookings...");
    generateCalendar();
  };

  const getDaysInView = () => {
    if (calendar.length === 0) return [];
    return calendar[0].days.map((day) => day.date);
  };

  const getMonthName = (monthNum: number) => {
    return new Date(2000, monthNum - 1).toLocaleString("default", {
      month: "long",
    });
  };

  if (!mounted) return null;

  // Availability is read-only, accessible to all roles

  const daysInView = getDaysInView();

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-full mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-blue-700 mb-2">
              AVAILABILITY
            </h1>
            <p className="text-sm text-gray-600">
              * Departure date dikurangi 1 hari untuk availability. Contoh: Check-in 18 Dec - Check-out 20 Dec = Tampil 18-19 Dec di kalender
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => router.push("/damaga")}
            className="flex items-center gap-2"
          >
            <Home className="w-4 h-4" />
            Back to Home
          </Button>
        </div>

        <Card className="mb-6 border-2 border-blue-200">
          <CardContent className="pt-6">
            <div className="mb-4">
              <Label className="text-lg font-semibold text-blue-700 mb-3 block">
                Sort by :
              </Label>
              <div className="flex gap-4 mb-4">
                <Button
                  variant={viewMode === "month" ? "default" : "outline"}
                  onClick={() => setViewMode("month")}
                  className={viewMode === "month" ? "bg-blue-600" : ""}
                >
                  Month View
                </Button>
                <Button
                  variant={viewMode === "range" ? "default" : "outline"}
                  onClick={() => setViewMode("range")}
                  className={viewMode === "range" ? "bg-blue-600" : ""}
                >
                  Date Range
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {viewMode === "month" ? (
                  <>
                    <div>
                      <Label className="text-sm font-medium mb-2 block text-blue-700">
                        Month
                      </Label>
                      <Select
                        value={filters.month}
                        onValueChange={(val) =>
                          setFilters({ ...filters, month: val })
                        }
                      >
                        <SelectTrigger className="border-blue-300">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 12 }, (_, i) => (
                            <SelectItem key={i + 1} value={(i + 1).toString()}>
                              {getMonthName(i + 1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-sm font-medium mb-2 block text-blue-700">
                        Year
                      </Label>
                      <Select
                        value={filters.year}
                        onValueChange={(val) =>
                          setFilters({ ...filters, year: val })
                        }
                      >
                        <SelectTrigger className="border-blue-300">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 5 }, (_, i) => {
                            const year = new Date().getFullYear() - 2 + i;
                            return (
                              <SelectItem key={year} value={year.toString()}>
                                {year}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <Label className="text-sm font-medium mb-2 block text-blue-700">
                        Start date
                      </Label>
                      <Input
                        type="date"
                        value={filters.startDate}
                        onChange={(e) =>
                          setFilters({ ...filters, startDate: e.target.value })
                        }
                        className="border-blue-300"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium mb-2 block text-blue-700">
                        End date
                      </Label>
                      <Input
                        type="date"
                        value={filters.endDate}
                        onChange={(e) =>
                          setFilters({ ...filters, endDate: e.target.value })
                        }
                        className="border-blue-300"
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="mt-4">
                <Button
                  onClick={handleSort}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8"
                >
                  SORT
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-blue-200">
          <CardContent className="p-0">
            {loading ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 mx-auto mb-3 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-500">Loading calendar...</p>
              </div>
            ) : calendar.length === 0 ? (
              <div className="text-center py-12">
                <Home className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                <p className="text-gray-500">No rooms found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-blue-100">
                      <th
                        colSpan={2}
                        className="border-2 border-blue-300 p-3 text-center font-bold text-blue-900 uppercase text-sm"
                      >
                        {viewMode === "month"
                          ? getMonthName(parseInt(filters.month)).toUpperCase()
                          : "DATE RANGE"}
                      </th>
                      {daysInView.map((date, index) => (
                        <th
                          key={index}
                          className="border-2 border-blue-300 p-2 text-center font-bold text-blue-900 text-xs min-w-[60px]"
                        >
                          {date.getDate()}
                        </th>
                      ))}
                    </tr>
                    <tr className="bg-blue-50">
                      <th className="border-2 border-blue-300 p-3 text-center font-bold text-blue-900 uppercase text-xs">
                        Room Number
                      </th>
                      <th className="border-2 border-blue-300 p-3 text-center font-bold text-blue-900 uppercase text-xs">
                        Room Type
                      </th>
                      {daysInView.map((date, index) => (
                        <th
                          key={index}
                          className="border-2 border-blue-300 p-2 text-center font-semibold text-blue-800 text-xs"
                        >
                          {date.toLocaleDateString("en-US", {
                            weekday: "short",
                          })}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {calendar.map((room) => (
                      <tr key={room.roomNumber} className="hover:bg-blue-50">
                        <td className="border-2 border-blue-300 p-3 text-center font-semibold text-gray-800">
                          {room.roomNumber}
                        </td>
                        <td className="border-2 border-blue-300 p-3 text-center text-gray-700 text-sm">
                          {room.roomType}
                        </td>
                        {room.days.map((day, index) => {
                          let bgColor = "bg-white";
                          let textColor = "text-gray-800";
                          let content = "";

                          if (day.isOccupied) {
                            if (day.isCheckIn) {
                              bgColor = "bg-blue-300";
                              textColor = "text-gray-900";
                              content = day.guestName || "";
                            } else if (day.isCheckOut) {
                              bgColor = "bg-green-400";
                              textColor = "text-gray-900";
                              content = day.guestName || "";
                            } else {
                              bgColor = "bg-green-400";
                              textColor = "text-gray-900";
                            }
                          }

                          return (
                            <td
                              key={index}
                              className={`border-2 border-blue-300 p-2 text-center text-xs font-medium ${bgColor} ${textColor}`}
                              title={day.guestName || "Available"}
                            >
                              <div className="min-h-[40px] flex items-center justify-center">
                                {content && (
                                  <div className="truncate max-w-full px-1">
                                    {content}
                                  </div>
                                )}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-4 flex gap-6 justify-center flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-300 border-2 border-gray-400"></div>
            <span className="text-sm font-medium text-gray-700">Check-in Day</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-400 border-2 border-gray-400"></div>
            <span className="text-sm font-medium text-gray-700">Occupied / Last Stay Day</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white border-2 border-gray-400"></div>
            <span className="text-sm font-medium text-gray-700">Available</span>
          </div>
        </div>
      </div>
    </div>
  );
}
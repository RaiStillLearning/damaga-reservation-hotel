"use client";

import { useState, useEffect } from "react";
import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Search, User, RefreshCw } from "lucide-react";

export default function InHouseGuestListPage() {
  return (
    <Suspense fallback={<div className="p-5 text-center">Loading...</div>}>
      <InHouseGuestList />
    </Suspense>
  );
}

interface ReservationBooking {
  _id: string;
  FirstName: string;
  LastName: string;
  Address: string;
  Country: string;
  Phone: number;
  RoomType: string;
  RoomNumber?: string;
  ArrDate: string;
  DeptDate: string;
  ArrTime: string;
  DeptTime: string;
  TypeOfGuest: string;
  City: string;
  ZipCode: number;
  RoomRate: number;
  RoomRateCurrency?: string;
  NoOfPerson: number;
  Payment: string;
  ReservationMadeBy: string;
  Clerk: string;
  Request?: string;
  Fax?: string;
  IDNumber?: string;
  DateOfIssue?: string;
  Source?: string;
  Note?: string;
  status?: string;
  checkInDate?: string;
  AdvanceDeposit?: number;
  CompanyName?: string;
  CompanyPhone?: string;
  CompanyAddress?: string;
  createdAt: string;
  updatedAt: string;
}

function InHouseGuestList() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchState, setSearchState] = useState({
    FirstName: "",
    LastName: "",
    ArrDate: "",
    DeptDate: "",
    RoomNumber: "",
    RoomType: "",
    Phone: "",
    NoOfPerson: "",
    RoomRate: "",
    IDNumber: "",
    Address: "",
    Country: "",
    DateOfIssue: "",
    ArrTime: "",
    DeptTime: "",
    Source: "",
    Note: "",
    CompanyName: "",
  });

  const [reservationData, setReservationData] = useState<ReservationBooking[]>(
    []
  );
  const [allData, setAllData] = useState<ReservationBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(() => {
      fetchAllData();
      setLastUpdate(new Date());
    }, 50000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const shouldRefresh = searchParams.get("refresh");
    if (shouldRefresh === "true") {
      fetchAllData();
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [searchParams]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/book-a-room?t=${Date.now()}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
        }
      );

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      const data = await res.json();
      const bookings = Array.isArray(data) ? data : data.bookings || [];

      // Filter yang status checked-in ATAU in-house
      const checkedInBookings = bookings.filter(
        (booking: ReservationBooking) => {
          const s = booking.status?.toLowerCase();
          return s === "in-house" || s === "checked-in";
        }
      );

      setAllData(checkedInBookings);
      setReservationData(checkedInBookings);
      setLastUpdate(new Date());
    } catch (err: unknown) {
      console.error("Fetch error:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      alert(`Gagal memuat data: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchState({ ...searchState, [e.target.name]: e.target.value });
  };

  const handleSearch = () => {
    setLoading(true);
    try {
      const filtered = allData.filter((reservation) => {
        const matchesField = (
          reservationValue: string | number,
          searchValue: string
        ) => {
          if (!searchValue) return true;
          return String(reservationValue)
            .toLowerCase()
            .includes(searchValue.toLowerCase());
        };

        const matchesFirstName = matchesField(
          reservation.FirstName || "",
          searchState.FirstName
        );
        const matchesLastName = matchesField(
          reservation.LastName || "",
          searchState.LastName
        );
        const matchesRoomNumber = matchesField(
          reservation.RoomNumber || "",
          searchState.RoomNumber
        );
        const matchesRoomType = matchesField(
          reservation.RoomType || "",
          searchState.RoomType
        );
        const matchesCountry = matchesField(
          reservation.Country || "",
          searchState.Country
        );
        const matchesIDNumber = matchesField(
          reservation.IDNumber || "",
          searchState.IDNumber
        );
        const matchesCompanyName = matchesField(
          reservation.CompanyName || "",
          searchState.CompanyName
        );

        let matchesArrDate = true;
        if (searchState.ArrDate) {
          matchesArrDate =
            new Date(reservation.ArrDate).toISOString().split("T")[0] ===
            searchState.ArrDate;
        }

        let matchesDeptDate = true;
        if (searchState.DeptDate) {
          matchesDeptDate =
            new Date(reservation.DeptDate).toISOString().split("T")[0] ===
            searchState.DeptDate;
        }

        return (
          matchesFirstName &&
          matchesLastName &&
          matchesArrDate &&
          matchesDeptDate &&
          matchesRoomNumber &&
          matchesRoomType &&
          matchesCountry &&
          matchesIDNumber &&
          matchesCompanyName
        );
      });

      setReservationData(filtered);
    } catch (err) {
      console.error(err);
      alert("Gagal melakukan pencarian");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setSearchState({
      FirstName: "",
      LastName: "",
      ArrDate: "",
      DeptDate: "",
      RoomNumber: "",
      RoomType: "",
      Phone: "",
      NoOfPerson: "",
      RoomRate: "",
      IDNumber: "",
      Address: "",
      Country: "",
      DateOfIssue: "",
      ArrTime: "",
      DeptTime: "",
      Source: "",
      Note: "",
      CompanyName: "",
    });
    setReservationData(allData);
  };

  const handleCheckIn = (bookingId: string) => {
    router.push(`../FrontDesk/InHouseGuest?bookingId=${bookingId}`);
  };

  const formatRoomRate = (rate: number, currency?: string) => {
    const curr = currency || "USD";
    const symbol = curr === "USD" ? "$" : "Rp";
    const formattedRate = rate.toLocaleString("en-US", {
      minimumFractionDigits: curr === "USD" ? 2 : 0,
      maximumFractionDigits: curr === "USD" ? 2 : 0,
    });
    return `${symbol} ${formattedRate}`;
  };

  const getStatusBadge = (status?: string) => {
    const statusLower = (status || "checked-in").toLowerCase();
    const statusConfig: Record<string, { bg: string; text: string }> = {
      "checked-in": { bg: "bg-green-100", text: "text-green-800" },
    };
    const config = statusConfig[statusLower] || {
      bg: "bg-green-100",
      text: "text-green-800",
    };
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
      >
        {status || "checked-in"}
      </span>
    );
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-7xl mx-auto">
        <div className="bg-white p-6 sm:p-8 lg:p-10 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl font-semibold text-sky-500">
              IN HOUSE GUEST LIST
            </h2>
            <div className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-lg border border-green-200">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-green-800">
                Status: In-House Only
              </span>
            </div>
          </div>

          <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
            <p className="text-sm text-green-700">
              <strong>ℹ️ Info:</strong> Halaman ini hanya menampilkan guest yang
              sudah <span className="font-semibold">IN-HOUSE</span>. Guest
              dengan status lain tidak akan ditampilkan di sini.
            </p>
          </div>

          <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between bg-sky-50 px-4 py-3 rounded-lg border border-sky-200 gap-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">
                Auto-refresh aktif (setiap 50 detik)
              </span>
            </div>
            <div className="flex items-center gap-3">
              {isClient && (
                <span className="text-xs text-gray-500">
                  Last update: {lastUpdate.toLocaleTimeString("id-ID")}
                </span>
              )}
              <Button
                onClick={fetchAllData}
                variant="outline"
                size="sm"
                className="h-8 px-3"
              >
                <RefreshCw className="w-3 h-3 mr-1" /> Refresh Now
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 mb-6">
            {Object.entries({
              FirstName: "First Name",
              LastName: "Last Name",
              ArrDate: "Arrival Date",
              DeptDate: "Departure Date",
              RoomNumber: "Room Number",
              RoomType: "Room Type",
              Phone: "Phone",
              NoOfPerson: "Number of Person",
              RoomRate: "Room Rate",
              IDNumber: "ID Number",
              Address: "Address",
              Country: "Nationality",
              DateOfIssue: "Date of Issue",
              ArrTime: "Arrival Time",
              DeptTime: "Departure Time",
              Source: "Source",
              Note: "Request",
              CompanyName: "Company Name",
            }).map(([key, label]) => (
              <div key={key} className="w-full">
                <Label className="text-sm font-medium mb-2 block text-sky-500">
                  {label}
                </Label>
                <Input
                  name={key}
                  type={
                    key.includes("Date")
                      ? "date"
                      : key.includes("Time")
                      ? "time"
                      : "text"
                  }
                  value={
                    searchState[key as keyof typeof searchState] !== undefined
                      ? searchState[key as keyof typeof searchState]
                      : ""
                  }
                  onChange={handleChange}
                  placeholder={`Enter ${label.toLowerCase()}`}
                  className="w-full h-10"
                />
              </div>
            ))}
          </div>

          <div className="flex gap-3 justify-end mb-8 pb-6 border-b">
            <Button
              onClick={handleClear}
              variant="outline"
              className="px-6 h-10 text-base font-medium"
            >
              Clear
            </Button>
            <Button
              onClick={handleSearch}
              disabled={loading}
              className="px-8 h-10 text-base font-medium bg-sky-600 hover:bg-sky-700 text-white"
            >
              <Search className="w-4 h-4 mr-2" />
              {loading ? "Searching..." : "Search"}
            </Button>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Checked-In Guests ({reservationData.length})
            </h3>

            {loading ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed">
                <div className="w-12 h-12 mx-auto mb-3 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-500">
                  Loading checked-in guests data...
                </p>
              </div>
            ) : reservationData.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed">
                <User className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                <p className="text-gray-500">
                  No checked-in guests found. All guests may have checked out or
                  are still pending.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto border rounded-lg">
                <table className="w-full min-w-max">
                  <thead className="bg-sky-50 border-b">
                    <tr>
                      {[
                        "No",
                        "First Name",
                        "Last Name",
                        "Arr. Date",
                        "Dept. Date",
                        "Room Number",
                        "Room Type",
                        "Phone",
                        "Person",
                        "Room Rate",
                        "ID Number",
                        "Address",
                        "Nationality",
                        "Date of Issue",
                        "Arr. Time",
                        "Dept. Time",
                        "Status",
                        "Advance Deposit",
                        "Company Name",
                        "Company Phone",
                        "Company Address",
                        "Source",
                        "Note",
                      ].map((head) => (
                        <th
                          key={head}
                          className="px-4 py-3 text-left text-xs font-semibold text-sky-700 uppercase tracking-wider"
                        >
                          {head}
                        </th>
                      ))}
                      <th className="px-4 py-3 text-left text-xs font-semibold text-sky-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reservationData.map((r, i) => (
                      <tr
                        key={r._id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-4 py-3 text-sm">{i + 1}</td>
                        <td className="px-4 py-3 text-sm font-medium">
                          {r.FirstName}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium">
                          {r.LastName}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {new Date(r.ArrDate).toLocaleDateString("id-ID")}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {new Date(r.DeptDate).toLocaleDateString("id-ID")}
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold">
                          {r.RoomNumber || "-"}
                        </td>
                        <td className="px-4 py-3 text-sm">{r.RoomType}</td>
                        <td className="px-4 py-3 text-sm">{r.Phone || "-"}</td>
                        <td className="px-4 py-3 text-sm">
                          {r.NoOfPerson || "-"}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium">
                          {formatRoomRate(r.RoomRate, r.RoomRateCurrency)}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {r.IDNumber || "-"}
                        </td>
                        <td className="px-4 py-3 text-sm">{r.Address}</td>
                        <td className="px-4 py-3 text-sm">{r.Country}</td>
                        <td className="px-4 py-3 text-sm">
                          {r.DateOfIssue
                            ? new Date(r.DateOfIssue).toLocaleDateString(
                                "id-ID"
                              )
                            : "-"}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {r.ArrTime || "-"}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {r.DeptTime || "-"}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {getStatusBadge(r.status)}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {r.AdvanceDeposit || "-"}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {r.CompanyName || "-"}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {r.CompanyPhone || "-"}
                        </td>
                        <td className="px-4 py-3 text-sm max-w-xs truncate">
                          {r.CompanyAddress || "-"}
                        </td>
                        <td className="px-4 py-3 text-sm">{r.Source || "-"}</td>
                        <td className="px-4 py-3 text-sm max-w-xs truncate">
                          {r.Note || "-"}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <Button
                            onClick={() => handleCheckIn(r._id)}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1 whitespace-nowrap"
                          >
                            View Details
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

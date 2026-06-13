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

interface Room {
  roomNumber: string;
  roomType: string;
  floor: number; // dari backend number
  status: string; // VD, VC, VCI, OD, OC, OS, OO
}

export default function RoomStatusPage() {
  const router = useRouter();
  const [userRole, setUserRole] = useState<string>("");

  const [allRooms, setAllRooms] = useState<Room[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);

  const [filters, setFilters] = useState({
    roomType: "",
    floor: "",
    status: "",
  });

  const [loading, setLoading] = useState(false);
  const [updatingRoom, setUpdatingRoom] = useState<string | null>(null); // room yg sedang di-update

  // 🔐 Check user role
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUserRole(parsed.role || parsed.divisi || "");
      } catch (err) {
        console.log(err);
      }
    }
  }, []);

  // 🔄 Fetch rooms from backend
  useEffect(() => {
    fetchRoomsFromBackend();
  }, []);

  const fetchRoomsFromBackend = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/rooms`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();

      console.log("🔎 /api/rooms response:", data);

      const rooms: Room[] = Array.isArray(data) ? data : data.rooms || [];

      const normalizedRooms = rooms.map((r) => ({
        ...r,
        floor: typeof r.floor === "string" ? Number(r.floor) : r.floor,
      }));

      console.log("✅ normalizedRooms:", normalizedRooms);

      setAllRooms(normalizedRooms);
      setFilteredRooms(normalizedRooms);
    } catch (err) {
      console.error("Error fetching rooms:", err);
      alert("Gagal mengambil data room status dari server.");
    } finally {
      setLoading(false);
    }
  };

  const handleSort = () => {
    let filtered = [...allRooms];

    if (filters.roomType) {
      filtered = filtered.filter(
        (room) => room.roomType.toLowerCase() === filters.roomType.toLowerCase()
      );
    }

    if (filters.floor) {
      filtered = filtered.filter(
        (room) => room.floor === Number(filters.floor)
      );
    }

    if (filters.status) {
      filtered = filtered.filter((room) => room.status === filters.status);
    }

    setFilteredRooms(filtered);
  };

  const handleClear = () => {
    setFilters({
      roomType: "",
      floor: "",
      status: "",
    });
    setFilteredRooms(allRooms);
  };

  const getRoomsByFloor = (floor: number) => {
    return filteredRooms.filter((room) => room.floor === floor);
  };

  const getStatusLabel = (code: string) => {
    const statusMap: { [key: string]: string } = {
      VD: "Vacant Dirty",
      VC: "Vacant Clean",
      VCI: "Vacant Clean Inspected",
      OD: "Occupied Dirty",
      OC: "Occupied Clean",
      OS: "Out of Service",
      OO: "Out of Order",
    };
    return statusMap[code] || code;
  };

  // 🔁 Update status kamar ke backend
  const handleUpdateStatus = async (roomNumber: string, newStatus: string) => {
    try {
      setUpdatingRoom(roomNumber);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/rooms/${roomNumber}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!res.ok) {
        const text = await res.text();
        console.error("Update error:", text);
        throw new Error(`Failed to update status (${res.status})`);
      }

      const updated = await res.json();

      // update di allRooms
      setAllRooms((prev) =>
        prev.map((r) =>
          r.roomNumber === updated.roomNumber
            ? { ...r, status: updated.status }
            : r
        )
      );

      // update di filteredRooms
      setFilteredRooms((prev) =>
        prev.map((r) =>
          r.roomNumber === updated.roomNumber
            ? { ...r, status: updated.status }
            : r
        )
      );

      // optional: kasih notifikasi
      alert(
        `✅ Room ${roomNumber} status berhasil diubah menjadi ${newStatus} (${getStatusLabel(
          newStatus
        )})`
      );
    } catch (err) {
      console.error("Error updating room status:", err);
      alert("❌ Gagal update status kamar. Coba lagi.");
    } finally {
      setUpdatingRoom(null);
    }
  };

  const isAdmin = userRole.toLowerCase() === "admin";

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      <div className="w-full max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-blue-900 mb-2">
              ROOM STATUS
            </h1>
            <p className="text-sm text-gray-500">
              Menampilkan semua kamar berdasarkan data di backend (collection{" "}
              <span className="font-semibold">rooms</span>).
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

        {/* Filters */}
        <Card className="mb-6 bg-white shadow-sm">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <Label className="text-sm font-semibold mb-2 block text-blue-900">
                  Sort by :
                </Label>
                {loading && (
                  <p className="text-xs text-gray-500">
                    Loading rooms from server...
                  </p>
                )}
              </div>
              <div>
                <Label className="text-sm font-semibold mb-2 block text-blue-900">
                  Room Type
                </Label>
                <Input
                  placeholder="e.g., DSD, DST"
                  value={filters.roomType}
                  onChange={(e) =>
                    setFilters({ ...filters, roomType: e.target.value })
                  }
                  className="border-blue-300"
                />
              </div>
              <div>
                <Label className="text-sm font-semibold mb-2 block text-blue-900">
                  Floor
                </Label>
                <Select
                  value={filters.floor}
                  onValueChange={(val) =>
                    setFilters({ ...filters, floor: val })
                  }
                >
                  <SelectTrigger className="border-blue-300">
                    <SelectValue placeholder="Select floor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">Floor 2</SelectItem>
                    <SelectItem value="3">Floor 3</SelectItem>
                    <SelectItem value="4">Floor 4</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-semibold mb-2 block text-blue-900">
                  Status
                </Label>
                <Select
                  value={filters.status}
                  onValueChange={(val) =>
                    setFilters({ ...filters, status: val })
                  }
                >
                  <SelectTrigger className="border-blue-300">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="VD">VD - Vacant Dirty</SelectItem>
                    <SelectItem value="VC">VC - Vacant Clean</SelectItem>
                    <SelectItem value="VCI">
                      VCI - Vacant Clean Inspected
                    </SelectItem>
                    <SelectItem value="OD">OD - Occupied Dirty</SelectItem>
                    <SelectItem value="OC">OC - Occupied Clean</SelectItem>
                    <SelectItem value="OS">OS - Out of Service</SelectItem>
                    <SelectItem value="OO">OO - Out of Order</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleSort}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8"
                disabled={loading}
              >
                SORT
              </Button>
              <Button
                onClick={handleClear}
                variant="outline"
                className="px-8"
                disabled={loading}
              >
                CLEAR
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Room Tables - 3 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Floor 2 */}
          <Card className="bg-white shadow-md">
            <CardContent className="p-0">
              <table className="w-full">
                <thead>
                  <tr className="bg-blue-200">
                    <th className="border-2 border-blue-400 p-3 text-left font-bold text-blue-900 text-sm">
                      ROOM NUMBER (2F)
                    </th>
                    <th className="border-2 border-blue-400 p-3 text-left font-bold text-blue-900 text-sm">
                      ROOM TYPE
                    </th>
                    <th className="border-2 border-blue-400 p-3 text-left font-bold text-blue-900 text-sm">
                      STATUS
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {getRoomsByFloor(2).map((room) => (
                    <tr key={room.roomNumber} className="hover:bg-blue-50">
                      <td className="border border-blue-200 p-3 text-center font-semibold text-gray-800">
                        {room.roomNumber}
                      </td>
                      <td className="border border-blue-200 p-3 text-center text-gray-700">
                        {room.roomType}
                      </td>
                      <td className="border border-blue-200 p-3 text-center font-medium text-gray-800">
                        <Select
                          value={room.status}
                          onValueChange={(val) =>
                            handleUpdateStatus(room.roomNumber, val)
                          }
                          disabled={!isAdmin || updatingRoom === room.roomNumber}
                        >
                          <SelectTrigger className="h-8 text-xs justify-center">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="VD">
                              VD - Vacant Dirty
                            </SelectItem>
                            <SelectItem value="VC">
                              VC - Vacant Clean
                            </SelectItem>
                            <SelectItem value="VCI">
                              VCI - Vacant Clean Inspected
                            </SelectItem>
                            <SelectItem value="OD">
                              OD - Occupied Dirty
                            </SelectItem>
                            <SelectItem value="OC">
                              OC - Occupied Clean
                            </SelectItem>
                            <SelectItem value="OS">
                              OS - Out of Service
                            </SelectItem>
                            <SelectItem value="OO">
                              OO - Out of Order
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                    </tr>
                  ))}
                  {getRoomsByFloor(2).length === 0 && !loading && (
                    <tr>
                      <td
                        colSpan={3}
                        className="border border-blue-200 p-3 text-center text-sm text-gray-500"
                      >
                        No rooms on this floor / filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>

          {/* Floor 3 */}
          <Card className="bg-white shadow-md">
            <CardContent className="p-0">
              <table className="w-full">
                <thead>
                  <tr className="bg-blue-200">
                    <th className="border-2 border-blue-400 p-3 text-left font-bold text-blue-900 text-sm">
                      ROOM NUMBER (3F)
                    </th>
                    <th className="border-2 border-blue-400 p-3 text-left font-bold text-blue-900 text-sm">
                      ROOM TYPE
                    </th>
                    <th className="border-2 border-blue-400 p-3 text-left font-bold text-blue-900 text-sm">
                      STATUS
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {getRoomsByFloor(3).map((room) => (
                    <tr key={room.roomNumber} className="hover:bg-blue-50">
                      <td className="border border-blue-200 p-3 text-center font-semibold text-gray-800">
                        {room.roomNumber}
                      </td>
                      <td className="border border-blue-200 p-3 text-center text-gray-700">
                        {room.roomType}
                      </td>
                      <td className="border border-blue-200 p-3 text-center font-medium text-gray-800">
                        <Select
                          value={room.status}
                          onValueChange={(val) =>
                            handleUpdateStatus(room.roomNumber, val)
                          }
                          disabled={!isAdmin || updatingRoom === room.roomNumber}
                        >
                          <SelectTrigger className="h-8 text-xs justify-center">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="VD">
                              VD - Vacant Dirty
                            </SelectItem>
                            <SelectItem value="VC">
                              VC - Vacant Clean
                            </SelectItem>
                            <SelectItem value="VCI">
                              VCI - Vacant Clean Inspected
                            </SelectItem>
                            <SelectItem value="OD">
                              OD - Occupied Dirty
                            </SelectItem>
                            <SelectItem value="OC">
                              OC - Occupied Clean
                            </SelectItem>
                            <SelectItem value="OS">
                              OS - Out of Service
                            </SelectItem>
                            <SelectItem value="OO">
                              OO - Out of Order
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                    </tr>
                  ))}
                  {getRoomsByFloor(3).length === 0 && !loading && (
                    <tr>
                      <td
                        colSpan={3}
                        className="border border-blue-200 p-3 text-center text-sm text-gray-500"
                      >
                        No rooms on this floor / filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>

          {/* Floor 4 */}
          <Card className="bg-white shadow-md">
            <CardContent className="p-0">
              <table className="w-full">
                <thead>
                  <tr className="bg-blue-200">
                    <th className="border-2 border-blue-400 p-3 text-left font-bold text-blue-900 text-sm">
                      ROOM NUMBER (4F)
                    </th>
                    <th className="border-2 border-blue-400 p-3 text-left font-bold text-blue-900 text-sm">
                      ROOM TYPE
                    </th>
                    <th className="border-2 border-blue-400 p-3 text-left font-bold text-blue-900 text-sm">
                      STATUS
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {getRoomsByFloor(4).map((room) => (
                    <tr key={room.roomNumber} className="hover:bg-blue-50">
                      <td className="border border-blue-200 p-3 text-center font-semibold text-gray-800">
                        {room.roomNumber}
                      </td>
                      <td className="border border-blue-200 p-3 text-center text-gray-700">
                        {room.roomType}
                      </td>
                      <td className="border border-blue-200 p-3 text-center font-medium text-gray-800">
                        <Select
                          value={room.status}
                          onValueChange={(val) =>
                            handleUpdateStatus(room.roomNumber, val)
                          }
                          disabled={!isAdmin || updatingRoom === room.roomNumber}
                        >
                          <SelectTrigger className="h-8 text-xs justify-center">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="VD">
                              VD - Vacant Dirty
                            </SelectItem>
                            <SelectItem value="VC">
                              VC - Vacant Clean
                            </SelectItem>
                            <SelectItem value="VCI">
                              VCI - Vacant Clean Inspected
                            </SelectItem>
                            <SelectItem value="OD">
                              OD - Occupied Dirty
                            </SelectItem>
                            <SelectItem value="OC">
                              OC - Occupied Clean
                            </SelectItem>
                            <SelectItem value="OS">
                              OS - Out of Service
                            </SelectItem>
                            <SelectItem value="OO">
                              OO - Out of Order
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                    </tr>
                  ))}
                  {getRoomsByFloor(4).length === 0 && !loading && (
                    <tr>
                      <td
                        colSpan={3}
                        className="border border-blue-200 p-3 text-center text-sm text-gray-500"
                      >
                        No rooms on this floor / filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>

        {/* Status Legend */}
        <Card className="mt-6 bg-blue-50">
          <CardContent className="pt-6">
            <h3 className="text-lg font-bold text-blue-900 mb-4">
              ROOM STATUS LEGEND
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                <span className="font-bold text-blue-900">VD</span>
                <span className="text-sm text-gray-700">Vacant Dirty</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-blue-900">VC</span>
                <span className="text-sm text-gray-700">Vacant Clean</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-blue-900">VCI</span>
                <span className="text-sm text-gray-700">
                  Vacant Clean Inspected
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-blue-900">OD</span>
                <span className="text-sm text-gray-700">Occupied Dirty</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-blue-900">OC</span>
                <span className="text-sm text-gray-700">Occupied Clean</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-blue-900">OS</span>
                <span className="text-sm text-gray-700">Out of Service</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-blue-900">OO</span>
                <span className="text-sm text-gray-700">Out of Order</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

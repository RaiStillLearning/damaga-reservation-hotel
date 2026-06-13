"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Home,
  Plus,
  Pencil,
  Trash2,
  DollarSign,
  XCircle,
  Save,
  RefreshCw,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface RoomRate {
  _id?: string;
  roomType: string;
  roomTypeName: string;
  priceUSD: number;
  priceIDR: number;
  description?: string;
  updatedAt?: string;
  updatedBy?: string;
}

export default function RoomRateManagement() {
  const router = useRouter();
  const [userRole, setUserRole] = useState<string>("");
  const [userName, setUserName] = useState<string>("");
  const [roomRates, setRoomRates] = useState<RoomRate[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedRate, setSelectedRate] = useState<RoomRate | null>(null);

  const [formData, setFormData] = useState<RoomRate>({
    roomType: "",
    roomTypeName: "",
    priceUSD: 0,
    priceIDR: 0,
    description: "",
  });

  // String untuk input (supaya bisa diedit bebas, baru diformat saat blur)
  const [priceUSDInput, setPriceUSDInput] = useState<string>("");
  const [priceIDRInput, setPriceIDRInput] = useState<string>("");

  const roomTypeOptions = [
    { value: "DSD", label: "DSD - Damaga Standard Double" },
    { value: "DST", label: "DST - Damaga Standard Twin" },
    { value: "DDD", label: "DDD - Damaga Deluxe Double" },
    { value: "DDT", label: "DDT - Damaga Deluxe Twin" },
    { value: "DSTD", label: "DSTD - Damaga Suite Double" },
    { value: "DSTT", label: "DSTT - Damaga Suite Twin" },
  ];

  // Check user role
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUserRole(parsed.role || parsed.divisi || "");
        setUserName(parsed.username || parsed.name || "Admin");
      } catch (error) {
        console.error("Failed to parse user");
        console.log(error);
      }
    }
  }, []);

  useEffect(() => {
    fetchRoomRates();
  }, []);

  const fetchRoomRates = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/room-rates`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!res.ok) throw new Error("Failed to fetch room rates");

      const data = await res.json();
      setRoomRates(Array.isArray(data) ? data : data.rates || []);
    } catch (error) {
      console.error("Fetch error:", error);
      // If API not ready, use default data
      setRoomRates([
        {
          roomType: "DSD",
          roomTypeName: "Damaga Standard Double",
          priceUSD: 75,
          priceIDR: 1200000,
        },
        {
          roomType: "DST",
          roomTypeName: "Damaga Standard Twin",
          priceUSD: 80,
          priceIDR: 1280000,
        },
        {
          roomType: "DDD",
          roomTypeName: "Damaga Deluxe Double",
          priceUSD: 120,
          priceIDR: 1920000,
        },
        {
          roomType: "DDT",
          roomTypeName: "Damaga Deluxe Twin",
          priceUSD: 125,
          priceIDR: 2000000,
        },
        {
          roomType: "DSDT",
          roomTypeName: "Damaga Suite Double",
          priceUSD: 200,
          priceIDR: 3200000,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (rate?: RoomRate) => {
    if (rate) {
      setIsEditing(true);
      setSelectedRate(rate);
      setFormData(rate);
      setPriceUSDInput(
        rate.priceUSD
          ? rate.priceUSD.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })
          : ""
      );
      setPriceIDRInput(
        rate.priceIDR ? rate.priceIDR.toLocaleString("id-ID") : ""
      );
    } else {
      setIsEditing(false);
      setSelectedRate(null);
      setFormData({
        roomType: "",
        roomTypeName: "",
        priceUSD: 0,
        priceIDR: 0,
        description: "",
      });
      setPriceUSDInput("");
      setPriceIDRInput("");
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setIsEditing(false);
    setSelectedRate(null);
    setFormData({
      roomType: "",
      roomTypeName: "",
      priceUSD: 0,
      priceIDR: 0,
      description: "",
    });
    setPriceUSDInput("");
    setPriceIDRInput("");
  };

  const handleRoomTypeChange = (value: string) => {
    const selected = roomTypeOptions.find((opt) => opt.value === value);
    setFormData((prev) => ({
      ...prev,
      roomType: value,
      roomTypeName: selected?.label.split(" - ")[1] || "",
    }));
  };

  // --- HANDLE INPUT HARGA USD & IDR ---

  const handlePriceUSDChange = (value: string) => {
    // Hilangkan koma untuk parsing
    const cleaned = value.replace(/,/g, "");

    // Boleh kosong atau hanya titik sementara
    if (cleaned === "" || cleaned === ".") {
      setPriceUSDInput(value);
      setFormData((prev) => ({ ...prev, priceUSD: 0 }));
      return;
    }

    // Hanya izinkan digit dan satu titik desimal
    if (!/^\d*\.?\d*$/.test(cleaned)) {
      return;
    }

    const numeric = parseFloat(cleaned);
    setPriceUSDInput(value);
    setFormData((prev) => ({
      ...prev,
      priceUSD: isNaN(numeric) ? 0 : numeric,
    }));
  };

  const handlePriceUSDBlur = () => {
    if (!formData.priceUSD) {
      setPriceUSDInput("");
      return;
    }
    setPriceUSDInput(
      formData.priceUSD.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    );
  };

  const handlePriceIDRChange = (value: string) => {
    // Hilangkan titik & koma
    const cleaned = value.replace(/[.,]/g, "");

    if (cleaned === "") {
      setPriceIDRInput("");
      setFormData((prev) => ({ ...prev, priceIDR: 0 }));
      return;
    }

    // Hanya digit
    if (!/^\d+$/.test(cleaned)) {
      return;
    }

    const numeric = parseInt(cleaned, 10);
    setPriceIDRInput(value);
    setFormData((prev) => ({
      ...prev,
      priceIDR: isNaN(numeric) ? 0 : numeric,
    }));
  };

  const handlePriceIDRBlur = () => {
    if (!formData.priceIDR) {
      setPriceIDRInput("");
      return;
    }
    setPriceIDRInput(formData.priceIDR.toLocaleString("id-ID"));
  };

  const handleSubmit = async () => {
    try {
      // Validation
      if (!formData.roomType || !formData.priceUSD || !formData.priceIDR) {
        alert("Please fill in all required fields");
        return;
      }

      const submitData = {
        ...formData,
        updatedBy: userName,
        updatedAt: new Date().toISOString(),
      };

      const url =
        isEditing && selectedRate?._id
          ? `${process.env.NEXT_PUBLIC_API_URL}/api/room-rates/${selectedRate._id}`
          : `${process.env.NEXT_PUBLIC_API_URL}/api/room-rates`;

      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      });

      if (!res.ok) throw new Error("Failed to save room rate");

      alert(`✅ Room rate ${isEditing ? "updated" : "created"} successfully!`);
      handleCloseDialog();
      fetchRoomRates();
    } catch (error) {
      console.error("Submit error:", error);
      alert(`❌ Failed to ${isEditing ? "update" : "create"} room rate`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this room rate?")) return;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/room-rates/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!res.ok) throw new Error("Failed to delete room rate");

      alert("✅ Room rate deleted successfully!");
      fetchRoomRates();
    } catch (error) {
      console.error("Delete error:", error);
      alert("❌ Failed to delete room rate");
    }
  };

  const formatCurrency = (amount: number, currency: "USD" | "IDR") => {
    const locale = currency === "IDR" ? "id-ID" : "en-US";
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      minimumFractionDigits: currency === "USD" ? 2 : 0,
      maximumFractionDigits: currency === "USD" ? 2 : 0,
    }).format(amount);
  };

  const isAdmin = userRole.toLowerCase() === "admin";

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      <div className="w-full max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-2">
              Room Rate Management
            </h1>
            <p className="text-gray-600">Manage room prices for USD and IDR</p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={fetchRoomRates}
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/damaga")}
              className="flex items-center gap-2"
            >
              <Home className="w-4 h-4" />
              Back to Home
            </Button>
          </div>
        </div>

        {/* Info Alert */}
        <Alert className="mb-6 border-blue-200 bg-blue-50">
          <AlertDescription className="text-blue-800">
            <strong>ℹ️ Info:</strong> Changes made here will be reflected in the
            Book A Room form immediately. All prices are per night per room.
          </AlertDescription>
        </Alert>

        {/* Add New Button - Admin Only */}
        {isAdmin && (
        <div className="mb-6">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => handleOpenDialog()}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add New Room Rate
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>
                  {isEditing ? "Edit Room Rate" : "Add New Room Rate"}
                </DialogTitle>
                <DialogDescription>
                  {isEditing
                    ? "Update the room rate information below"
                    : "Add a new room type and set its prices"}
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                {/* Room Type */}
                <div className="grid gap-2">
                  <Label htmlFor="roomType">Room Type *</Label>
                  <Select
                    value={formData.roomType}
                    onValueChange={handleRoomTypeChange}
                    disabled={isEditing}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select room type" />
                    </SelectTrigger>
                    <SelectContent>
                      {roomTypeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Price USD */}
                <div className="grid gap-2">
                  <Label htmlFor="priceUSD">Price (USD) *</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                      $
                    </span>
                    <Input
                      id="priceUSD"
                      type="text"
                      value={priceUSDInput}
                      onChange={(e) => handlePriceUSDChange(e.target.value)}
                      onBlur={handlePriceUSDBlur}
                      placeholder="75.00"
                      className="pl-8"
                    />
                  </div>
                </div>

                {/* Price IDR */}
                <div className="grid gap-2">
                  <Label htmlFor="priceIDR">Price (IDR) *</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                      Rp
                    </span>
                    <Input
                      id="priceIDR"
                      type="text"
                      value={priceIDRInput}
                      onChange={(e) => handlePriceIDRChange(e.target.value)}
                      onBlur={handlePriceIDRBlur}
                      placeholder="500.000"
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="grid gap-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Additional notes about this room type..."
                    className="min-h-[80px] px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={handleCloseDialog}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isEditing ? "Update" : "Create"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        )}

        {/* Room Rates Table */}
        <Card>
          <CardHeader>
            <CardTitle>Current Room Rates</CardTitle>
            <CardDescription>
              {roomRates.length} room types configured
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 mx-auto mb-3 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-500">Loading room rates...</p>
              </div>
            ) : roomRates.length === 0 ? (
              <div className="text-center py-12">
                <DollarSign className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                <p className="text-gray-500">No room rates configured yet.</p>
                <p className="text-sm text-gray-400 mt-2">
                  Click (Add New Room) Rate to get started.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[120px]">Room Type</TableHead>
                      <TableHead>Room Name</TableHead>
                      <TableHead className="text-right">Price (USD)</TableHead>
                      <TableHead className="text-right">Price (IDR)</TableHead>
                      <TableHead>Description</TableHead>
                      {isAdmin && (
                      <TableHead className="text-center w-[120px]">
                        Actions
                      </TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {roomRates.map((rate) => (
                      <TableRow key={rate._id || rate.roomType}>
                        <TableCell className="font-medium">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-xs font-semibold">
                            {rate.roomType}
                          </span>
                        </TableCell>
                        <TableCell>{rate.roomTypeName}</TableCell>
                        <TableCell className="text-right font-semibold text-green-700">
                          {formatCurrency(rate.priceUSD, "USD")}
                        </TableCell>
                        <TableCell className="text-right font-semibold text-green-700">
                          {formatCurrency(rate.priceIDR, "IDR")}
                        </TableCell>
                        <TableCell className="text-sm text-gray-600 max-w-xs truncate">
                          {rate.description || "-"}
                        </TableCell>
                        {isAdmin && (
                        <TableCell>
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenDialog(rate)}
                              className="hover:bg-blue-50"
                            >
                              <Pencil className="w-4 h-4 text-blue-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => rate._id && handleDelete(rate._id)}
                              className="hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          </div>
                        </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Last Updated Info */}
        {roomRates.length > 0 && roomRates[0].updatedAt && (
          <div className="mt-4 text-right">
            <p className="text-xs text-gray-500">
              Last updated:{" "}
              {new Date(roomRates[0].updatedAt).toLocaleString("en-US")}
              {roomRates[0].updatedBy && ` by ${roomRates[0].updatedBy}`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

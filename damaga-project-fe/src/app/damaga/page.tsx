"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  UserPlus,
  NotebookPen,
  Users,
  Box,
  ChartNoAxesCombined,
  House,
  X,
  ArrowRight,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const iconMap = {
  House,
  UserPlus,
  NotebookPen,
  Users,
  Box,
  ChartNoAxesCombined,
};

const navigationOptions = [
  {
    id: "home",
    title: "Home",
    url: "/damaga",
    iconName: "House" as keyof typeof iconMap,
    description: "Go to dashboard home",
    color: "blue",
  },
  {
    id: "guest-history",
    title: "Guest History Record",
    url: "/damaga/ClientRelations/GuestHistoryRecord",
    iconName: "UserPlus" as keyof typeof iconMap,
    description: "View and manage guest records",
    color: "green",
  },
  {
    id: "book-room",
    title: "Book A Room",
    url: "/damaga/Reservations/Book-A-Room",
    iconName: "NotebookPen" as keyof typeof iconMap,
    description: "Create new room reservation",
    color: "purple",
  },
  {
    id: "reservation-history",
    title: "Reservation History",
    url: "/damaga/Reservations/ReservationHistory",
    iconName: "NotebookPen" as keyof typeof iconMap,
    description: "View all reservations",
    color: "indigo",
  },
  {
    id: "registration",
    title: "Registration",
    url: "/damaga/FrontDesk/Registration",
    iconName: "Users" as keyof typeof iconMap,
    description: "Manage guest registration",
    color: "orange",
  },
  {
    id: "expected-arrivals",
    title: "Expected Arrivals",
    url: "/damaga/FrontDesk/ExpectedArrival",
    iconName: "Users" as keyof typeof iconMap,
    description: "View upcoming guest arrivals",
    color: "cyan",
  },
  {
    id: "in-house",
    title: "In House",
    url: "/damaga/FrontDesk/InHouseGuest",
    iconName: "Users" as keyof typeof iconMap,
    description: "View currently checked-in guests",
    color: "teal",
  },
  {
    id: "expected-departures",
    title: "Expected Departures",
    url: "/damaga/FrontDesk/ExpectedDeparture",
    iconName: "Users" as keyof typeof iconMap,
    description: "View upcoming guest departures",
    color: "amber",
  },
  {
    id: "availability",
    title: "Availability",
    url: "/damaga/admin/Inventory/Avaibility",
    iconName: "Box" as keyof typeof iconMap,
    description: "Check room availability",
    color: "pink",
  },
  {
    id: "room-status",
    title: "Room Status",
    url: "/damaga/admin/Inventory/RoomStatus",
    iconName: "Box" as keyof typeof iconMap,
    description: "View room status and housekeeping",
    color: "rose",
  },
  {
    id: "room-rate",
    title: "Room Rate",
    url: "/damaga/admin/Inventory/RoomRate",
    iconName: "Box" as keyof typeof iconMap,
    description: "View room status and housekeeping",
    color: "cyan",
  },
  {
    id: "financial",
    title: "Financial",
    url: "#",
    iconName: "ChartNoAxesCombined" as keyof typeof iconMap,
    description: "View financial reports",
    color: "emerald",
  },
];

type TileSlot = {
  id: string;
  title: string;
  url: string;
  iconName: keyof typeof iconMap;
  description: string;
  color: string;
} | null;

type User = {
  username?: string;
  role?: string;
  divisi?: string;
};

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [tiles, setTiles] = useState<TileSlot[]>(Array(6).fill(null));
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const RESTRICTED_IDS = ["availability", "room-status"];

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    // Ambil profile dari API
    fetch(`${API_URL}/api/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        const u: User = data.user || {};
        setUser(u);

        const roleFromProfile = (u.role || u.divisi || "").toLowerCase();

        if (roleFromProfile) {
          setIsAdmin(roleFromProfile === "admin");
        } else {
          // fallback ke localStorage user (seperti di komponen lain)
          const storedUser = localStorage.getItem("user");
          if (storedUser) {
            try {
              const parsed = JSON.parse(storedUser);
              const roleFromLocal = (
                parsed.role ||
                parsed.divisi ||
                ""
              ).toLowerCase();
              setIsAdmin(roleFromLocal === "admin");
            } catch {
              setIsAdmin(false);
            }
          }
        }
      })
      .catch(() => {
        router.push("/login");
      });

    // Ambil tiles
    fetch(`${API_URL}/api/tiles`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        const serverTiles = data.tiles || [];
        const tilesArray: TileSlot[] = Array(6).fill(null);

        serverTiles.forEach((tile: TileSlot, index: number) => {
          if (index < 6 && tile && iconMap[tile.iconName]) {
            tilesArray[index] = tile;
          }
        });

        setTiles(tilesArray);
        setLoading(false);
      })
      .catch(() => {
        setTiles(Array(6).fill(null));
        setLoading(false);
      });
  }, [router, API_URL]);

  const saveTilesToServer = async (newTiles: TileSlot[]) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    // Jika bukan admin, jangan kirim shortcut yang restricted
    const safeTiles = newTiles.map((tile) => {
      if (!isAdmin && tile && RESTRICTED_IDS.includes(tile.id)) {
        return null;
      }
      return tile;
    });

    try {
      await fetch(`${API_URL}/api/tiles`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ tiles: safeTiles }),
      });
    } catch (error) {
      console.error("Error saving tiles:", error);
    }
  };

  const handleAddTile = (slotIndex: number) => {
    setSelectedSlot(slotIndex);
    setOpen(true);
  };

  const handleSelectNavigation = (option: (typeof navigationOptions)[0]) => {
    if (selectedSlot === null) return;

    // Safety: kalau bukan admin & mencoba pilih restricted, abaikan
    if (!isAdmin && RESTRICTED_IDS.includes(option.id)) {
      return;
    }

    const newTiles = [...tiles];
    newTiles[selectedSlot] = option;
    setTiles(newTiles);
    saveTilesToServer(newTiles);
    setOpen(false);
    setSelectedSlot(null);
  };

  const handleRemoveTile = (slotIndex: number) => {
    const newTiles = [...tiles];
    newTiles[slotIndex] = null;
    setTiles(newTiles);
    saveTilesToServer(newTiles);
  };

  const handleNavigateToTile = (url: string) => {
    if (url !== "#") {
      router.push(url);
    }
  };

  const getColorClasses = (color: string) => {
    const colors: {
      [key: string]: {
        bg: string;
        text: string;
        hover: string;
        iconBg: string;
        border: string;
      };
    } = {
      blue: {
        bg: "bg-blue-50",
        text: "text-blue-600",
        hover: "hover:bg-blue-100",
        iconBg: "bg-blue-100",
        border: "hover:border-blue-300",
      },
      green: {
        bg: "bg-green-50",
        text: "text-green-600",
        hover: "hover:bg-green-100",
        iconBg: "bg-green-100",
        border: "hover:border-green-300",
      },
      purple: {
        bg: "bg-purple-50",
        text: "text-purple-600",
        hover: "hover:bg-purple-100",
        iconBg: "bg-purple-100",
        border: "hover:border-purple-300",
      },
      indigo: {
        bg: "bg-indigo-50",
        text: "text-indigo-600",
        hover: "hover:bg-indigo-100",
        iconBg: "bg-indigo-100",
        border: "hover:border-indigo-300",
      },
      orange: {
        bg: "bg-orange-50",
        text: "text-orange-600",
        hover: "hover:bg-orange-100",
        iconBg: "bg-orange-100",
        border: "hover:border-orange-300",
      },
      pink: {
        bg: "bg-pink-50",
        text: "text-pink-600",
        hover: "hover:bg-pink-100",
        iconBg: "bg-pink-100",
        border: "hover:border-pink-300",
      },
      emerald: {
        bg: "bg-emerald-50",
        text: "text-emerald-600",
        hover: "hover:bg-emerald-100",
        iconBg: "bg-emerald-100",
        border: "hover:border-emerald-300",
      },
      cyan: {
        bg: "bg-cyan-50",
        text: "text-cyan-600",
        hover: "hover:bg-cyan-100",
        iconBg: "bg-cyan-100",
        border: "hover:border-cyan-300",
      },
      teal: {
        bg: "bg-teal-50",
        text: "text-teal-600",
        hover: "hover:bg-teal-100",
        iconBg: "bg-teal-100",
        border: "hover:border-teal-300",
      },
      amber: {
        bg: "bg-amber-50",
        text: "text-amber-600",
        hover: "hover:bg-amber-100",
        iconBg: "bg-amber-100",
        border: "hover:border-amber-300",
      },
      rose: {
        bg: "bg-rose-50",
        text: "text-rose-600",
        hover: "hover:bg-rose-100",
        iconBg: "bg-rose-100",
        border: "hover:border-rose-300",
      },
    };
    return colors[color] || colors.blue;
  };

  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Filter navigation options di dialog: non-admin tidak bisa lihat Availability & Room Status
  const selectableNavigationOptions = navigationOptions.filter((option) => {
    if (!isAdmin && RESTRICTED_IDS.includes(option.id)) {
      return false;
    }
    return true;
  });

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-stone-900 mb-2">
          {user ? `Hello, ${user.username}!` : "Dashboard Utama"}
        </h1>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <span className="cursor-pointer text-sky-600 hover:underline">
              Not You? Sign In as different user
            </span>
          </AlertDialogTrigger>

          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Apakah kamu yakin ingin logout?
              </AlertDialogTitle>
              <AlertDialogDescription>
                Kamu akan keluar dari akun ini, lalu silahkan login kembali
                menggunakan akunmu yang lain.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-600 hover:bg-red-700"
                onClick={() => {
                  localStorage.removeItem("token");
                  router.push("/login");
                }}
              >
                Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <div className="mb-6">
        <p className="text-sm text-gray-600">
          Click on{" "}
          <span className="font-semibold text-blue-600">+ Add Tile</span> on any
          card to create a shortcut to your favorite pages
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {tiles.map((tile, index) => {
          // Non-admin tidak boleh lihat tile Availability & Room Status
          const effectiveTile =
            !isAdmin &&
            tile &&
            tile.id &&
            (tile.id === "availability" || tile.id === "room-status")
              ? null
              : tile;

          if (effectiveTile) {
            const IconComponent = iconMap[effectiveTile.iconName];
            const colors = getColorClasses(effectiveTile.color);

            if (!IconComponent) {
              return null;
            }

            return (
              <div
                key={index}
                className={`relative group ${colors.bg} p-6 rounded-lg shadow-sm border-2 border-transparent ${colors.border} transition-all duration-200 cursor-pointer`}
                onClick={() => handleNavigateToTile(effectiveTile.url)}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveTile(index);
                  }}
                  className="absolute top-3 right-3 p-1.5 rounded-full bg-white shadow-md opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity hover:bg-red-50 z-10"
                  aria-label="Remove tile"
                >
                  <X className="h-4 w-4 text-red-500" />
                </button>

                <div className="flex items-start gap-4 mb-3">
                  <div
                    className={`p-3 rounded-lg ${colors.iconBg} ${colors.text}`}
                  >
                    <IconComponent className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className={`text-lg font-semibold mb-1 ${colors.text}`}>
                      {effectiveTile.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {effectiveTile.description}
                    </p>
                  </div>
                </div>

                {effectiveTile.url !== "#" && (
                  <div className="flex items-center gap-2 mt-4 text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
                    <span>Open</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                )}

                {effectiveTile.url === "#" && (
                  <span className="inline-block mt-4 text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                    Coming Soon
                  </span>
                )}
              </div>
            );
          }

          // Slot kosong → Add Tile
          return (
            <button
              key={index}
              onClick={() => handleAddTile(index)}
              className="group relative p-6 rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-500 bg-white hover:bg-blue-50 transition-all duration-300 min-h-[180px] flex flex-col items-center justify-center"
            >
              <Plus className="h-8 w-8 text-gray-400 group-hover:text-blue-500 mb-3 transition-all group-hover:rotate-90 duration-300" />
              <h3 className="text-lg font-semibold text-gray-500 group-hover:text-blue-600 transition-colors mb-1">
                Add Tile
              </h3>
              <p className="text-sm text-gray-400 group-hover:text-blue-500 transition-colors">
                Click to add a shortcut
              </p>
            </button>
          );
        })}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              Choose a Page
            </DialogTitle>
            <DialogDescription>
              Select a page to add as a shortcut to Slot{" "}
              {selectedSlot !== null ? selectedSlot + 1 : ""}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 max-h-96 overflow-y-auto pr-2">
            {selectableNavigationOptions.map((option) => {
              const IconComponent = iconMap[option.iconName];
              const colors = getColorClasses(option.color);
              const isAlreadyAdded = tiles.some(
                (tile) => tile?.id === option.id
              );

              return (
                <button
                  key={option.id}
                  onClick={() => handleSelectNavigation(option)}
                  disabled={isAlreadyAdded}
                  className={`group relative p-4 rounded-lg border-2 ${
                    isAlreadyAdded
                      ? "border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed"
                      : "border-gray-200 hover:border-blue-500 bg-white hover:bg-blue-50"
                  } transition-all duration-200 text-left`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2 rounded-md ${colors.iconBg} ${
                        colors.text
                      } ${
                        !isAlreadyAdded &&
                        "group-hover:bg-blue-200 group-hover:text-blue-600"
                      } transition-colors`}
                    >
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <h3
                        className={`font-semibold text-gray-900 mb-1 ${
                          !isAlreadyAdded && "group-hover:text-blue-600"
                        } transition-colors`}
                      >
                        {option.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {option.description}
                      </p>
                    </div>
                  </div>
                  {isAlreadyAdded && (
                    <span className="absolute top-2 right-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-medium">
                      Already Added
                    </span>
                  )}
                  {option.url === "#" && !isAlreadyAdded && (
                    <span className="absolute top-2 right-2 text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                      Coming Soon
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-xl font-semibold mb-4">Quick Tips</h2>
        <ul className="space-y-2 text-gray-600">
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-bold">•</span>
            <span>
              Click on any empty card to add a shortcut to your favorite pages
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-bold">•</span>
            <span>Hover over a tile and click the X button to remove it</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-bold">•</span>
            <span>Your tile configuration is saved to your account</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-bold">•</span>
            <span>Click on a tile to navigate to that page quickly</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";

import {
  UserPlus,
  NotebookPen,
  Users,
  Box,
  ChartNoAxesCombined,
  House,
} from "lucide-react";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useUserContext } from "@/context/userContext";

// 👇 Menu yang bisa diakses semua user
const commonNav = [
  { title: "Home", url: "/damaga", icon: House, isActive: true },
  {
    title: "Client Relations",
    url: "#",
    icon: UserPlus,
    items: [
      {
        title: "Guest History Record",
        url: "/damaga/ClientRelations/GuestHistoryRecord",
      },
    ],
  },
  {
    title: "Reservations",
    url: "#",
    icon: NotebookPen,
    items: [
      { title: "Book A Room", url: "/damaga/Reservations/Book-A-Room" },
      {
        title: "Reservation History",
        url: "/damaga/Reservations/ReservationHistory",
      },
    ],
  },
  {
    title: "Front Desk",
    url: "#",
    icon: Users,
    items: [
      { title: "Registration", url: "/damaga/FrontDesk/Registration" },
      {
        title: "Expected Arrivals",
        url: "/damaga/FrontDesk/ExpectedArrival",
      },
      {
        title: "In House Guest List",
        url: "/damaga/FrontDesk/InHouseGuestList",
      },
      {
        title: "Expected Departures",
        url: "/damaga/FrontDesk/ExpectedDeparture",
      },
    ],
  },

  { title: "Financial", url: "/damaga/Financial", icon: ChartNoAxesCombined },
  {
    title: "Inventory",
    url: "#",
    icon: Box,
    items: [
      { title: "Availability", url: "/damaga/admin/Inventory/Avaibility" },
      { title: "Room Status", url: "/damaga/admin/Inventory/RoomStatus" },
      { title: "Room Rate", url: "/damaga/admin/Inventory/RoomRate" },
    ],
  },
];

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const { user } = useUserContext();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const navItems = commonNav;

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        {mounted && <NavUser />}
      </SidebarHeader>

      <SidebarContent>
        {/* Bisa kasih loading state kalau mau */}
        {/* {loading ? <div className="p-2 text-xs text-muted-foreground">Loading menu...</div> : null} */}
        {mounted && <NavMain items={navItems} />}
      </SidebarContent>

      <SidebarFooter>{/* tombol logout dll */}</SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserContext } from "@/context/userContext";

export default function AdminUsersPage() {
  const { user, loading } = useUserContext();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) router.replace("/login");
      else if (user.role !== "admin") router.replace("/damaga/forbidden");
    }
  }, [user, loading, router]);

  if (loading) return <div className="p-4">Checking access...</div>;
  if (!user || user.role !== "admin") return null;

  return <div className="p-4">Halaman User Management (Admin Only)</div>;
}

"use client";
import { useState, useEffect } from "react";
import type { AppUser } from "@/types/user"; // ⬅️ tambahkan import ini

export function useUser() {
  const [user, setUser] = useState<AppUser | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        const parsed: AppUser = JSON.parse(stored);
        setUser(parsed);
      } catch (e) {
        console.error("Failed to parse user from localStorage", e);
        setUser(null);
      }
    }

    const handleStorage = () => {
      const updated = localStorage.getItem("user");
      if (!updated) {
        setUser(null);
        return;
      }
      try {
        const parsed: AppUser = JSON.parse(updated);
        setUser(parsed);
      } catch (e) {
        console.error("Failed to parse updated user from localStorage", e);
        setUser(null);
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const updateUser = (newUser: AppUser) => {
    localStorage.setItem("user", JSON.stringify(newUser));
    setUser(newUser);
  };

  const clearUser = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  return { user, updateUser, clearUser };
}

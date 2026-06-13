"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
} from "react";
import type { AppUser } from "@/types/user"; // ⬅️ pakai type yang sama

type UserContextType = {
  user: AppUser | null;
  loading: boolean;
  setUser: (user: AppUser, token?: string) => void;
  clearUser: () => void;
};

const UserContext = createContext<UserContextType>({
  user: null,
  setUser: () => {},
  clearUser: () => {},
  loading: true,
});

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  const setUser = useCallback((user: AppUser, token?: string) => {
    setUserState(user);
    localStorage.setItem("user", JSON.stringify(user));
    if (token) localStorage.setItem("token", token);
  }, []);

  const clearUser = useCallback(() => {
    setUserState(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/profile`,
          {
            headers: { Authorization: `Bearer ${token}` },
            cache: "no-store",
          }
        );

        if (!res.ok) {
          if (res.status === 401) throw new Error("Unauthorized");
          // For 404 or other errors, try localStorage fallback
          const storedUser = localStorage.getItem("user");
          if (storedUser) {
            try {
              const parsed = JSON.parse(storedUser);
              setUserState(parsed as AppUser);
            } catch {
              clearUser();
            }
          }
          return;
        }

        const data = await res.json();

        if (data?.user) {
          // pastikan backend /api/profile kirim: { user: { username, email, role, divisi, ... } }
          setUserState(data.user as AppUser);
          localStorage.setItem("user", JSON.stringify(data.user));
        } else {
          // Try localStorage fallback
          const storedUser = localStorage.getItem("user");
          if (storedUser) {
            try {
              const parsed = JSON.parse(storedUser);
              setUserState(parsed as AppUser);
            } catch {
              clearUser();
            }
          } else {
            clearUser();
          }
        }
      } catch (err) {
        console.error("Profile fetch error:", err);
        // On unauthorized, clear user. Otherwise try localStorage
        if (err instanceof Error && err.message === "Unauthorized") {
          clearUser();
        } else {
          const storedUser = localStorage.getItem("user");
          if (storedUser) {
            try {
              const parsed = JSON.parse(storedUser);
              setUserState(parsed as AppUser);
            } catch {
              clearUser();
            }
          } else {
            clearUser();
          }
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [clearUser]);

  return (
    <UserContext.Provider value={{ user, setUser, clearUser, loading }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUserContext = () => useContext(UserContext);

"use client";

import { useState, useRef, useEffect } from "react";
import { Camera, ArrowLeft, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function AccountPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [user, setUser] = useState({
    username: "",
    email: "",
    avatar: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  // ✅ Helper untuk mendapatkan URL avatar yang benar
  const getAvatarUrl = (path: string) => {
    if (!path) return "";
    if (path.startsWith("data:") || path.startsWith("http")) return path;
    return `${API_URL}${path}`;
  };

  // ✅ Ambil profile dari token, fallback ke localStorage
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return router.push("/login");

    // Try to load from localStorage first as fallback
    const loadFromLocalStorage = () => {
      const stored = localStorage.getItem("user");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setUser({
            username: parsed.username || "",
            email: parsed.email || "",
            avatar: parsed.avatar || "",
          });
        } catch {}
      }
    };

    fetch(`${API_URL}/api/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) {
          // API endpoint not available, use localStorage
          loadFromLocalStorage();
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data?.user) {
          setUser({
            username: data.user.username || "",
            email: data.user.email || "",
            avatar: data.user.avatar || "",
          });
        } else if (data === null) {
          // Already handled above
        } else {
          loadFromLocalStorage();
        }
      })
      .catch(() => {
        console.log("Failed to load profile from API, using localStorage");
        loadFromLocalStorage();
      });
  }, [router]);

  // ✅ Upload avatar preview
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/"))
      return alert("Please select a valid image file.");
    if (file.size > 5 * 1024 * 1024)
      return alert("Image size should be less than 5MB.");

    // Store the actual file for upload
    setAvatarFile(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setUser((prev) => ({ ...prev, avatar: result }));
    };
    reader.readAsDataURL(file);
  };

  // ✅ Save profile (PUT ke backend)
  const handleSave = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) return router.push("/login");

      let res: Response;

      if (avatarFile) {
        // Use FormData for file upload
        const formData = new FormData();
        formData.append("username", user.username);
        formData.append("avatar", avatarFile);

        res = await fetch(`${API_URL}/api/profile`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });
      } else {
        // No file change, send JSON
        res = await fetch(`${API_URL}/api/profile`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            username: user.username,
          }),
        });
      }

      if (!res.ok) {
        if (res.status === 404) {
          // API endpoint not available yet, save locally
          const localUser = {
            username: user.username,
            email: user.email,
            avatar: avatarFile ? user.avatar : (user.avatar || ""),
          };
          setUser(localUser);
          localStorage.setItem("user", JSON.stringify(localUser));
          setAvatarFile(null);
          alert("Profile updated locally! (Backend profile API belum tersedia)");
          return;
        }
        throw new Error("Update failed");
      }

      const updated = await res.json();

      // 🔧 Pastikan bentuknya top-level (tidak nested di updated.user)
      const payloadUser = updated.user ? updated.user : updated;

      // ✅ Simpan ke state dan localStorage
      setUser({
        username: payloadUser.username,
        email: payloadUser.email,
        avatar: payloadUser.avatar || "",
      });

      localStorage.setItem("user", JSON.stringify(payloadUser));
      setAvatarFile(null);

      alert("Profile updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to update profile. Pastikan backend /api/profile endpoint tersedia.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Account Settings
          </h1>
          <p className="text-muted-foreground">
            Manage your profile and account settings
          </p>
        </div>
      </div>

      {/* Profile Card */}
      <Card className="bg-background/80 backdrop-blur-sm border border-border">
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>
            Update your profile photo and personal details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar */}
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="h-24 w-24 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                {user.avatar ? (
                  <img
                    src={getAvatarUrl(user.avatar)}
                    alt={user.username || "User"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-2xl text-foreground font-bold">
                    {user.username.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <Button
                variant="outline"
                size="icon"
                className="absolute -bottom-2 -right-2 p-2"
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera className="h-4 w-4" />
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-medium text-foreground">
                {user.username}
              </h3>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2"
              >
                <Camera className="h-4 w-4" />
                Change Photo
              </Button>
            </div>
          </div>

          <Separator />

          {/* Input fields */}
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={user.username || ""}
                onChange={(e) =>
                  setUser((prev) => ({ ...prev, username: e.target.value }))
                }
                placeholder="Enter your full name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={user.email || ""}
                disabled
                placeholder="Enter your email"
              />
            </div>
          </div>

          <Separator />

          {/* Buttons */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-foreground"></div>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

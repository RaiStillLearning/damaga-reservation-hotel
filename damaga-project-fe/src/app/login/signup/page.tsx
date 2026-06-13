"use client";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useRouter } from "next/navigation";

// const divisions = [
//   { value: "Lorem1", label: "Lorem 1" },
//   { value: "Lorem2", label: "Lorem 2" },
//   { value: "Lorem3", label: "Lorem 3" },
//   { value: "Lorem4", label: "Lorem 4" },
//   { value: "Lorem5", label: "Lorem 5" },
// ];

export default function SignUpPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  // const [divisi, setDivisi] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/signup`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, email, password }),
        }
      );

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Signup failed");

      setMessage("Signup berhasil! Redirecting...");
      setTimeout(() => router.push("/login"), 1000);
    } catch (err) {
      if (err instanceof Error) {
        setMessage(err.message);
      } else {
        setMessage("Terjadi kesalahan");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-6 w-100">
      <Card className="w-full max-w-sm bg-white shadow-xl border border-gray-200 rounded-2xl ">
        <CardHeader className="text-center">
          <Image
            src="/logo/DAMAGA SUITES MRR.png"
            alt="Logo"
            width={150}
            height={150}
            className="mx-auto"
          />
          <CardTitle>Create your account</CardTitle>
          <CardDescription>Fill the form below to sign up</CardDescription>
        </CardHeader>

        <CardContent>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Your Username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            {/* <div className="grid gap-2">
              <Label htmlFor="division">Division</Label>
              <select
                id="division"
                className="border rounded px-3 py-2"
                required
                value={divisi}
                onChange={(e) => setDivisi(e.target.value)}
              >
                <option value="" disabled>
                  Select your division
                </option>
                {divisions.map((d, i) => (
                  <option key={i} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div> */}

            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-sky-600 hover:bg-sky-700 "
              disabled={loading}
            >
              {loading ? "Signing up..." : "Sign up"}
            </Button>
            {message && <p className="text-center text-sm mt-2">{message}</p>}
          </form>

          <blockquote className="mt-6 border-l-2 pl-6 italic">
            I`ll never share your data with anyone else. Pinky promise!
          </blockquote>
        </CardContent>
      </Card>
    </div>
  );
}

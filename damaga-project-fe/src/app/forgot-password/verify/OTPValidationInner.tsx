"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { InputOTP, InputOTPSlot } from "@/components/ui/input-otp";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export default function OTPValidationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";

  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);

  // Step 1: Verifikasi OTP
  const handleVerifyOTP = async () => {
    if (!otp) return setMessage("Masukkan OTP terlebih dahulu");
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/reset-password/verify-otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, otp }), // hanya email & otp
        }
      );

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "OTP tidak valid");

      setOtpVerified(true);
      setMessage("OTP valid! Sekarang masukkan password baru.");
    } catch (err) {
      if (err instanceof Error) setMessage(err.message);
      else setMessage("Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Reset Password setelah OTP verified
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpVerified) return setMessage("Verifikasi OTP dulu bro");
    if (!newPassword) return setMessage("Masukkan password baru");

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/reset-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, otp, newPassword }),
        }
      );

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Gagal reset password");

      setMessage(data.message ?? "Password berhasil direset");
      setTimeout(() => router.push("/login"), 2000);
    } catch (err) {
      if (err instanceof Error) setMessage(err.message);
      else setMessage("Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Reset Password</CardTitle>
          <CardDescription>
            {otpVerified
              ? "Masukkan password baru"
              : "Masukkan OTP yang dikirim ke email"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!otpVerified ? (
            <div className="grid gap-4 text-center">
              <Label htmlFor="otp">OTP</Label>
              <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                <div className="flex justify-center gap-2 ml-0 sm:ml-6">
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <InputOTPSlot
                      key={i}
                      index={i}
                      className="w-10 h-10 sm:w-12 sm:h-12 text-center border rounded-md text-base sm:text-lg"
                    />
                  ))}
                </div>
              </InputOTP>

              <Button
                type="button"
                onClick={handleVerifyOTP}
                disabled={loading}
                className="w-full"
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </Button>
              {message && <p className="text-center text-sm mt-2">{message}</p>}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="grid gap-4 text-center">
              <div className="grid gap-1">
                <Label htmlFor="newPassword">Password Baru</Label>
                <input
                  id="newPassword"
                  type="password"
                  placeholder="Password baru"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="input"
                />
              </div>

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Processing..." : "Reset Password"}
              </Button>

              {message && <p className="text-center text-sm mt-2">{message}</p>}
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

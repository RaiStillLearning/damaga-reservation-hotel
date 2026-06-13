// app/damaga/forbidden/page.tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ForbiddenPage() {
  const router = useRouter();

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white/80 backdrop-blur-sm border rounded-xl shadow-sm p-8 text-center space-y-6">
        <div className="flex flex-col items-center gap-3">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-red-50 border border-red-200">
            <ShieldAlert className="h-7 w-7 text-red-500" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              403 – Akses Ditolak
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Kamu tidak memiliki izin untuk mengakses halaman ini. Jika
              menurutmu ini adalah kesalahan, silakan hubungi administrator.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="w-full sm:w-auto"
          >
            Kembali
          </Button>

          <Button asChild className="w-full sm:w-auto">
            <Link href="/damaga">Kembali ke Dashboard</Link>
          </Button>
        </div>

        <p className="text-[11px] text-slate-400">
          Kode: <span className="font-mono">403 FORBIDDEN</span>
        </p>
      </div>
    </div>
  );
}

"use client";

import { ShieldAlert } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function FinancialPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
      <Card className="w-full max-w-md shadow-lg border">
        <CardContent className="pt-8 pb-10 text-center">
          <ShieldAlert className="w-16 h-16 mx-auto text-red-500 mb-4" />

          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            404 Not Found
          </h1>

          <p className="text-gray-600 mb-6">This page will coming soon later</p>

          <Button
            onClick={() => router.push("/damaga")}
            className="bg-red-600 hover:bg-red-700 text-white px-8"
          >
            Back to Home
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

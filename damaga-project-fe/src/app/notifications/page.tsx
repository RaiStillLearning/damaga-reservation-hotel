"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotificationsPage() {
  const router = useRouter();

  const notifications = [
    {
      id: 1,
      message: "Server maintenance at 10 PM",
      createdAt: "2025-09-28T19:00:00Z",
    },
    {
      id: 2,
      message: "New feature released!",
      createdAt: "2025-09-28T09:00:00Z",
    },
  ];

  const [clientReady, setClientReady] = useState(false);

  useEffect(() => {
    setClientReady(true);
  }, []);

  return (
    <div className="w-full max-w-3xl mx-auto p-6 space-y-6">
      {/* Back Button */}
      <Button
        variant="outline"
        className="flex items-center gap-2"
        onClick={() => router.push("/damaga")}
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>

      <h1 className="text-3xl font-bold text-foreground">Notifications</h1>

      <div className="space-y-4">
        {notifications.map((notif) => (
          <Card key={notif.id}>
            <CardContent>
              <p>{notif.message}</p>
              {clientReady && (
                <p className="text-xs text-muted-foreground">
                  {new Date(notif.createdAt).toLocaleString()}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

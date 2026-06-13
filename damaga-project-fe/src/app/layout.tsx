import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Damaga",
  description: "Damaga reservation",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {/* Debug: Tambahkan styling untuk melihat konten */}
        <div>{children}</div>
      </body>
    </html>
  );
}

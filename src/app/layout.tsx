import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MediTV",
  description: "Clinic queue display kiosk",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}

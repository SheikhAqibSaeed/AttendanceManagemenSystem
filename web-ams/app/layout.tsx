import type { ReactNode } from "react";
import "../styles/globals.css";
import { ClientProviders } from "@/components/ClientProviders";

export const metadata = {
  title: "AMS - Attendance Management System",
  description: "Modern Attendance Management System for tracking employee attendance and salaries.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}

"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    const adminOnlyPaths = ["/employees", "/attendance-records", "/reports", "/salary-report"];
    const isAdminPath = adminOnlyPaths.some((p) => pathname === p || pathname.startsWith(p + "/"));
    if (isAdminPath && user.role !== "admin") {
      router.replace("/dashboard");
    }
  }, [user, loading, router, pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar user={user} />
      <div className="flex">
        <Sidebar user={user} />
        <main className="flex-1 p-6 lg:ml-64 mt-16">{children}</main>
      </div>
    </div>
  );
}


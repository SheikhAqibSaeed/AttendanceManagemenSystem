"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

interface NavbarProps {
  user: {
    userName?: string;
    role?: string;
  } | null;
}

export default function Navbar({ user }: NavbarProps) {
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 z-50 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard" className="text-xl font-bold text-primary-600">
          AMS
        </Link>
        <span className="text-slate-500 hidden sm:inline">
          Attendance Management System
        </span>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-slate-600 text-sm">
          {user?.userName}
          <span className="ml-2 px-2 py-0.5 rounded bg-primary-100 text-primary-700 text-xs">
            {user?.role}
          </span>
        </span>
        <button
          onClick={handleLogout}
          className="text-slate-600 hover:text-red-600 text-sm font-medium"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}


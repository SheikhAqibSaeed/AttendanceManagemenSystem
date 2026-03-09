"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FiGrid,
  FiClock,
  FiList,
  FiUser,
  FiDollarSign,
  FiUsers,
  FiFileText,
  FiBarChart2,
} from "react-icons/fi";

interface SidebarProps {
  user: {
    role?: string;
  } | null;
}

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const isAdmin = user?.role === "admin";

  const navItem = (href: string, label: string, icon: JSX.Element) => {
    const active = pathname === href || pathname.startsWith(href + "/");
    return (
      <Link
        href={href}
        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
          active ? "bg-primary-600 text-white" : "text-slate-600 hover:bg-slate-100"
        }`}
      >
        <span className="text-lg">{icon}</span>
        {label}
      </Link>
    );
  };

  return (
    <aside className="fixed left-0 top-16 w-64 h-[calc(100vh-4rem)] bg-white border-r border-slate-200 p-4 overflow-y-auto">
      <nav className="space-y-1">
        {navItem("/dashboard", "Dashboard", <FiGrid />)}
        {user?.role === "employee" && (
          <>
            {navItem("/checkin", "Check In / Out", <FiClock />)}
            {navItem("/attendance", "Attendance History", <FiList />)}
            {navItem("/profile", "Profile", <FiUser />)}
            {navItem("/salary", "Salary Summary", <FiDollarSign />)}
          </>
        )}
        {isAdmin && (
          <>
            {navItem("/employees", "Employees", <FiUsers />)}
            {navItem("/attendance-records", "Attendance Records", <FiFileText />)}
            {navItem("/reports", "Reports", <FiBarChart2 />)}
            {navItem("/salary-report", "Salary Report", <FiDollarSign />)}
          </>
        )}
      </nav>
    </aside>
  );
}


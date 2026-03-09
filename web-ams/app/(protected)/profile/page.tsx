"use client";

import { useEffect, useState } from "react";
import DashboardShell from "@/components/DashboardShell";
import { authAPI } from "@/services/api";

interface ProfileData {
  employeeId?: string;
  userName?: string;
  email?: string;
  phone?: string;
  monthlySalary?: number;
  role?: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await authAPI.getMe();
        setProfile(data.user);
      } catch {
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

  const p: ProfileData = profile || {};

  return (
    <DashboardShell>
      <div>
        <h1 className="text-2xl font-bold text-slate-800 mb-6">Profile</h1>
        <div className="card max-w-xl">
          <div className="space-y-4">
            <div>
              <span className="text-slate-500 text-sm">Employee ID</span>
              <p className="font-semibold">{p.employeeId}</p>
            </div>
            <div>
              <span className="text-slate-500 text-sm">Name</span>
              <p className="font-semibold">{p.userName}</p>
            </div>
            <div>
              <span className="text-slate-500 text-sm">Email</span>
              <p className="font-semibold">{p.email}</p>
            </div>
            <div>
              <span className="text-slate-500 text-sm">Phone</span>
              <p className="font-semibold">{p.phone || "-"}</p>
            </div>
            <div>
              <span className="text-slate-500 text-sm">Monthly Salary</span>
              <p className="font-semibold">
                {p.monthlySalary != null ? `PKR ${p.monthlySalary.toLocaleString()}` : "-"}
              </p>
            </div>
            <div>
              <span className="text-slate-500 text-sm">Role</span>
              <p className="font-semibold capitalize">{p.role}</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}


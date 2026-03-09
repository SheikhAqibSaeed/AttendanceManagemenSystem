"use client";

import { useEffect, useState } from "react";
import Layout from "@/components/DashboardShell";
import DashboardCard from "@/components/DashboardCard";
import { reportsAPI } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import {
  FiUsers,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiActivity,
  FiCalendar,
} from "react-icons/fi";

interface DailyReport {
  totalEmployees?: number;
  present?: number;
  absent?: number;
  lateEmployees?: number;
  totalWorkingHours?: number;
  date?: string;
}

interface DailyStat {
  date: string;
  present: number;
  totalHours: number;
  late: number;
}

interface MonthlyReport {
  dailyStats?: DailyStat[];
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [dailyReport, setDailyReport] = useState<DailyReport | null>(null);
  const [monthlyReport, setMonthlyReport] = useState<MonthlyReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [daily, monthly] = await Promise.all([
          reportsAPI.daily(),
          reportsAPI.monthly(),
        ]);
        setDailyReport(daily.data.report);
        setMonthlyReport(monthly.data.report);
      } catch (err) {
        console.error(err);
        setDailyReport({
          present: 0,
          absent: 0,
          lateEmployees: 0,
          totalWorkingHours: 0,
        });
        setMonthlyReport({ dailyStats: [] });
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

  const isAdmin = user?.role === "admin";
  const report = dailyReport || {};
  const chartData = (monthlyReport?.dailyStats || []).slice(-14);

  return (
    <Layout>
      <div>
        <h1 className="text-2xl font-bold text-slate-800 mb-6">Dashboard</h1>
        {isAdmin ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
              <DashboardCard
                title="Total Employees"
                value={report.totalEmployees ?? 0}
                icon={<FiUsers />}
                color="primary"
              />
              <DashboardCard
                title="Present Today"
                value={report.present ?? 0}
                icon={<FiCheckCircle />}
                color="green"
              />
              <DashboardCard
                title="Absent Today"
                value={report.absent ?? 0}
                icon={<FiXCircle />}
                color="red"
              />
              <DashboardCard
                title="Late Employees"
                value={report.lateEmployees ?? 0}
                icon={<FiClock />}
                color="amber"
              />
              <DashboardCard
                title="Total Working Hours"
                value={report.totalWorkingHours ?? 0}
                icon={<FiActivity />}
                color="slate"
              />
              <DashboardCard
                title="Date"
                value={report.date ?? "-"}
                icon={<FiCalendar />}
                color="slate"
              />
            </div>
            <div className="card mb-6">
              <h2 className="text-lg font-semibold text-slate-800 mb-4">
                Monthly Attendance
              </h2>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="date" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip
                      contentStyle={{ borderRadius: 8 }}
                      formatter={(v) => [v as number, "Present"]}
                      labelFormatter={(l) => `Date: ${l}`}
                    />
                    <Bar
                      dataKey="present"
                      fill="#0284c7"
                      radius={[4, 4, 0, 0]}
                      name="Present"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        ) : (
          <div className="card max-w-2xl">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">
              Welcome, {user?.userName}
            </h2>
            <p className="text-slate-600">
              Use the sidebar to check in/out, view your attendance history, or see
              your salary summary.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}


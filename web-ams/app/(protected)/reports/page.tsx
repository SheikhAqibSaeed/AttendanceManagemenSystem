"use client";

import { useEffect, useState } from "react";
import DashboardShell from "@/components/DashboardShell";
import { reportsAPI } from "@/services/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";

interface DailyAttendance {
  _id: string;
  employeeId: string;
  date: string;
  checkInTime: string;
  checkOutTime?: string | null;
  totalWorkingHours?: number;
  status: string;
}

interface DailyStat {
  date: string;
  present: number;
  totalHours: number;
  late: number;
}

interface DailyReport {
  attendance: DailyAttendance[];
}

interface MonthlyReport {
  dailyStats: DailyStat[];
}

export default function ReportsPage() {
  const [dailyReport, setDailyReport] = useState<DailyReport | null>(null);
  const [monthlyReport, setMonthlyReport] = useState<MonthlyReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
  const [year, setYear] = useState<number>(new Date().getFullYear());

  useEffect(() => {
    const load = async () => {
      try {
        const [daily, monthly] = await Promise.all([
          reportsAPI.daily({ date }),
          reportsAPI.monthly({ month, year }),
        ]);
        setDailyReport(daily.data.report);
        setMonthlyReport(monthly.data.report);
      } catch {
        setDailyReport(null);
        setMonthlyReport(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [date, month, year]);

  const chartData = monthlyReport?.dailyStats || [];
  const daily = dailyReport?.attendance || [];

  return (
    <DashboardShell>
      <div>
        <h1 className="text-2xl font-bold text-slate-800 mb-6">Reports</h1>
        <div className="flex gap-4 mb-6 flex-wrap">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Daily Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="input-field w-48"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Month</label>
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="input-field w-40"
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i} value={i + 1}>
                  {new Date(2000, i).toLocaleString("default", { month: "long" })}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Year</label>
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="input-field w-32"
            >
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center h-64 items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
          </div>
        ) : (
          <>
            <div className="grid lg:grid-cols-2 gap-6 mb-6">
              <div className="card">
                <h2 className="text-lg font-semibold text-slate-800 mb-4">
                  Monthly Attendance Chart
                </h2>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="date" fontSize={11} />
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
              <div className="card">
                <h2 className="text-lg font-semibold text-slate-800 mb-4">
                  Monthly Working Hours
                </h2>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="date" fontSize={11} />
                      <YAxis fontSize={12} />
                      <Tooltip
                        contentStyle={{ borderRadius: 8 }}
                        formatter={(v) => [v as number, "Hours"]}
                        labelFormatter={(l) => `Date: ${l}`}
                      />
                      <Line
                        type="monotone"
                        dataKey="totalHours"
                        stroke="#0ea5e9"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        name="Hours"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            <div className="card">
              <h2 className="text-lg font-semibold text-slate-800 mb-4">
                Daily Attendance ({date})
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="text-left px-4 py-3 font-medium text-slate-700">
                        Employee ID
                      </th>
                      <th className="text-left px-4 py-3 font-medium text-slate-700">
                        Check In
                      </th>
                      <th className="text-left px-4 py-3 font-medium text-slate-700">
                        Check Out
                      </th>
                      <th className="text-left px-4 py-3 font-medium text-slate-700">Hours</th>
                      <th className="text-left px-4 py-3 font-medium text-slate-700">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {daily.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-6 text-center text-slate-500">
                          No records
                        </td>
                      </tr>
                    ) : (
                      daily.map((r) => (
                        <tr key={r._id} className="border-t border-slate-100">
                          <td className="px-4 py-3 font-medium">{r.employeeId}</td>
                          <td className="px-4 py-3">{r.checkInTime}</td>
                          <td className="px-4 py-3">{r.checkOutTime || "-"}</td>
                          <td className="px-4 py-3">{r.totalWorkingHours || 0}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-2 py-1 rounded text-sm ${
                                r.status === "Late"
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-emerald-100 text-emerald-800"
                              }`}
                            >
                              {r.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardShell>
  );
}


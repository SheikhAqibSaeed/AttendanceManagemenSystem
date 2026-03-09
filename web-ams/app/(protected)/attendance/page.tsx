"use client";

import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import DashboardShell from "@/components/DashboardShell";
import { attendanceAPI } from "@/services/api";
import { useAuth } from "@/context/AuthContext";

interface AttendanceRow {
  _id: string;
  date: string;
  checkInTime: string;
  checkOutTime?: string | null;
  totalWorkingHours?: number;
  status: string;
}

export default function AttendanceHistoryPage() {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState<AttendanceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
  const [year, setYear] = useState<number>(new Date().getFullYear());

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await attendanceAPI.getByEmployee(user!.employeeId, {
          month,
          year,
        });
        setAttendance(data.attendance || []);
      } catch {
        setAttendance([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user, month, year]);

  const handleExportExcel = () => {
    const data = attendance.map((r) => ({
      Date: r.date,
      "Clock In 1": r.checkInTime,
      "Clock Out 1": r.checkOutTime ?? "",
      "Total in time": r.totalWorkingHours ?? 0,
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Attendance");
    const fileName = `attendance-${user!.employeeId}-${year}-${String(month).padStart(
      2,
      "0"
    )}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  return (
    <DashboardShell>
      <div>
        <h1 className="text-2xl font-bold text-slate-800 mb-6">Attendance History</h1>
        <div className="flex gap-4 mb-6 flex-wrap items-center">
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
          <button
            type="button"
            onClick={handleExportExcel}
            disabled={loading || !attendance.length}
            className="btn-secondary"
          >
            Export Excel
          </button>
        </div>
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-slate-700">Date</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-700">Check In</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-700">Check Out</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-700">Hours</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                      Loading...
                    </td>
                  </tr>
                ) : attendance.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                      No records found
                    </td>
                  </tr>
                ) : (
                  attendance.map((r) => (
                    <tr key={r._id} className="border-t border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-3">{r.date}</td>
                      <td className="px-4 py-3">{r.checkInTime}</td>
                      <td className="px-4 py-3">{r.checkOutTime || "-"}</td>
                      <td className="px-4 py-3">{r.totalWorkingHours ?? 0}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded text-sm ${
                            r.status === "Late"
                              ? "bg-amber-100 text-amber-800"
                              : r.status === "Present"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-slate-100 text-slate-800"
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
      </div>
    </DashboardShell>
  );
}


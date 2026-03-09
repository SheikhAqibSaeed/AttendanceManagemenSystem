"use client";

import { useEffect, useState } from "react";
import DashboardShell from "@/components/DashboardShell";
import { attendanceAPI } from "@/services/api";

interface AttendanceRow {
  _id: string;
  employeeId: string;
  date: string;
  checkInTime: string;
  checkOutTime?: string | null;
  totalWorkingHours?: number;
  status: string;
}

export default function AttendanceRecordsPage() {
  const [attendance, setAttendance] = useState<AttendanceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState<string>(new Date().toISOString().split("T")[0]);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await attendanceAPI.getAll({ date });
        setAttendance(data.attendance || []);
      } catch {
        setAttendance([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [date]);

  return (
    <DashboardShell>
      <div>
        <h1 className="text-2xl font-bold text-slate-800 mb-6">Attendance Records</h1>
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="input-field w-48"
          />
        </div>
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-slate-700">Employee ID</th>
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
                      No records for this date
                    </td>
                  </tr>
                ) : (
                  attendance.map((r) => (
                    <tr key={r._id} className="border-t border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium">{r.employeeId}</td>
                      <td className="px-4 py-3">{r.checkInTime}</td>
                      <td className="px-4 py-3">{r.checkOutTime || "-"}</td>
                      <td className="px-4 py-3">{r.totalWorkingHours ?? 0}</td>
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
      </div>
    </DashboardShell>
  );
}


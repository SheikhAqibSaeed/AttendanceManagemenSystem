"use client";

import { useState, useEffect } from "react";
import DashboardShell from "@/components/DashboardShell";
import { attendanceAPI } from "@/services/api";
import { useAuth } from "@/context/AuthContext";

const getTimeNow = () => {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
};

interface AttendanceRecord {
  _id?: string;
  employeeId?: string;
  date?: string;
  checkInTime?: string;
  checkOutTime?: string | null;
  totalWorkingHours?: number;
  status?: string;
}

export default function CheckInPage() {
  const { user } = useAuth();
  const [todayRecord, setTodayRecord] = useState<AttendanceRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error" | ""; text: string }>({
    type: "",
    text: "",
  });
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [customCheckInTime, setCustomCheckInTime] = useState<string>(getTimeNow());
  const [customCheckOutTime, setCustomCheckOutTime] = useState<string>(getTimeNow());

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await attendanceAPI.getByEmployee(user!.employeeId, {
          startDate: selectedDate,
          endDate: selectedDate,
        });
        const record: AttendanceRecord | null = data.attendance?.[0] || null;
        setTodayRecord(record);
        setCustomCheckInTime(record?.checkInTime || getTimeNow());
        setCustomCheckOutTime(getTimeNow());
      } catch {
        setTodayRecord(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user, selectedDate]);

  const handleCheckIn = async () => {
    setActionLoading(true);
    setMessage({ type: "", text: "" });
    try {
      await attendanceAPI.checkIn({
        date: selectedDate,
        checkInTime: customCheckInTime,
      });
      setMessage({ type: "success", text: "Checked in successfully!" });
      setTodayRecord({
        date: selectedDate,
        checkInTime: customCheckInTime,
        status: customCheckInTime > "09:00" ? "Late" : "Present",
        checkOutTime: null,
      });
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err?.response?.data?.message || "Check-in failed",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setActionLoading(true);
    setMessage({ type: "", text: "" });
    try {
      await attendanceAPI.checkOut({
        date: selectedDate,
        checkOutTime: customCheckOutTime,
      });
      setMessage({ type: "success", text: "Checked out successfully!" });
      const { data } = await attendanceAPI.getByEmployee(user!.employeeId, {
        startDate: selectedDate,
        endDate: selectedDate,
      });
      setTodayRecord(data.attendance?.[0] || null);
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err?.response?.data?.message || "Check-out failed",
      });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

  const canCheckIn = !todayRecord?.checkInTime;
  const canCheckOut = !!todayRecord?.checkInTime && !todayRecord?.checkOutTime;

  return (
    <DashboardShell>
      <div>
        <h1 className="text-2xl font-bold text-slate-800 mb-6">Check In / Check Out</h1>
        <div className="card max-w-lg">
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">Select Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="input-field w-full max-w-xs"
            />
          </div>
          {message.text && (
            <div
              className={`p-3 rounded-lg mb-4 ${
                message.type === "success"
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-red-50 text-red-700"
              }`}
            >
              {message.text}
            </div>
          )}
          {todayRecord ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-500 block text-sm mb-1">Check In</span>
                  {canCheckIn ? (
                    <div>
                      <input
                        type="time"
                        value={customCheckInTime}
                        onChange={(e) => setCustomCheckInTime(e.target.value)}
                        className="input-field"
                      />
                    </div>
                  ) : (
                    <p className="font-semibold text-lg">{todayRecord.checkInTime || "-"}</p>
                  )}
                </div>
                <div>
                  <span className="text-slate-500 block text-sm mb-1">Check Out</span>
                  {canCheckOut ? (
                    <input
                      type="time"
                      value={customCheckOutTime}
                      onChange={(e) => setCustomCheckOutTime(e.target.value)}
                      className="input-field"
                    />
                  ) : (
                    <p className="font-semibold text-lg">{todayRecord.checkOutTime || "-"}</p>
                  )}
                </div>
                <div>
                  <span className="text-slate-500">Status</span>
                  <p className="font-semibold">{todayRecord.status}</p>
                </div>
                <div>
                  <span className="text-slate-500">Working Hours</span>
                  <p className="font-semibold">
                    {todayRecord.totalWorkingHours ?? 0} hrs
                  </p>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                {canCheckIn && (
                  <button
                    onClick={handleCheckIn}
                    disabled={actionLoading}
                    className="btn-primary disabled:opacity-70"
                  >
                    {actionLoading ? "..." : "Check In"}
                  </button>
                )}
                {canCheckOut && (
                  <button
                    onClick={handleCheckOut}
                    disabled={actionLoading}
                    className="btn-primary bg-emerald-600 hover:bg-emerald-700 disabled:opacity-70"
                  >
                    {actionLoading ? "..." : "Check Out"}
                  </button>
                )}
                {!canCheckIn && !canCheckOut && (
                  <p className="text-slate-500">
                    You have completed attendance for this date.
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Check In Time (optional)
                </label>
                <input
                  type="time"
                  value={customCheckInTime}
                  onChange={(e) => setCustomCheckInTime(e.target.value)}
                  className="input-field max-w-xs"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Leave default or edit. Click below to check in.
                </p>
              </div>
              <button
                onClick={handleCheckIn}
                disabled={actionLoading}
                className="btn-primary disabled:opacity-70"
              >
                {actionLoading ? "..." : "Check In"}
              </button>
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}


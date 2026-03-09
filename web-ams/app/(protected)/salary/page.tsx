"use client";

import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import DashboardShell from "@/components/DashboardShell";
import { attendanceAPI, reportsAPI } from "@/services/api";
import { useAuth } from "@/context/AuthContext";

interface SalaryRow {
  employeeId: string;
  userName: string;
  email: string;
  monthlySalary: number;
  totalWorkingHours: number;
  workingDays: number;
  expectedHours: number;
  hourlyRate: number;
  calculatedSalary: number;
}

interface SalaryReportResponse {
  salaryReport?: SalaryRow | SalaryRow[];
  workingDays?: number;
  expectedHours?: number;
}

export default function SalarySummaryPage() {
  const { user } = useAuth();
  const [report, setReport] = useState<SalaryReportResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
  const [year, setYear] = useState<number>(new Date().getFullYear());

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await reportsAPI.salary({
          month,
          year,
          employeeId: user!.employeeId,
        });
        setReport(data.report);
      } catch {
        setReport(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user, month, year]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

  const sr = report?.salaryReport;
  const isArray = Array.isArray(sr);
  const row: SalaryRow | undefined = isArray ? sr?.[0] : (sr as SalaryRow | undefined);

  const handleExportExcel = async () => {
    if (!row) return;

    // Fetch attendance for this month (used for both Summary sample and Attendance sheet)
    const attendanceRes = await attendanceAPI.getByEmployee(user!.employeeId, {
      month,
      year,
    });
    const attendance: {
      date: string;
      checkInTime: string;
      checkOutTime?: string | null;
      totalWorkingHours?: number;
      status: string;
    }[] = attendanceRes.data.attendance || [];

    const firstRecord = attendance.length > 0 ? attendance[0] : null;

    // Summary sheet (include sample Check In / Check Out from first record if any)
    const summaryData = [
      {
        "Employee ID": row.employeeId,
        Name: row.userName,
        "Base Salary": row.monthlySalary,        
        "Date": firstRecord?.date ?? "",
        "Check In": firstRecord?.checkInTime ?? "",
        "Check Out": firstRecord?.checkOutTime ?? "",
        "Total in time": firstRecord?.totalWorkingHours ?? 0,
        "Expected Hours": row.expectedHours,
        "Working Days": row.workingDays ?? report?.workingDays ?? "",
        "Hours Worked": row.totalWorkingHours,
        "Hourly Rate": row.hourlyRate,
        "Calculated Salary": row.calculatedSalary,
      },
    ];

    const attendanceData = attendance.map((a) => ({
      Date: a.date,
      "Clock In / Out": `${a.checkInTime} - ${a.checkOutTime ?? ""}`,
      "Total in time": a.totalWorkingHours ?? 0,
    }));

    const wb = XLSX.utils.book_new();
    const summarySheet = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, summarySheet, "Summary");

    // if (attendanceData.length) {
    //   const attendanceSheet = XLSX.utils.json_to_sheet(attendanceData);
    //   XLSX.utils.book_append_sheet(wb, attendanceSheet, "Attendance");
    // }

    const fileName = `salary-summary-${row.employeeId}-${year}-${String(month).padStart(
      2,
      "0"
    )}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  return (
    <DashboardShell>
      <div>
        <h1 className="text-2xl font-bold text-slate-800 mb-6">Salary Summary</h1>
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
            disabled={loading || !row}
            className="btn-secondary"
          >
            Export Excel
          </button>
        </div>
        {row ? (
          <div className="card max-w-xl space-y-4">
            <div>
              <span className="text-slate-500 text-sm">Employee</span>
              <p className="font-semibold text-lg">{row.userName}</p>
            </div>
            <div>
              <span className="text-slate-500 text-sm">Monthly Salary (Base)</span>
              <p className="font-semibold">PKR {row.monthlySalary?.toLocaleString()}</p>
            </div>
            <div>
              <span className="text-slate-500 text-sm">
                Working Days (Mon–Fri, excl. Sat/Sun)
              </span>
              <p className="font-semibold">
                {row.workingDays ?? report?.workingDays ?? "-"} days
              </p>
            </div>
            <div>
              <span className="text-slate-500 text-sm">Expected Hours</span>
              <p className="font-semibold">{row.expectedHours} hrs</p>
            </div>
            <div>
              <span className="text-slate-500 text-sm">Total Working Hours</span>
              <p className="font-semibold">{row.totalWorkingHours} hrs</p>
            </div>
            <div>
              <span className="text-slate-500 text-sm">Hourly Rate</span>
              <p className="font-semibold">PKR {row.hourlyRate?.toFixed(2)}</p>
            </div>
            <div className="pt-4 border-t">
              <span className="text-slate-500 text-sm">Calculated Salary</span>
              <p className="font-bold text-xl text-primary-600">
                PKR {row.calculatedSalary?.toLocaleString()}
              </p>
            </div>
          </div>
        ) : (
          <div className="card">
            <p className="text-slate-500">No salary data for this period.</p>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}


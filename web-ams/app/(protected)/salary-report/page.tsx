"use client";

import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
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
} from "recharts";

interface SalaryRow {
  employeeId: string;
  userName: string;
  monthlySalary: number;
  totalWorkingHours: number;
  workingDays?: number;
  calculatedSalary: number;
}

interface SalaryReportResponse {
  salaryReport?: SalaryRow | SalaryRow[];
  workingDays?: number;
  expectedHours?: number;
}

export default function SalaryReportPage() {
  const [report, setReport] = useState<SalaryReportResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
  const [year, setYear] = useState<number>(new Date().getFullYear());

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await reportsAPI.salary({ month, year });
        setReport(data.report);
      } catch {
        setReport(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [month, year]);

  const salaryReport = report?.salaryReport;
  const list: SalaryRow[] = Array.isArray(salaryReport)
    ? salaryReport
    : salaryReport
    ? [salaryReport as SalaryRow]
    : [];
  const chartData = list.map((r) => ({
    name: r.userName,
    salary: r.calculatedSalary,
    hours: r.totalWorkingHours,
  }));

  const handleExportExcel = () => {
    if (!report) return;
    const rows = list.length ? list : [];
    const data = rows.map((r) => ({
      "Employee ID": r.employeeId,
      Name: r.userName,
      "Base Salary": r.monthlySalary,
      "Working Days": r.workingDays ?? report.workingDays ?? "",
      "Hours Worked": r.totalWorkingHours,
      "Calculated Salary": r.calculatedSalary,
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Salary");
    const fileName = `salary-report-${year}-${String(month).padStart(2, "0")}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  return (
    <DashboardShell>
      <div>
        <h1 className="text-2xl font-bold text-slate-800 mb-6">Salary Report</h1>
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
            disabled={loading || !list.length}
            className="btn-secondary"
          >
            Export Excel
          </button>
        </div>
        {loading ? (
          <div className="flex justify-center h-64 items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
          </div>
        ) : (
          <>
            {report?.workingDays != null && (
              <div className="card mb-6 p-4">
                <p className="text-slate-600">
                  <span className="font-medium">Working days this month (Mon–Fri):</span>{" "}
                  {report.workingDays} days ·{" "}
                  <span className="font-medium">Expected hours:</span> {report.expectedHours} hrs
                </p>
              </div>
            )}
            {chartData.length > 0 && (
              <div className="card mb-6">
                <h2 className="text-lg font-semibold text-slate-800 mb-4">
                  Salary Summary Chart
                </h2>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} layout="vertical" margin={{ left: 80 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis type="number" fontSize={12} tickFormatter={(v) => `PKR ${v}`} />
                      <YAxis dataKey="name" type="category" width={100} fontSize={11} />
                      <Tooltip
                        contentStyle={{ borderRadius: 8 }}
                        formatter={(v) => [`PKR ${(v as number)?.toLocaleString()}`, "Salary"]}
                        labelFormatter={(l) => l}
                      />
                      <Bar
                        dataKey="salary"
                        fill="#0284c7"
                        radius={[0, 4, 4, 0]}
                        name="Salary"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
            <div className="card overflow-hidden p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="text-left px-4 py-3 font-medium text-slate-700">Employee</th>
                      <th className="text-left px-4 py-3 font-medium text-slate-700">
                        Base Salary
                      </th>
                      <th className="text-left px-4 py-3 font-medium text-slate-700">
                        Working Days
                      </th>
                      <th className="text-left px-4 py-3 font-medium text-slate-700">
                        Hours Worked
                      </th>
                      <th className="text-left px-4 py-3 font-medium text-slate-700">
                        Calculated
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {list.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                          No data for this period
                        </td>
                      </tr>
                    ) : (
                      list.map((r) => (
                        <tr
                          key={r.employeeId}
                          className="border-t border-slate-100 hover:bg-slate-50"
                        >
                          <td className="px-4 py-3">
                            <p className="font-medium">{r.userName}</p>
                            <p className="text-sm text-slate-500">{r.employeeId}</p>
                          </td>
                          <td className="px-4 py-3">
                            PKR {r.monthlySalary?.toLocaleString()}
                          </td>
                          <td className="px-4 py-3">
                            {r.workingDays ?? report?.workingDays ?? "-"} days
                          </td>
                          <td className="px-4 py-3">{r.totalWorkingHours} hrs</td>
                          <td className="px-4 py-3 font-semibold text-primary-600">
                            PKR {r.calculatedSalary?.toLocaleString()}
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


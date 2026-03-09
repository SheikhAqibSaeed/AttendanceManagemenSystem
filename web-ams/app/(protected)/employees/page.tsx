"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import DashboardShell from "@/components/DashboardShell";
import { employeesAPI } from "@/services/api";

interface EmployeeRow {
  _id: string;
  employeeId: string;
  userName: string;
  email: string;
  phone: string;
  monthlySalary?: number;
  role: "admin" | "employee" | string;
}

export default function EmployeesListPage() {
  const [employees, setEmployees] = useState<EmployeeRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await employeesAPI.getAll();
        setEmployees(data.employees || []);
      } catch {
        setEmployees([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <DashboardShell>
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-slate-800">Employees</h1>
          <Link href="/employees/add" className="btn-primary">
            + Add Employee
          </Link>
        </div>
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-slate-700">ID</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-700">Name</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-700">Email</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-700">Phone</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-700">Salary</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-700">Role</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                      Loading...
                    </td>
                  </tr>
                ) : employees.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                      No employees found
                    </td>
                  </tr>
                ) : (
                  employees.map((e) => (
                    <tr key={e._id} className="border-t border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium">{e.employeeId}</td>
                      <td className="px-4 py-3">{e.userName}</td>
                      <td className="px-4 py-3">{e.email}</td>
                      <td className="px-4 py-3">{e.phone}</td>
                      <td className="px-4 py-3">
                        {e.monthlySalary != null ? `PKR ${e.monthlySalary.toLocaleString()}` : "-"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded text-sm ${
                            e.role === "admin"
                              ? "bg-primary-100 text-primary-700"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {e.role}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/employees/edit/${e._id}`}
                          className="text-primary-600 hover:underline font-medium"
                        >
                          Edit
                        </Link>
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


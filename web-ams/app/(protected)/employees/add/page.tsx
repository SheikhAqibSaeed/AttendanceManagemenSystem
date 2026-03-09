"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardShell from "@/components/DashboardShell";
import { employeesAPI } from "@/services/api";

interface EmployeeForm {
  employeeId: string;
  userName: string;
  email: string;
  phone: string;
  monthlySalary: string | number;
  role: "employee" | "admin";
  password: string;
}

export default function AddEmployeePage() {
  const router = useRouter();
  const [form, setForm] = useState<EmployeeForm>({
    employeeId: "",
    userName: "",
    email: "",
    phone: "",
    monthlySalary: "",
    role: "employee",
    password: "changeme123",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((p) => ({
      ...p,
      [name]: name === "monthlySalary" ? (value === "" ? "" : Number(value) || "") : value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await employeesAPI.create({
        ...form,
        monthlySalary: Number(form.monthlySalary) || 0,
      });
      router.push("/employees");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to create employee");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardShell>
      <div>
        <h1 className="text-2xl font-bold text-slate-800 mb-6">Add Employee</h1>
        <div className="card max-w-xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Employee ID
              </label>
              <input
                name="employeeId"
                value={form.employeeId}
                onChange={handleChange}
                className="input-field"
                placeholder="EMP001 (optional)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Name *</label>
              <input
                name="userName"
                value={form.userName}
                onChange={handleChange}
                className="input-field"
                placeholder="Ali Khan"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="input-field"
                placeholder="ali@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Phone *</label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="input-field"
                placeholder="03000000000"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Monthly Salary *
              </label>
              <input
                type="number"
                name="monthlySalary"
                value={form.monthlySalary}
                onChange={handleChange}
                className="input-field"
                placeholder="50000"
                min={0}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="input-field"
              >
                <option value="employee">Employee</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password *</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                className="input-field"
                placeholder="••••••••"
                minLength={6}
                required
              />
              <p className="text-xs text-slate-500 mt-1">Default: changeme123</p>
            </div>
            <div className="flex gap-3 pt-4">
              <button type="submit" disabled={loading} className="btn-primary disabled:opacity-70">
                {loading ? "Creating..." : "Create Employee"}
              </button>
              <button
                type="button"
                onClick={() => router.push("/employees")}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardShell>
  );
}


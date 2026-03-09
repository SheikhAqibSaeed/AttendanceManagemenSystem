"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import DashboardShell from "@/components/DashboardShell";
import { employeesAPI } from "@/services/api";

interface EmployeeForm {
  userName: string;
  email: string;
  phone: string;
  monthlySalary: string | number;
  role: "employee" | "admin";
  password: string;
}

export default function EditEmployeePage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [form, setForm] = useState<EmployeeForm>({
    userName: "",
    email: "",
    phone: "",
    monthlySalary: "",
    role: "employee",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        const { data } = await employeesAPI.getOne(id);
        const e = data.employee;
        setForm({
          userName: e.userName || "",
          email: e.email || "",
          phone: e.phone || "",
          monthlySalary: e.monthlySalary ?? "",
          role: e.role || "employee",
          password: "",
        });
      } catch {
        setError("Employee not found");
      } finally {
        setFetchLoading(false);
      }
    };
    load();
  }, [id]);

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
      const payload: any = { ...form };
      if (!payload.password) delete payload.password;
      await employeesAPI.update(id, payload);
      router.push("/employees");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to update employee");
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <div>
        <h1 className="text-2xl font-bold text-slate-800 mb-6">Edit Employee</h1>
        <div className="card max-w-xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Name *</label>
              <input
                name="userName"
                value={form.userName}
                onChange={handleChange}
                className="input-field"
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
              <label className="block text-sm font-medium text-slate-700 mb-1">
                New Password
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                className="input-field"
                placeholder="Leave blank to keep current"
                minLength={6}
              />
            </div>
            <div className="flex gap-3 pt-4">
              <button type="submit" disabled={loading} className="btn-primary disabled:opacity-70">
                {loading ? "Saving..." : "Save"}
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


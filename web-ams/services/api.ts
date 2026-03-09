import axios, { AxiosError, AxiosInstance } from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  if (token && config.headers) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err: AxiosError) => {
    if (err.response?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  login: (data: { email: string; password: string }) => api.post("/auth/login", data),
  register: (data: unknown) => api.post("/auth/register", data),
  getMe: () => api.get("/auth/me"),
};

export const employeesAPI = {
  getAll: () => api.get("/employees"),
  getOne: (id: string) => api.get(`/employees/${id}`),
  create: (data: unknown) => api.post("/employees", data),
  update: (id: string, data: unknown) => api.put(`/employees/${id}`, data),
  delete: (id: string) => api.delete(`/employees/${id}`),
};

export const attendanceAPI = {
  checkIn: (data: unknown) => api.post("/attendance/checkin", data),
  checkOut: (data: unknown) => api.post("/attendance/checkout", data),
  getAll: (params?: unknown) => api.get("/attendance", { params }),
  getByEmployee: (employeeId: string, params?: unknown) =>
    api.get(`/attendance/${employeeId}`, { params }),
};

export const reportsAPI = {
  daily: (params?: unknown) => api.get("/reports/daily", { params }),
  monthly: (params?: unknown) => api.get("/reports/monthly", { params }),
  salary: (params?: unknown) => api.get("/reports/salary", { params }),
};

export default api;


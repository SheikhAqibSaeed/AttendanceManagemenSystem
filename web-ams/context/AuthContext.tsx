"use client";

import type { ReactNode } from "react";
import { createContext, useContext, useState, useEffect } from "react";
import { authAPI } from "@/services/api";

export interface AuthUser {
  id: string;
  employeeId: string;
  userName: string;
  email: string;
  role: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const saved = typeof window !== "undefined" ? localStorage.getItem("user") : null;
    if (token && saved) {
      try {
        setUser(JSON.parse(saved));
      } catch {
        // ignore parse error
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const { data } = await authAPI.login({ email, password });
    localStorage.setItem("token", data.token);
    const u: AuthUser = {
      id: data.user.id,
      employeeId: data.user.employeeId,
      userName: data.user.userName,
      email: data.user.email,
      role: data.user.role,
    };
    localStorage.setItem("user", JSON.stringify(u));
    setUser(u);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  const value: AuthContextValue = { user, loading, login, logout };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}


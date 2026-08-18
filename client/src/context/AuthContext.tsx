import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { apiRequest } from "../lib/api";
import type { User } from "../types";

interface AuthValue {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (values: { name: string; email: string; password: string }) => Promise<void>;
  updateProfile: (values: Partial<Pick<User, "name" | "currency">>) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthValue | null>(null);
const storageKey = "finora-session:v1";

function storedSession(): { user: User | null; token: string | null } {
  try {
    const value = localStorage.getItem(storageKey);
    if (!value) return { user: null, token: null };
    const parsed = JSON.parse(value) as { user?: User; token?: string };
    if (!parsed.user?._id || !parsed.token) return { user: null, token: null };
    return { user: parsed.user, token: parsed.token };
  } catch {
    return { user: null, token: null };
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [initial] = useState(storedSession);
  const [user, setUser] = useState<User | null>(initial.user);
  const [token, setToken] = useState<string | null>(initial.token);

  function saveSession(nextUser: User | null, nextToken: string | null) {
    setUser(nextUser);
    setToken(nextToken);
    try {
      if (nextUser && nextToken) localStorage.setItem(storageKey, JSON.stringify({ user: nextUser, token: nextToken }));
      else localStorage.removeItem(storageKey);
    } catch {
      // The app remains usable when browser storage is disabled.
    }
  }

  async function login(email: string, password: string) {
    const data = await apiRequest<{ user: User; token: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    saveSession(data.user, data.token);
  }

  async function register(values: { name: string; email: string; password: string }) {
    const data = await apiRequest<{ user: User; token: string }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ ...values, currency: "LKR" }),
    });
    saveSession(data.user, data.token);
  }

  async function updateProfile(values: Partial<Pick<User, "name" | "currency">>) {
    const nextUser = await apiRequest<User>("/auth/me", { method: "PUT", body: JSON.stringify(values) }, token);
    saveSession(nextUser, token);
  }

  const value = useMemo(
    () => ({ user, token, login, register, updateProfile, logout: () => saveSession(null, null) }),
    [user, token],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used within AuthProvider");
  return value;
}

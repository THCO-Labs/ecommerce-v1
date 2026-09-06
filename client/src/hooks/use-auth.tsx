import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { authApi, type Credentials, type Registration } from "@/api/auth";
import type { Profile } from "@/types";

interface AuthContextValue {
  user: Profile | null;
  /** True until the first `/auth/me` call settles, so guards do not flash. */
  loading: boolean;
  login: (input: Credentials) => Promise<Profile>;
  register: (input: Registration) => Promise<Profile>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * The session lives in an httpOnly cookie the browser cannot read, so the
 * signed-in user is whatever `/auth/me` last reported. Every mutation folds its
 * response back into this state instead of re-fetching.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      setUser(await authApi.me());
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const login = useCallback(async (input: Credentials) => {
    const profile = await authApi.login(input);
    setUser(profile);
    return profile;
  }, []);

  const register = useCallback(async (input: Registration) => {
    const profile = await authApi.register(input);
    setUser(profile);
    return profile;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, register, logout, refresh }),
    [user, loading, login, register, logout, refresh],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside <AuthProvider>");
  return context;
}

/** Staff and admin both reach the dashboard; customers never do. */
export function isStaff(user: Profile | null): boolean {
  return user?.role === "staff" || user?.role === "admin";
}

/** Only an admin changes the catalogue, prices, or who may do what. */
export function isAdmin(user: Profile | null): boolean {
  return user?.role === "admin";
}

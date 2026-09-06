import { api } from "./client";
import type { Profile, UserRole } from "@/types";

export interface Credentials {
  email: string;
  password: string;
}

export interface Registration extends Credentials {
  confirmPassword: string;
  fullName?: string;
}

export const authApi = {
  async me(): Promise<Profile | null> {
    const { user } = await api.get<{ user: Profile | null }>("/auth/me");
    return user;
  },
  async login(input: Credentials): Promise<Profile> {
    const { user } = await api.post<{ user: Profile }>("/auth/login", input);
    return user;
  },
  async register(input: Registration): Promise<Profile> {
    const { user } = await api.post<{ user: Profile }>("/auth/register", input);
    return user;
  },
  async logout(): Promise<void> {
    await api.post("/auth/logout");
  },
  async updateProfile(input: { fullName?: string | null; phone?: string | null }): Promise<Profile> {
    const { user } = await api.patch<{ user: Profile }>("/auth/profile", input);
    return user;
  },
};

/** Admin only — the API refuses these for anyone else. */
export const usersApi = {
  async list(): Promise<Profile[]> {
    const { users } = await api.get<{ users: Profile[] }>("/users");
    return users;
  },
  async setRole(userId: string, role: UserRole): Promise<Profile> {
    const { user } = await api.patch<{ user: Profile }>(`/users/${userId}/role`, { role });
    return user;
  },
};

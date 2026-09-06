import type { Request, Response } from "express";
import { z } from "zod";
import { parseOrThrow } from "../../common/validate.js";
import { unauthorized } from "../../common/errors.js";
import { clearSession, issueSession } from "./auth.session.js";
import {
  findSessionUser,
  listUsers,
  login,
  register,
  updateProfile,
  updateUserRole,
} from "./auth.service.js";
import { adoptCartForUser } from "../cart/cart.service.js";

const registerSchema = z.object({
  email: z.string().min(1, "Enter a valid email address"),
  password: z.string().min(1, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(1, "Passwords do not match"),
  fullName: z.string().trim().max(120).optional(),
});

const loginSchema = z.object({
  email: z.string().min(1, "Enter your email address"),
  password: z.string().min(1, "Enter your password"),
});

const profileSchema = z.object({
  fullName: z.string().trim().max(120).nullable().optional(),
  phone: z.string().trim().max(40).nullable().optional(),
});

const roleSchema = z.object({ role: z.enum(["customer", "staff", "admin"]) });

export async function registerHandler(req: Request, res: Response) {
  const user = await register(parseOrThrow(registerSchema, req.body));
  await issueSession(res, { userId: user.id, role: user.role });
  // Whatever they put in the basket before signing up follows them in.
  await adoptCartForUser(req, res, user.id);
  res.status(201).json({ user });
}

export async function loginHandler(req: Request, res: Response) {
  const user = await login(parseOrThrow(loginSchema, req.body));
  await issueSession(res, { userId: user.id, role: user.role });
  await adoptCartForUser(req, res, user.id);
  res.json({ user });
}

export function logoutHandler(_req: Request, res: Response) {
  clearSession(res);
  res.json({ ok: true });
}

/** Always 200 — the client treats `{ user: null }` as "signed out". */
export async function meHandler(req: Request, res: Response) {
  if (!req.session) {
    res.json({ user: null });
    return;
  }
  const user = await findSessionUser(req.session);
  if (!user) clearSession(res);
  res.json({ user });
}

export async function updateProfileHandler(req: Request, res: Response) {
  const input = parseOrThrow(profileSchema, req.body);
  res.json({ user: await updateProfile(req.session!.userId, input) });
}

export async function listUsersHandler(_req: Request, res: Response) {
  res.json({ users: await listUsers() });
}

export async function updateUserRoleHandler(req: Request, res: Response) {
  const { role } = parseOrThrow(roleSchema, req.body);
  const session = req.session;
  if (!session) throw unauthorized();
  res.json({ user: await updateUserRole(String(req.params.id), role, session.userId) });
}

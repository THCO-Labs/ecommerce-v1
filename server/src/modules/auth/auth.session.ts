import type { CookieOptions, Response } from "express";
import { env, isProduction } from "../../common/env.js";
import type { UserRole } from "./auth.model.js";
import { signSessionToken, verifySessionToken, type SessionPayload } from "./auth.token.js";

export const SESSION_COOKIE_NAME = "northwind_session";
export const SESSION_MAX_AGE_MS = 60 * 60 * 24 * 7 * 1000;
export type { SessionPayload };

const cookieOptions: CookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
  path: "/",
};

export async function issueSession(res: Response, payload: { userId: string; role: UserRole }) {
  const token = await signSessionToken(payload, env.AUTH_SECRET);
  res.cookie(SESSION_COOKIE_NAME, token, { ...cookieOptions, maxAge: SESSION_MAX_AGE_MS });
}

export function clearSession(res: Response) {
  res.clearCookie(SESSION_COOKIE_NAME, cookieOptions);
}

export async function readSession(token: string | undefined) {
  return verifySessionToken(token, env.AUTH_SECRET);
}

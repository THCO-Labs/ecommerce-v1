import type { NextFunction, Request, Response } from "express";
import { forbidden, unauthorized } from "../errors.js";
import { readSession, SESSION_COOKIE_NAME, type SessionPayload } from "../../modules/auth/auth.session.js";
import type { UserRole } from "../../modules/auth/auth.model.js";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      session?: SessionPayload | null;
    }
  }
}

/**
 * Verifies the session cookie on every request and hangs the payload off
 * `req.session`. Routes decide what to do with it.
 */
export async function attachSession(req: Request, _res: Response, next: NextFunction) {
  req.session = await readSession(req.cookies?.[SESSION_COOKIE_NAME]);
  next();
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  if (!req.session) return next(unauthorized());
  next();
}

/**
 * Role gate. `requireRole("admin")` for anything that changes the catalogue or
 * user roles; `requireRole("staff", "admin")` for operational work.
 *
 * This is the security boundary. The client guards mirror it for navigation
 * only — a customer who edits client state reaches an empty page and nothing
 * more, because every route re-checks here.
 */
export function requireRole(...roles: UserRole[]) {
  return function guard(req: Request, _res: Response, next: NextFunction) {
    if (!req.session) return next(unauthorized());
    if (!roles.includes(req.session.role)) {
      return next(forbidden(`This action requires the ${roles.join(" or ")} role.`));
    }
    next();
  };
}

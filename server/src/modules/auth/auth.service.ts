import { asc, eq } from "drizzle-orm";
import { db } from "../../common/db/index.js";
import { badRequest, conflict, notFound, unauthorized } from "../../common/errors.js";
import { users, type UserRole } from "./auth.model.js";
import { hashPassword, normalizeEmail, registrationError, verifyPassword } from "./auth.credentials.js";

/** The user shape returned to the browser. Never includes the password hash. */
export interface PublicUser {
  id: string;
  email: string;
  role: UserRole;
  fullName: string | null;
  phone: string | null;
}

const publicColumns = {
  id: users.id,
  email: users.email,
  role: users.role,
  fullName: users.full_name,
  phone: users.phone,
};

export async function register(input: {
  email: string;
  password: string;
  confirmPassword: string;
  fullName?: string;
}): Promise<PublicUser> {
  const email = normalizeEmail(input.email);
  const validationError = registrationError(email, input.password, input.confirmPassword);
  if (validationError) throw badRequest(validationError);

  const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  if (existing) throw conflict("An account with this email already exists");

  const password_hash = await hashPassword(input.password);
  // Self-registration always produces a customer. Staff and admin accounts are
  // made by an admin promoting an existing user, never by signing up.
  const [created] = await db
    .insert(users)
    .values({ email, password_hash, full_name: input.fullName?.trim() || null, role: "customer" })
    .returning(publicColumns);

  if (!created) throw badRequest("Unable to create the account");
  return created;
}

export async function login(input: { email: string; password: string }): Promise<PublicUser> {
  const email = normalizeEmail(input.email);
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

  if (!user?.password_hash || !(await verifyPassword(input.password, user.password_hash))) {
    throw unauthorized("Invalid email or password");
  }
  return { id: user.id, email: user.email, role: user.role, fullName: user.full_name, phone: user.phone };
}

/**
 * Re-reads the user behind a verified token. Returning `null` when the stored
 * role no longer matches the token invalidates sessions after a role change —
 * without it, a demoted admin keeps admin rights until the token expires.
 */
export async function findSessionUser(session: { userId: string; role: UserRole }): Promise<PublicUser | null> {
  const [user] = await db.select(publicColumns).from(users).where(eq(users.id, session.userId)).limit(1);
  if (!user || user.role !== session.role) return null;
  return user;
}

export async function updateProfile(
  userId: string,
  input: { fullName?: string | null; phone?: string | null },
): Promise<PublicUser> {
  const [updated] = await db
    .update(users)
    .set({ full_name: input.fullName ?? null, phone: input.phone ?? null, updated_at: new Date() })
    .where(eq(users.id, userId))
    .returning(publicColumns);
  if (!updated) throw notFound("That account could not be found.");
  return updated;
}

/** Admin only: the people who can sign in, and what they may do. */
export async function listUsers(): Promise<PublicUser[]> {
  return db.select(publicColumns).from(users).orderBy(asc(users.email));
}

export async function updateUserRole(userId: string, role: UserRole, actingUserId: string): Promise<PublicUser> {
  // An admin removing their own admin rights locks the last door behind them,
  // and the platform has no other way back in.
  if (userId === actingUserId && role !== "admin") {
    throw badRequest("You cannot remove your own admin role.");
  }
  const [updated] = await db
    .update(users)
    .set({ role, updated_at: new Date() })
    .where(eq(users.id, userId))
    .returning(publicColumns);
  if (!updated) throw notFound("That account could not be found.");
  return updated;
}

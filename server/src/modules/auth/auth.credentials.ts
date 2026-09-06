import { compare, hash } from "bcryptjs";

const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;
const MIN_PASSWORD_CHARACTERS = 8;
// bcrypt silently truncates beyond 72 bytes, so a longer password would only
// be partially checked. Reject it rather than accept a weaker guarantee.
const MAX_PASSWORD_BYTES = 72;

export function normalizeEmail(value: unknown): string {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

export function registrationError(email: string, password: string, confirmation: string): string | null {
  if (!EMAIL_PATTERN.test(email)) return "Enter a valid email address";
  if (password.length < MIN_PASSWORD_CHARACTERS) return "Password must be at least 8 characters";
  if (new TextEncoder().encode(password).length > MAX_PASSWORD_BYTES) return "Password must be 72 bytes or fewer";
  if (password !== confirmation) return "Passwords do not match";
  return null;
}

export async function hashPassword(password: string): Promise<string> {
  return hash(password, 12);
}

export async function verifyPassword(password: string, passwordHash: string): Promise<boolean> {
  return compare(password, passwordHash);
}

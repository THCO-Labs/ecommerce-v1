import type { ZodType } from "zod";
import { badRequest } from "./errors.js";

/** Parse untrusted input, turning Zod issues into a 400 with per-field messages. */
export function parseOrThrow<T>(schema: ZodType<T>, value: unknown): T {
  const result = schema.safeParse(value);
  if (result.success) return result.data;

  const fieldErrors: Record<string, string[]> = {};
  for (const issue of result.error.issues) {
    const key = issue.path.join(".") || "_";
    (fieldErrors[key] ??= []).push(issue.message);
  }
  const first = result.error.issues[0];
  throw badRequest(first?.message ?? "Invalid request", fieldErrors);
}

import assert from "node:assert/strict";
import test from "node:test";
import { hashPassword, normalizeEmail, registrationError, verifyPassword } from "./auth.credentials.js";
import { signSessionToken, verifySessionToken } from "./auth.token.js";
import { lineTotal, round2, sum } from "../../common/money.js";

// Every module under test is pure, so the suite runs without a DATABASE_URL.
const secret = "test-secret-that-is-at-least-thirty-two-bytes-long";
const userId = "9272f1f4-606d-4e7c-85dc-c9c1c44562ec";

test("registration credentials are normalized, validated, hashed, and verified", async () => {
  const email = normalizeEmail("  Shopper@Example.COM ");
  assert.equal(email, "shopper@example.com");
  assert.equal(registrationError(email, "password123", "password123"), null);

  const passwordHash = await hashPassword("password123");
  assert.notEqual(passwordHash, "password123");
  assert.equal(await verifyPassword("password123", passwordHash), true);
  assert.equal(await verifyPassword("wrong-password", passwordHash), false);
});

test("registration rejects invalid email, short passwords, and mismatched confirmation", () => {
  assert.equal(registrationError("invalid", "password123", "password123"), "Enter a valid email address");
  assert.equal(
    registrationError("shopper@example.com", "short", "short"),
    "Password must be at least 8 characters",
  );
  assert.equal(
    registrationError("shopper@example.com", "password123", "different123"),
    "Passwords do not match",
  );
});

test("JWT session tokens preserve the database user id and role", async () => {
  const token = await signSessionToken({ userId, role: "customer" }, secret);
  const payload = await verifySessionToken(token, secret);

  assert.equal(payload?.userId, userId);
  assert.equal(payload?.role, "customer");
  assert.equal(await verifySessionToken(`${token}tampered`, secret), null);
});

test("a token signed with a different secret is rejected", async () => {
  // Guards against a rotated or mismatched AUTH_SECRET silently granting sessions.
  const token = await signSessionToken({ userId, role: "admin" }, secret);
  const otherSecret = "another-secret-that-is-also-at-least-thirty-two-bytes";

  assert.equal(await verifySessionToken(token, otherSecret), null);
  assert.equal(await verifySessionToken(undefined, secret), null);
});

test("signing refuses a secret shorter than 32 bytes", async () => {
  // A short HS256 key is a deployment mistake, so it must fail loudly.
  await assert.rejects(
    () => signSessionToken({ userId, role: "customer" }, "too-short"),
    /at least 32 bytes/,
  );
});

test("every role a token can carry round-trips, and nothing else does", async () => {
  for (const role of ["customer", "staff", "admin"] as const) {
    const token = await signSessionToken({ userId, role }, secret);
    assert.equal((await verifySessionToken(token, secret))?.role, role);
  }
  // A token whose role is not one this application knows must not authenticate,
  // or a renamed role would quietly grant whatever the gate happens to allow.
  const forged = await signSessionToken({ userId, role: "superuser" as never }, secret);
  assert.equal(await verifySessionToken(forged, secret), null);
});

test("money arithmetic does not leak binary float noise into totals", () => {
  // 19.99 * 3 is 59.97000000000001 in IEEE 754; a customer must never see that.
  assert.equal(lineTotal(19.99, 3), 59.97);
  assert.equal(round2(0.1 + 0.2), 0.3);
  assert.equal(sum([19.99, 0.01, 5.5]), 25.5);
});

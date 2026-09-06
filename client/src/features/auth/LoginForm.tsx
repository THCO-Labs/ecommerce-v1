import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError } from "@/api/client";
import { routes } from "@/config/app-config";
import { isStaff, useAuth } from "@/hooks/use-auth";

export function LoginForm() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const profile = await login({ email, password });
      // Honour where they were headed; otherwise send staff to the work and
      // customers back to the shop.
      const next = searchParams.get("next");
      navigate(next || (isStaff(profile) ? routes.dashboard.root : routes.home), { replace: true });
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : "Could not sign you in. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <form data-builder-id="auth.login-form" onSubmit={submit} className="space-y-4">
      {error && (
        <p className="border-destructive/30 bg-destructive/5 text-destructive rounded-lg border p-3 text-sm">
          {error}
        </p>
      )}
      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
      </div>
      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}

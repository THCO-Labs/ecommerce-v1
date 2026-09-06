import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError } from "@/api/client";
import { routes } from "@/config/app-config";
import { useAuth } from "@/hooks/use-auth";

export function RegisterForm() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>();
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setFieldErrors(undefined);
    try {
      // Registering adopts whatever is already in the guest basket, so someone
      // who filled one before making an account does not lose it.
      await register({ email, password, confirmPassword, fullName: fullName || undefined });
      navigate(searchParams.get("next") || routes.home, { replace: true });
    } catch (cause) {
      if (cause instanceof ApiError) {
        setError(cause.message);
        setFieldErrors(cause.fieldErrors);
      } else {
        setError("Could not create your account. Please try again.");
      }
      setSubmitting(false);
    }
  }

  return (
    <form data-builder-id="auth.register-form" onSubmit={submit} className="space-y-4">
      {error && (
        <p className="border-destructive/30 bg-destructive/5 text-destructive rounded-lg border p-3 text-sm">
          {error}
        </p>
      )}
      <div className="space-y-1.5">
        <Label htmlFor="fullName">
          Full name <span className="text-muted-foreground text-xs">(optional)</span>
        </Label>
        <Input id="fullName" value={fullName} onChange={(event) => setFullName(event.target.value)} />
      </div>
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
        {fieldErrors?.email?.map((message) => (
          <p key={message} className="text-destructive text-xs">
            {message}
          </p>
        ))}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
        <p className="text-muted-foreground text-xs">At least 8 characters.</p>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="confirmPassword">Confirm password</Label>
        <Input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          required
        />
      </div>
      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting ? "Creating account…" : "Create account"}
      </Button>
    </form>
  );
}

import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BrandMark } from "@/components/brand-mark";
import { routes } from "@/config/app-config";
import { LoginForm } from "@/features/auth/LoginForm";

export default function LoginPage() {
  return (
    <div data-builder-id="auth.login" className="container grid min-h-[70vh] max-w-md place-items-center py-12">
      <Card className="w-full">
        <CardHeader className="text-center">
          <span className="bg-primary text-primary-foreground mx-auto grid size-11 place-items-center rounded-xl">
            <BrandMark className="size-8" iconClassName="size-5" />
          </span>
          <CardTitle className="mt-4">Welcome back</CardTitle>
          <CardDescription>Sign in to track orders and check out faster.</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
          <p className="text-muted-foreground mt-6 text-center text-sm">
            New here?{" "}
            <Link to={routes.auth.register} className="text-primary hover:underline">
              Create an account
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

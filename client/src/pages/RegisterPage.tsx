import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BrandMark } from "@/components/brand-mark";
import { routes } from "@/config/app-config";
import { RegisterForm } from "@/features/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <div data-builder-id="auth.register" className="container grid min-h-[70vh] max-w-md place-items-center py-12">
      <Card className="w-full">
        <CardHeader className="text-center">
          <span className="bg-primary text-primary-foreground mx-auto grid size-11 place-items-center rounded-xl">
            <BrandMark className="size-8" iconClassName="size-5" />
          </span>
          <CardTitle className="mt-4">Create your account</CardTitle>
          <CardDescription>Keep your basket, track orders, and check out faster.</CardDescription>
        </CardHeader>
        <CardContent>
          <RegisterForm />
          <p className="text-muted-foreground mt-6 text-center text-sm">
            Already have an account?{" "}
            <Link to={routes.auth.login} className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

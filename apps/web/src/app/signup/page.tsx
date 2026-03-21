"use client";

import { useState, useEffect } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { signup } from "@/lib/api";
import { auth } from "@/lib/auth";
import { Button } from "@tasksuite/ui";
import { Input } from "@tasksuite/ui";
import { Label } from "@tasksuite/ui";
import { Card } from "@tasksuite/ui";
import Link from "next/link";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (auth.isAuthenticated()) {
      if (auth.isClient()) {
        router.push("/client/dashboard");
      } else {
        router.push("/dashboard");
      }
    }
  }, [router]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    const errs: Record<string, string> = {};
    if (!companyName.trim()) errs.companyName = "Company name is required";
    if (!email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = "Enter a valid email address";
    if (!password) errs.password = "Password is required";
    else if (password.length < 6) errs.password = "Password must be at least 6 characters";
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      return;
    }
    setFieldErrors({});
    setLoading(true);

    try {
      const result = await signup(email, password, companyName, name);
      auth.login(result.access_token, result.user, false);
      router.push("/onboarding");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30">
      <Card className="w-full max-w-md p-8 shadow-medium">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight mb-1">Create your account</h1>
          <p className="text-sm text-muted-foreground">
            Get started with TaskSuite Pro — estimates, jobs, and invoices in one place.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-destructive/10 text-destructive border border-destructive/20 rounded-lg text-sm">{error}</div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="companyName">Company Name <span className="text-destructive">*</span></Label>
            <Input
              id="companyName"
              type="text"
              value={companyName}
              onChange={(event: ChangeEvent<HTMLInputElement>) => {
                setCompanyName(event.target.value);
                if (fieldErrors.companyName) setFieldErrors((prev) => ({ ...prev, companyName: "" }));
              }}
              placeholder="Acme Services"
              aria-invalid={!!fieldErrors.companyName}
            />
            {fieldErrors.companyName && <p className="text-sm text-destructive">{fieldErrors.companyName}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="name">Your Name</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                setName(event.target.value)
              }
              placeholder="John Doe"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email <span className="text-destructive">*</span></Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(event: ChangeEvent<HTMLInputElement>) => {
                setEmail(event.target.value);
                if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: "" }));
              }}
              placeholder="you@example.com"
              aria-invalid={!!fieldErrors.email}
            />
            {fieldErrors.email && <p className="text-sm text-destructive">{fieldErrors.email}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password <span className="text-destructive">*</span></Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(event: ChangeEvent<HTMLInputElement>) => {
                setPassword(event.target.value);
                if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: "" }));
              }}
              placeholder="At least 6 characters"
              aria-invalid={!!fieldErrors.password}
            />
            {fieldErrors.password && <p className="text-sm text-destructive">{fieldErrors.password}</p>}
          </div>
          <Button type="submit" className="w-full mt-2" disabled={loading}>
            {loading ? "Creating account..." : "Create account"}
          </Button>
        </form>
        <div className="mt-6 text-center text-sm space-y-2">
          <div>
            <span className="text-muted-foreground">Already have an account? </span>
            <Link href="/login" className="text-primary font-medium hover:underline">
              Sign in
            </Link>
          </div>
          <div>
            <Link href="/client/login" className="text-muted-foreground hover:text-primary transition-colors text-xs">
              Client Portal Login →
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}


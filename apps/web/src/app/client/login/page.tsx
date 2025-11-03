"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { clientLogin } from "@/lib/api";
import { auth } from "@/lib/auth";
import { Button } from "@tasksuite/ui";
import { Input } from "@tasksuite/ui";
import { Label } from "@tasksuite/ui";
import { Card } from "@tasksuite/ui";

export default function ClientLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      console.log("Attempting login for:", email);
      const result = await clientLogin(email, password);
      console.log("Login successful:", result);
      auth.login(result.access_token, result.client, true);
      router.push("/client/dashboard");
      router.refresh();
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md p-6">
        <h1 className="text-2xl font-bold mb-6">Client Portal Login</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-100 text-red-700 rounded">{error}</div>
          )}
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>
        <div className="mt-4 text-center text-sm">
          <a href="/login" className="text-blue-600 hover:underline">
            Company Login
          </a>
        </div>
        <div className="mt-2 text-center text-xs text-gray-500">
          Test: john.smith@example.com / password123
        </div>
      </Card>
    </div>
  );
}


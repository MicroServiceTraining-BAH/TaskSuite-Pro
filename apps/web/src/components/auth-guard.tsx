"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { auth } from "@/lib/auth";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Wait for client-side hydration
    if (typeof window === "undefined") return;

    const checkAuth = () => {
      const isAuth = auth.isAuthenticated();
      const isLoginPage = pathname?.startsWith("/login") || pathname?.startsWith("/client/login");

      // Allow access to login pages without auth
      if (isLoginPage) {
        // If already authenticated, redirect to appropriate dashboard
        if (isAuth) {
          if (auth.isClient()) {
            router.push("/client/dashboard");
          } else {
            router.push("/dashboard");
          }
        }
        setIsChecking(false);
        return;
      }

      // Protect all other routes
      if (!isAuth) {
        // Determine which login page to redirect to based on route
        if (pathname?.startsWith("/client")) {
          router.push("/client/login");
        } else {
          router.push("/login");
        }
      } else {
        setIsChecking(false);
      }
    };

    // Small delay to ensure localStorage is available
    setTimeout(checkAuth, 0);
  }, [pathname, router]);

  // Show loading only for protected routes while checking
  const isLoginPage = pathname?.startsWith("/login") || pathname?.startsWith("/client/login");
  if (isChecking && !isLoginPage) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  return <>{children}</>;
}


"use client";

import { useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { auth } from "@/lib/auth";
import { isOnboardingComplete } from "@/lib/onboarding";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const redirectedRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const isAuth = auth.isAuthenticated();
    const isLoginPage = pathname?.startsWith("/login") || pathname?.startsWith("/client/login");
    const isOnboardingPage = pathname?.startsWith("/onboarding");
    const isSignupPage = pathname?.startsWith("/signup");

    if (isLoginPage || isOnboardingPage || isSignupPage) {
      if (isAuth && (isLoginPage || isSignupPage)) {
        if (auth.isClient()) {
          router.replace("/client/dashboard");
        } else if (!isOnboardingComplete()) {
          router.replace("/onboarding");
        } else {
          router.replace("/dashboard");
        }
      }
      return;
    }

    if (!isAuth) {
      redirectedRef.current = true;
      if (pathname?.startsWith("/client")) {
        router.replace("/client/login");
      } else {
        router.replace("/login");
      }
      return;
    }

    if (!auth.isClient() && !isOnboardingComplete() && !isOnboardingPage) {
      router.replace("/onboarding");
      return;
    }
  }, [pathname, router]);

  // Render children immediately — no loading overlay, no blank flash.
  // Auth redirect happens via useEffect; unauthenticated users briefly see
  // the page but API calls will 401 before any real data renders.
  return <>{children}</>;
}

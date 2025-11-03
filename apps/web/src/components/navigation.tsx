"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { auth } from "@/lib/auth";
import { Button } from "@tasksuite/ui";

export function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const user = auth.getUser();
  const isClient = auth.isClient();

  // Don't show navigation on login pages
  if (pathname?.startsWith("/login") || pathname?.startsWith("/client/login")) {
    return null;
  }

  // Client portal navigation
  if (isClient) {
    const clientLinks = [
      { href: "/client/dashboard", label: "Dashboard" },
      { href: "/client/estimates", label: "My Estimates" },
      { href: "/client/jobs", label: "My Jobs" },
      { href: "/client/appointments", label: "Appointments" },
      { href: "/client/invoices", label: "Invoices" },
    ];

    return (
      <nav className="border-b">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-6">
            <Link href="/client/dashboard" className="text-xl font-bold">
              TaskSuite Pro - Client Portal
            </Link>
            <div className="flex space-x-4">
              {clientLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {user && "name" in user && (
              <span className="text-sm text-muted-foreground">{user.name}</span>
            )}
            <Button variant="outline" size="sm" onClick={() => {
              auth.logout();
              router.push("/client/login");
              router.refresh();
            }}>
              Logout
            </Button>
          </div>
        </div>
      </nav>
    );
  }

  // Company navigation
  const links = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/clients", label: "Clients" },
    { href: "/estimates", label: "Estimates" },
    { href: "/jobs", label: "Jobs" },
    { href: "/schedule", label: "Schedule" },
    { href: "/invoices", label: "Invoices" },
    { href: "/settings", label: "Settings" },
  ];

  return (
    <nav className="border-b">
      <div className="container mx-auto flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-6">
          <Link href="/dashboard" className="text-xl font-bold">
            TaskSuite Pro
          </Link>
          <div className="flex space-x-4">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex items-center space-x-4">
          {user && "name" in user && (
            <span className="text-sm text-muted-foreground">{user.name}</span>
          )}
          <Button variant="outline" size="sm" onClick={() => {
            auth.logout();
            router.push("/login");
            router.refresh();
          }}>
            Logout
          </Button>
        </div>
      </div>
    </nav>
  );
}


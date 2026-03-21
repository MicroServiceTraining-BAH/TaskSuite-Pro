"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { auth } from "@/lib/auth";
import { getProfile } from "@/lib/api";
import { useLanguage } from "@/components/language-provider";
import {
  Menu,
  X,
  LayoutDashboard,
  Users,
  ClipboardList,
  Briefcase,
  Calendar,
  Receipt,
  DollarSign,
  BarChart2,
  LayoutTemplate,
  Settings,
  LogOut,
  ChevronRight,
  BookOpen,
  Layers,
} from "lucide-react";

const SIDEBAR_WIDTH = 240;

export function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [companyName, setCompanyName] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    setMounted(true);
    const currentUser = auth.getUser();
    setUser(currentUser);
    if (currentUser && "companyName" in currentUser && currentUser.companyName) {
      setCompanyName(currentUser.companyName);
    } else if (auth.isAuthenticated()) {
      getProfile()
        .then((profile: any) => {
          if (profile?.companyName) {
            setCompanyName(profile.companyName);
            if (currentUser) {
              auth.setUser({ ...currentUser, companyName: profile.companyName });
              setUser({ ...currentUser, companyName: profile.companyName });
            }
          }
        })
        .catch(() => {});
    }
  }, []);

  const isClient = mounted ? auth.isClient() : false;

  const hiddenRoutes = ["/login", "/client/login", "/onboarding", "/signup"];
  if (hiddenRoutes.some((r) => pathname?.startsWith(r))) return null;

  const clientLinks = [
    { href: "/client/dashboard", label: t("nav.dashboard"), icon: LayoutDashboard },
    { href: "/client/estimates", label: t("nav.estimates"), icon: ClipboardList },
    { href: "/client/jobs", label: t("nav.jobs"), icon: Briefcase },
    { href: "/client/appointments", label: t("nav.schedule"), icon: Calendar },
    { href: "/client/invoices", label: t("nav.invoices"), icon: Receipt },
  ];

  const adminLinks = [
    { href: "/dashboard",              label: t("nav.dashboard"),      icon: LayoutDashboard },
    { href: "/clients",                label: t("nav.clients"),        icon: Users },
    { href: "/estimates",              label: t("nav.estimates"),      icon: ClipboardList },
    { href: "/jobs",                   label: t("nav.jobs"),           icon: Briefcase },
    { href: "/schedule",               label: t("nav.schedule"),       icon: Calendar },
    { href: "/invoices",               label: t("nav.invoices"),       icon: Receipt },
    { href: "/expenses",               label: t("nav.expenses"),       icon: DollarSign },
    { href: "/accounts",               label: "Accounts",              icon: BookOpen },
    { href: "/reports",                label: t("nav.reports"),        icon: BarChart2 },
    { href: "/settings/service-types", label: "Service Types",         icon: Layers },
    { href: "/settings/templates",     label: t("nav.templates"),      icon: LayoutTemplate },
    { href: "/settings",               label: t("nav.settings"),       icon: Settings },
  ];

  const links = isClient ? clientLinks : adminLinks;
  const homeHref = isClient ? "/client/dashboard" : "/dashboard";
  const logoutHref = isClient ? "/client/login" : "/login";

  function isLinkActive(href: string) {
    if (href === "/settings/service-types") return pathname?.startsWith("/settings/service-types") ?? false;
    if (href === "/settings/templates") return pathname?.startsWith("/settings/templates") ?? false;
    if (href === "/settings") return pathname === "/settings";
    return pathname === href;
  }

  function handleLogout() {
    auth.logout();
    router.push(logoutHref);
    router.refresh();
  }

  const SidebarContent = () => (
    <div
      className="flex flex-col h-full"
      style={{ background: "hsl(var(--sidebar-bg))" }}
    >
      {/* Logo / Brand */}
      <div
        className="px-5 py-5 flex flex-col gap-0.5"
        style={{ borderBottom: "1px solid hsl(var(--sidebar-border))" }}
      >
        <Link
          href={homeHref}
          onClick={() => setMobileMenuOpen(false)}
          className="block text-white font-display font-bold text-[17px] tracking-tight hover:opacity-90"
          style={{ textDecoration: "none" }}
        >
          TaskSuite Pro
        </Link>
        {companyName && (
          <p
            className="text-[11px] font-medium truncate"
            style={{ color: "hsl(var(--sidebar-fg))" }}
          >
            {companyName}
          </p>
        )}
        {!companyName && isClient && (
          <p className="text-[11px] font-medium" style={{ color: "hsl(var(--sidebar-fg))" }}>
            Client Portal
          </p>
        )}
      </div>

      {/* Nav links */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {links.map((link) => {
          const Icon = link.icon;
          const active = isLinkActive(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              suppressHydrationWarning
              className={`sidebar-link${active ? " active" : ""}`}
              style={{ textDecoration: "none" }}
            >
              <Icon
                className="shrink-0"
                size={15}
                style={{
                  color: active
                    ? "hsl(var(--sidebar-fg-active))"
                    : "hsl(var(--sidebar-fg))",
                  opacity: active ? 1 : 0.75,
                }}
              />
              <span>{link.label}</span>
              {active && (
                <ChevronRight
                  size={12}
                  className="ml-auto opacity-60"
                  style={{ color: "hsl(var(--sidebar-fg-active))" }}
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div
        className="px-3 py-4"
        style={{ borderTop: "1px solid hsl(var(--sidebar-border))" }}
      >
        {mounted && user && (
          <div className="px-3 py-2 mb-2">
            <p
              className="text-[11px] font-semibold uppercase tracking-wider mb-0.5"
              style={{ color: "hsl(var(--sidebar-fg))", opacity: 0.5 }}
            >
              Signed in as
            </p>
            <p
              className="text-[12px] font-medium truncate"
              style={{ color: "hsl(var(--sidebar-fg))" }}
            >
              {"name" in user ? user.name : user.email}
            </p>
          </div>
        )}

        <button
          onClick={handleLogout}
          suppressHydrationWarning
          className="sidebar-link w-full text-left"
          style={{ background: "none", border: "none", cursor: "pointer" }}
        >
          <LogOut size={15} style={{ color: "hsl(var(--sidebar-fg))", opacity: 0.7 }} />
          <span>{t("nav.logout")}</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="fixed top-4 left-4 z-[60] lg:hidden rounded-lg p-2"
        style={{
          background: "hsl(var(--sidebar-bg))",
          color: "white",
          border: "1px solid hsl(var(--sidebar-border))",
        }}
        aria-label="Toggle navigation"
      >
        {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
      </button>

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-[55] lg:hidden"
          style={{ background: "rgba(0,0,0,0.45)" }}
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen z-[60] overflow-hidden
          transition-transform duration-300 ease-in-out
          ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
        style={{ width: `${SIDEBAR_WIDTH}px` }}
      >
        <SidebarContent />
      </aside>
    </>
  );
}

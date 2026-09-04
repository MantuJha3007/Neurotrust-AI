"use client";

import {
  Activity,
  Bot,
  BriefcaseBusiness,
  ChevronDown,
  CircleDollarSign,
  LayoutDashboard,
  Menu,
  Settings2,
  ShieldCheck,
  TrendingUp,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

interface NavigationItem {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
}

const NAVIGATION: NavigationItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/portfolio",
    label: "Portfolio",
    icon: BriefcaseBusiness,
  },
  {
    href: "/trades",
    label: "Trading",
    icon: TrendingUp,
  },
  {
    href: "/agent",
    label: "AI Agent",
    icon: Bot,
  },
];

const SYSTEM_NAVIGATION: NavigationItem[] = [
  {
    href: "/risk",
    label: "Risk Controls",
    icon: ShieldCheck,
  },
  {
    href: "/settings",
    label: "Settings",
    icon: Settings2,
  },
];

function isActivePath(pathname: string, href: string): boolean {
  if (href === "/dashboard") {
    return pathname === "/dashboard";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Mobile Header */}
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-slate-800 bg-slate-950/95 px-4 backdrop-blur lg:hidden">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-amber-500/30 bg-amber-500/10">
            <Activity className="h-4 w-4 text-amber-400" />
          </div>

          <span className="text-sm font-semibold tracking-tight">
            AI Trading Agent
          </span>
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen((current) => !current)}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-slate-400"
          aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? (
            <X className="h-4 w-4" />
          ) : (
            <Menu className="h-4 w-4" />
          )}
        </button>
      </header>

      {/* Mobile Navigation */}
      {mobileOpen && (
        <div className="fixed inset-x-0 top-14 z-30 border-b border-slate-800 bg-slate-950 px-3 py-3 lg:hidden">
          <nav className="space-y-1">
            {NAVIGATION.map((item) => {
              const Icon = item.icon;
              const active = isActivePath(pathname, item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-medium transition-colors ${
                    active
                      ? "bg-amber-500/10 text-amber-400"
                      : "text-slate-500 hover:bg-slate-900 hover:text-slate-300"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}

            <div className="pt-2 pb-1 px-3 text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-700">
              System
            </div>

            {SYSTEM_NAVIGATION.map((item) => {
              const Icon = item.icon;
              const active = isActivePath(pathname, item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-medium transition-colors ${
                    active
                      ? "bg-amber-500/10 text-amber-400"
                      : "text-slate-500 hover:bg-slate-900 hover:text-slate-300"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}

      <div className="flex min-h-screen">
        {/* Desktop Sidebar */}
        <aside className="hidden w-60 shrink-0 border-r border-slate-800 bg-slate-950 lg:flex lg:flex-col">
          {/* Brand */}
          <div className="flex h-16 items-center gap-3 border-b border-slate-800 px-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-amber-500/30 bg-amber-500/10">
              <Activity className="h-5 w-5 text-amber-400" />
            </div>

            <div>
              <div className="text-sm font-semibold tracking-tight text-slate-100">
                AI Trading Agent
              </div>

              <div className="mt-0.5 font-mono text-[9px] uppercase tracking-wider text-slate-600">
                Autonomous Terminal
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-5">
            <div className="mb-3 px-2 text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-700">
              Workspace
            </div>

            <div className="space-y-1">
              {NAVIGATION.map((item) => {
                const Icon = item.icon;
                const active = isActivePath(pathname, item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors ${
                      active
                        ? "border-amber-500/20 bg-amber-500/10 text-amber-400"
                        : "border-transparent text-slate-500 hover:bg-slate-900 hover:text-slate-300"
                    }`}
                  >
                    <Icon
                      className={`h-4 w-4 ${
                        active
                          ? "text-amber-400"
                          : "text-slate-600 group-hover:text-slate-400"
                      }`}
                    />

                    <span className="text-xs font-medium">
                      {item.label}
                    </span>

                    {active && (
                      <span className="ml-auto h-1.5 w-1.5 rounded-full bg-amber-400" />
                    )}
                  </Link>
                );
              })}
            </div>

            <div className="mb-3 mt-8 px-2 text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-700">
              System
            </div>

            <div className="space-y-1">
              {SYSTEM_NAVIGATION.map((item) => {
                const Icon = item.icon;
                const active = isActivePath(pathname, item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors ${
                      active
                        ? "border-amber-500/20 bg-amber-500/10 text-amber-400"
                        : "border-transparent text-slate-500 hover:bg-slate-900 hover:text-slate-300"
                    }`}
                  >
                    <Icon
                      className={`h-4 w-4 ${
                        active
                          ? "text-amber-400"
                          : "text-slate-600 group-hover:text-slate-400"
                      }`}
                    />

                    <span className="text-xs font-medium">
                      {item.label}
                    </span>

                    {active && (
                      <span className="ml-auto h-1.5 w-1.5 rounded-full bg-amber-400" />
                    )}
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Account */}
          <div className="border-t border-slate-800 p-3">
            <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />

                  <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
                    Connected
                  </span>
                </div>

                <ChevronDown className="h-3 w-3 text-slate-600" />
              </div>

              <div className="mt-3 flex items-center gap-2">
                <CircleDollarSign className="h-4 w-4 text-slate-500" />

                <div>
                  <div className="text-xs font-medium text-slate-300">
                    Paper Account
                  </div>

                  <div className="mt-0.5 font-mono text-[9px] text-slate-600">
                    SIM-TRADING
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Area */}
        <div className="min-w-0 flex-1">
          {/* Desktop Top Bar */}
          <header className="hidden h-16 items-center justify-between border-b border-slate-800 bg-slate-950/80 px-6 backdrop-blur lg:flex">
            <div className="flex items-center gap-5">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

                <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
                  Market
                </span>

                <span className="text-xs font-medium text-emerald-400">
                  OPEN
                </span>
              </div>

              <div className="h-4 w-px bg-slate-800" />

              <div className="font-mono text-[10px] text-slate-600">
                US EQUITIES · OPTIONS
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

                <span className="text-[10px] uppercase tracking-wider text-slate-500">
                  Data Feed
                </span>

                <span className="font-mono text-[10px] text-slate-400">
                  LIVE
                </span>
              </div>

              <div className="h-4 w-px bg-slate-800" />

              <div className="font-mono text-[10px] text-slate-600">
                PAPER MODE
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="min-h-[calc(100vh-56px)] bg-slate-950 p-4 sm:p-5 lg:min-h-[calc(100vh-64px)] lg:p-6">
            <div className="mx-auto w-full max-w-[1600px]">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
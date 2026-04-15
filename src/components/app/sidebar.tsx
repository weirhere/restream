"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Radio,
  Tv2,
  Film,
  Sparkles,
  Users,
  Settings,
  LifeBuoy,
} from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

type NavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
};

const primary: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Go Live", href: "/stream", icon: Radio },
  { label: "Destinations", href: "/destinations", icon: Tv2 },
  { label: "Recordings", href: "/recordings", icon: Film },
  { label: "Studio", href: "/studio", icon: Sparkles, badge: "Beta" },
];

const secondary: NavItem[] = [
  { label: "Team", href: "/team", icon: Users },
  { label: "Settings", href: "/settings", icon: Settings },
  { label: "Support", href: "/support", icon: LifeBuoy },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "flex h-full w-64 shrink-0 flex-col",
        "border-r border-hairline bg-white/[0.015] backdrop-blur-xl",
        "shadow-[inset_-1px_0_0_0_rgba(255,255,255,0.02)]"
      )}
    >
      {/* brand */}
      <div className="flex items-center gap-2.5 px-5 pt-5 pb-6">
        <LogoMark />
        <div className="flex flex-col leading-tight">
          <span className="text-[0.9375rem] font-semibold tracking-tight text-fg-primary">
            Restream
          </span>
          <span className="text-[0.6875rem] font-medium uppercase tracking-[0.12em] text-fg-subtle">
            Playground
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-4">
        <NavSection label="Workspace" items={primary} pathname={pathname} />
        <NavSection
          label="Account"
          items={secondary}
          pathname={pathname}
          className="mt-3"
        />
      </div>

      {/* user card */}
      <div className="border-t border-hairline p-3">
        <div className="flex items-center gap-3 rounded-[var(--radius-md)] bg-white/[0.03] border border-hairline px-3 py-2.5 hover:bg-white/[0.06] transition-colors cursor-pointer">
          <Avatar size="sm">
            <AvatarFallback>AW</AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0 leading-tight">
            <span className="truncate text-[0.8125rem] font-medium text-fg-primary">
              Andy Weir
            </span>
            <span className="truncate text-[0.6875rem] text-fg-subtle">
              andy@restream.dev
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}

function NavSection({
  label,
  items,
  pathname,
  className,
}: {
  label: string;
  items: NavItem[];
  pathname: string;
  className?: string;
}) {
  return (
    <div className={cn("py-1", className)}>
      <div className="px-3 py-2 text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-fg-subtle">
        {label}
      </div>
      <ul className="flex flex-col gap-0.5">
        {items.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <li key={item.href} className="relative">
              {active && (
                <motion.span
                  layoutId="nav-active-bar"
                  className="absolute -left-3 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-r-full bg-gradient-brand shadow-[0_0_8px_rgba(124,92,255,0.8)]"
                  transition={{
                    type: "spring",
                    stiffness: 420,
                    damping: 32,
                  }}
                />
              )}
              <Link
                href={item.href}
                className={cn(
                  "group/nav flex items-center gap-2.5 rounded-[var(--radius-md)] px-3 py-2 text-[0.8125rem] font-medium transition-colors",
                  active
                    ? "bg-white/[0.05] text-fg-primary"
                    : "text-fg-muted hover:text-fg-primary hover:bg-white/[0.03]"
                )}
              >
                <Icon
                  className={cn(
                    "size-4 transition-colors",
                    active ? "text-brand-400" : "text-fg-subtle group-hover/nav:text-fg-muted"
                  )}
                />
                <span className="flex-1 truncate">{item.label}</span>
                {item.badge && (
                  <Badge variant="brand" size="sm">
                    {item.badge}
                  </Badge>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function LogoMark() {
  return (
    <div
      className={cn(
        "relative flex size-8 items-center justify-center rounded-[10px]",
        "bg-gradient-brand",
        "shadow-[0_0_0_1px_rgba(124,92,255,0.3),0_8px_24px_-6px_rgba(124,92,255,0.6)]"
      )}
      aria-hidden
    >
      <div className="absolute inset-[1px] rounded-[9px] bg-gradient-to-br from-white/15 to-transparent" />
      <svg
        viewBox="0 0 16 16"
        className="relative size-4 text-white"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx={8} cy={8} r={2} fill="currentColor" />
        <path d="M3.5 4.5a6 6 0 0 1 9 0" />
        <path d="M2 2.5a9 9 0 0 1 12 0" />
      </svg>
    </div>
  );
}

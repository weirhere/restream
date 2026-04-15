"use client";

import * as React from "react";
import Link from "next/link";
import { Bell, Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarBadge } from "@/components/ui/avatar";

type TopBarProps = {
  /** Page title shown in the breadcrumb. Defaults to "Streams". */
  title?: string;
  /** Optional subhead under the title (visible at lg+). */
  subhead?: string;
};

export function TopBar({ title = "Streams", subhead }: TopBarProps) {
  return (
    <header
      className="sticky top-0 z-20 flex items-center gap-4 border-b border-hairline bg-bg-base/70 backdrop-blur-xl px-4 py-4"
    >
      <div className="flex items-center gap-3 min-w-0">
        <span className="text-[0.8125rem] text-fg-subtle">Workspace</span>
        <span className="text-fg-subtle/60">/</span>
        <div className="flex flex-col leading-tight min-w-0">
          <span className="text-[0.8125rem] font-medium text-fg-primary truncate">
            {title}
          </span>
          {subhead && (
            <span className="text-[0.6875rem] text-fg-subtle truncate hidden lg:inline">
              {subhead}
            </span>
          )}
        </div>
      </div>

      <div className="relative ml-auto hidden md:block max-w-xs w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-fg-subtle" />
        <Input
          type="search"
          placeholder="Search streams, destinations…"
          className="pl-9 h-9"
        />
        <kbd className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 hidden lg:inline-flex items-center h-5 px-1.5 rounded border border-hairline bg-white/[0.04] text-[0.625rem] font-medium text-fg-subtle">
          ⌘K
        </kbd>
      </div>

      <Button variant="ghost" size="icon-sm" aria-label="Notifications">
        <Bell />
      </Button>

      <Link
        href="/stream/new"
        className="inline-flex items-center gap-1.5 h-8 px-3 rounded-[var(--radius-md)] text-[0.8125rem] font-medium bg-brand-500 text-white hover:bg-brand-400 transition-colors shadow-[0_1px_0_0_rgba(255,255,255,0.12)_inset,0_8px_18px_-8px_rgba(124,92,255,0.55)]"
      >
        <Plus className="size-3.5" />
        New stream
      </Link>

      <Avatar size="sm" className="relative">
        <AvatarFallback>AW</AvatarFallback>
        <AvatarBadge />
      </Avatar>
    </header>
  );
}

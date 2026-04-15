"use client";

import * as React from "react";
import { Bell, Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarBadge } from "@/components/ui/avatar";
import { LiveIndicator, type LiveState } from "@/components/app/live-indicator";

export function TopBar({ liveState }: { liveState?: LiveState }) {
  return (
    <header
      className="sticky top-0 z-20 flex items-center gap-4 border-b border-hairline bg-bg-base/70 backdrop-blur-xl px-6 py-6"
    >
      <div className="flex items-center gap-3 min-w-0">
        <span className="text-[0.8125rem] text-fg-subtle">Workspace</span>
        <span className="text-fg-subtle/60">/</span>
        <div className="flex flex-col leading-tight min-w-0">
          <span className="text-[0.8125rem] font-medium text-fg-primary truncate">
            Go Live
          </span>
          <span className="text-[0.6875rem] text-fg-subtle truncate hidden lg:inline">
            Broadcast one stream to multiple platforms
          </span>
        </div>
      </div>

      <div className="relative ml-auto hidden md:block max-w-xs w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-fg-subtle" />
        <Input
          type="search"
          placeholder="Search destinations, streams…"
          className="pl-9 h-9"
        />
        <kbd className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 hidden lg:inline-flex items-center h-5 px-1.5 rounded border border-hairline bg-white/[0.04] text-[0.625rem] font-medium text-fg-subtle">
          ⌘K
        </kbd>
      </div>

      <LiveIndicator state={liveState} />

      <Button variant="ghost" size="icon-sm" aria-label="Notifications">
        <Bell />
      </Button>

      <Button variant="default" size="sm">
        <Plus />
        New stream
      </Button>

      <Avatar size="sm" className="relative">
        <AvatarFallback>AW</AvatarFallback>
        <AvatarBadge />
      </Avatar>
    </header>
  );
}

import * as React from "react";
import { cn } from "@/lib/utils";

export type LiveState = "offline" | "starting" | "live";

type LiveIndicatorProps = {
  state?: LiveState;
  className?: string;
};

export function LiveIndicator({
  state = "offline",
  className,
}: LiveIndicatorProps) {
  if (state === "live") {
    return (
      <div
        className={cn(
          "inline-flex items-center gap-2 rounded-full border px-2.5 h-7",
          "text-[0.6875rem] font-semibold uppercase tracking-[0.08em]",
          "border-live/40 bg-live/10 text-live shadow-[0_0_24px_-8px_rgba(255,71,87,0.7)]",
          className
        )}
        role="status"
        aria-label="Stream is live"
      >
        <span className="live-dot" aria-hidden />
        <span>Live</span>
      </div>
    );
  }

  if (state === "starting") {
    return (
      <div
        className={cn(
          "inline-flex items-center gap-2 rounded-full border px-2.5 h-7",
          "text-[0.6875rem] font-semibold uppercase tracking-[0.08em]",
          "border-warn/40 bg-warn/10 text-warn",
          className
        )}
        role="status"
        aria-label="Starting stream"
      >
        <span
          className="size-2 rounded-full bg-warn animate-pulse"
          style={{ boxShadow: "0 0 10px rgba(255,181,71,0.7)" }}
          aria-hidden
        />
        <span>Starting</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-2.5 h-7",
        "text-[0.6875rem] font-semibold uppercase tracking-[0.08em]",
        "border-hairline bg-white/[0.04] text-fg-subtle",
        className
      )}
      role="status"
      aria-label="Stream offline"
    >
      <span className="size-2 rounded-full bg-fg-subtle/60" aria-hidden />
      <span>Offline</span>
    </div>
  );
}

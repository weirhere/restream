import * as React from "react";
import { cn } from "@/lib/utils";

type LiveIndicatorProps = {
  state?: "offline" | "live";
  className?: string;
};

export function LiveIndicator({
  state = "offline",
  className,
}: LiveIndicatorProps) {
  const isLive = state === "live";
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-2.5 h-7",
        "text-[0.6875rem] font-semibold uppercase tracking-[0.08em]",
        "transition-colors",
        isLive
          ? "border-live/40 bg-live/10 text-live shadow-[0_0_24px_-8px_rgba(255,71,87,0.7)]"
          : "border-hairline bg-white/[0.04] text-fg-subtle",
        className
      )}
      role="status"
      aria-label={isLive ? "Stream is live" : "Stream offline"}
    >
      {isLive ? (
        <span className="live-dot" aria-hidden />
      ) : (
        <span
          className="size-2 rounded-full bg-fg-subtle/60"
          aria-hidden
        />
      )}
      <span>{isLive ? "Live" : "Offline"}</span>
    </div>
  );
}

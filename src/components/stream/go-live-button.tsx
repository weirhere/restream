"use client";

import * as React from "react";
import { motion } from "motion/react";
import { Radio } from "lucide-react";
import { cn } from "@/lib/utils";

type GoLiveButtonProps = {
  armed: boolean;
  live: boolean;
  disabled?: boolean;
  destinationCount: number;
  onClick?: () => void;
};

export function GoLiveButton({
  armed,
  live,
  disabled = false,
  destinationCount,
  onClick,
}: GoLiveButtonProps) {
  const label = live
    ? "End stream"
    : armed
      ? "Go live"
      : "Select destination to start";

  return (
    <div className="flex flex-col items-stretch gap-2">
      <motion.button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={cn(
          "relative overflow-hidden rounded-[var(--radius-lg)] px-8 py-4",
          "text-base font-semibold tracking-tight text-white",
          "transition-all duration-200 ease-out",
          "border border-white/10",
          "disabled:cursor-not-allowed disabled:opacity-60",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base",
          live
            ? "bg-gradient-to-br from-live/90 to-[#d63747]"
            : "bg-gradient-brand"
        )}
        animate={
          armed && !live
            ? {
                boxShadow: [
                  "0 0 0 1px rgba(124,92,255,0.3), 0 12px 40px -8px rgba(124,92,255,0.55), 0 0 0 0 rgba(124,92,255,0.4)",
                  "0 0 0 1px rgba(124,92,255,0.45), 0 16px 56px -4px rgba(124,92,255,0.75), 0 0 0 14px rgba(124,92,255,0)",
                ],
                scale: [1, 1.012, 1],
              }
            : live
              ? {
                  boxShadow: [
                    "0 0 0 1px rgba(255,71,87,0.35), 0 10px 36px -6px rgba(255,71,87,0.55), 0 0 0 0 rgba(255,71,87,0.4)",
                    "0 0 0 1px rgba(255,71,87,0.5), 0 14px 50px -4px rgba(255,71,87,0.75), 0 0 0 12px rgba(255,71,87,0)",
                  ],
                }
              : {
                  boxShadow:
                    "0 0 0 1px rgba(124,92,255,0.15), 0 6px 20px -6px rgba(124,92,255,0.35)",
                  scale: 1,
                }
        }
        transition={{
          duration: 1.8,
          repeat: armed || live ? Infinity : 0,
          repeatType: "loop",
          ease: "easeInOut",
        }}
        whileHover={!disabled ? { y: -1 } : undefined}
        whileTap={!disabled ? { y: 0, scale: 0.99 } : undefined}
      >
        {/* subtle top sheen */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.22),transparent_45%)]"
        />
        <span className="relative inline-flex items-center gap-2.5">
          {live ? (
            <span className="live-dot" aria-hidden />
          ) : (
            <Radio className="size-5" />
          )}
          {label}
        </span>
      </motion.button>

      <div className="text-center text-[0.75rem] text-fg-subtle">
        {live
          ? `Streaming to ${destinationCount} ${destinationCount === 1 ? "destination" : "destinations"}`
          : armed
            ? `Ready to broadcast to ${destinationCount} ${destinationCount === 1 ? "destination" : "destinations"}`
            : "Enable at least one destination to arm the stream"}
      </div>
    </div>
  );
}

"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Radio, Square, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type StreamPhase = "offline" | "counting" | "live";

type GoLiveButtonProps = {
  phase: StreamPhase;
  countdownValue?: number; // 3 | 2 | 1 when phase === "counting"
  destinationCount: number;
  overBudget?: boolean;
  onStart: () => void;
  onCancel: () => void;
  onEnd: () => void;
  size?: "default" | "lg";
};

export function GoLiveButton({
  phase,
  countdownValue = 3,
  destinationCount,
  overBudget = false,
  onStart,
  onCancel,
  onEnd,
  size = "default",
}: GoLiveButtonProps) {
  const disabled = phase === "offline" && destinationCount === 0;

  const handleClick = () => {
    if (phase === "offline") onStart();
    else if (phase === "live") onEnd();
    else if (phase === "counting") onCancel();
  };

  const label =
    phase === "live"
      ? "End stream"
      : phase === "counting"
        ? "Cancel"
        : destinationCount > 0
          ? `Go live to ${destinationCount}`
          : "Select destination";

  // large (lg) — used in the pre-flight summary
  const isLg = size === "lg";

  return (
    <motion.button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      layout
      className={cn(
        "relative overflow-hidden select-none",
        "rounded-[var(--radius-lg)]",
        "text-base font-semibold tracking-tight text-white",
        "transition-colors duration-200 ease-out",
        "border border-white/10",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base",
        isLg ? "min-w-[200px] h-14 px-7" : "min-w-[168px] h-11 px-5 text-sm",
        phase === "live"
          ? "bg-gradient-to-br from-live/90 to-[#d63747]"
          : phase === "counting"
            ? "bg-white/[0.04] border-hairline-strong text-fg-primary"
            : overBudget && destinationCount > 0
              ? "bg-gradient-to-br from-warn/90 to-[#e09a2e] text-[#1b1500]"
              : "bg-gradient-brand"
      )}
      animate={
        phase === "offline" && destinationCount > 0 && !overBudget
          ? {
              boxShadow: [
                "0 0 0 1px rgba(124,92,255,0.25), 0 12px 40px -8px rgba(124,92,255,0.55), 0 0 0 0 rgba(124,92,255,0.4)",
                "0 0 0 1px rgba(124,92,255,0.45), 0 16px 56px -4px rgba(124,92,255,0.75), 0 0 0 14px rgba(124,92,255,0)",
              ],
              scale: [1, 1.012, 1],
            }
          : phase === "live"
            ? {
                boxShadow: [
                  "0 0 0 1px rgba(255,71,87,0.35), 0 10px 36px -6px rgba(255,71,87,0.55), 0 0 0 0 rgba(255,71,87,0.4)",
                  "0 0 0 1px rgba(255,71,87,0.5), 0 14px 50px -4px rgba(255,71,87,0.75), 0 0 0 12px rgba(255,71,87,0)",
                ],
              }
            : phase === "offline" && overBudget
              ? {
                  boxShadow:
                    "0 0 0 1px rgba(255,181,71,0.35), 0 8px 24px -6px rgba(255,181,71,0.45)",
                  scale: 1,
                }
              : {
                  boxShadow: "0 0 0 1px rgba(255,255,255,0.08), 0 4px 16px -4px rgba(0,0,0,0.4)",
                  scale: 1,
                }
      }
      transition={{
        duration: 1.8,
        repeat:
          (phase === "offline" && destinationCount > 0 && !overBudget) ||
          phase === "live"
            ? Infinity
            : 0,
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
      <span className="relative inline-flex items-center justify-center gap-2.5 w-full">
        <AnimatePresence mode="wait" initial={false}>
          {phase === "counting" ? (
            <motion.span
              key={`count-${countdownValue}`}
              initial={{ opacity: 0, scale: 1.4 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="inline-flex items-center gap-2.5 tabular-nums"
            >
              <X className="size-4 opacity-70" aria-hidden />
              <span className="font-mono text-lg leading-none">
                {countdownValue}
              </span>
              <span className="opacity-70 text-[0.8125rem]">
                · tap to cancel
              </span>
            </motion.span>
          ) : phase === "live" ? (
            <motion.span
              key="live"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
              className="inline-flex items-center gap-2"
            >
              <Square className="size-3.5 fill-white" aria-hidden />
              {label}
            </motion.span>
          ) : (
            <motion.span
              key="offline"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
              className="inline-flex items-center gap-2"
            >
              <Radio className={cn(isLg ? "size-5" : "size-4")} aria-hidden />
              {label}
            </motion.span>
          )}
        </AnimatePresence>
      </span>
    </motion.button>
  );
}

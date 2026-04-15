"use client";

import * as React from "react";
import { Tooltip } from "@base-ui/react/tooltip";
import { cn } from "@/lib/utils";

/* ─────────────────────────────────────────────────────────────
 * <Hint> — a tiny tooltip primitive for plain-language explanations
 * of jargon terms. Wraps any text (or a dotted-underline affordance)
 * and reveals a definition on hover / focus.
 *
 *   <Hint term="Mbps" def="Megabits per second — how much data per
 *     second. Your home internet probably has 5-50 Mbps upload.">
 *     Mbps
 *   </Hint>
 *
 * Design principle: present plainly, show only on demand. Never
 * replace the term itself; just help the first-time user decode it.
 * ──────────────────────────────────────────────────────────── */

type HintProps = {
  /** The plain-language explanation shown in the tooltip. */
  def: string;
  /** The displayed content (typically the jargon term itself). */
  children: React.ReactNode;
  /** Additional class names on the trigger wrapper. */
  className?: string;
  /** Show a dotted underline affordance under the term. Default true. */
  dotted?: boolean;
};

export function Hint({ def, children, className, dotted = true }: HintProps) {
  return (
    <Tooltip.Root delay={300}>
      <Tooltip.Trigger
        render={(props) => (
          <span
            {...props}
            className={cn(
              "cursor-help",
              dotted &&
                "underline decoration-dotted decoration-fg-subtle/60 underline-offset-[3px]",
              className
            )}
            tabIndex={0}
          >
            {children}
          </span>
        )}
      />
      <Tooltip.Portal>
        <Tooltip.Positioner sideOffset={6}>
          <Tooltip.Popup
            className={cn(
              "z-50 max-w-[260px] rounded-[var(--radius-sm)] px-3 py-2",
              "bg-bg-elevated/95 border border-hairline-strong backdrop-blur-xl",
              "shadow-[0_10px_30px_-10px_rgba(0,0,0,0.7),inset_0_1px_0_0_rgba(255,255,255,0.08)]",
              "text-[0.75rem] text-fg-primary leading-snug",
              "data-[starting-style]:opacity-0 data-[starting-style]:scale-95",
              "data-[ending-style]:opacity-0 data-[ending-style]:scale-95",
              "transition-[opacity,transform] duration-150 ease-out origin-[--transform-origin]"
            )}
          >
            {def}
          </Tooltip.Popup>
        </Tooltip.Positioner>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}

/* ─────────────────────────────────────────────────────────────
 * <TooltipProvider> — wrap the app so hints share a delay group.
 * ──────────────────────────────────────────────────────────── */
export function HintProvider({ children }: { children: React.ReactNode }) {
  return (
    <Tooltip.Provider delay={300} closeDelay={0}>
      {children}
    </Tooltip.Provider>
  );
}

/* ─────────────────────────────────────────────────────────────
 * Glossary — shared definitions for the jargon used across the app.
 * Single source of truth; use like <Hint {...GLOSSARY.mbps}>Mbps</Hint>.
 * ──────────────────────────────────────────────────────────── */
export const GLOSSARY = {
  mbps: {
    def: "Megabits per second — how fast data leaves your computer. Home upload is typically 5–50 Mbps.",
  },
  bitrate: {
    def: "How much video data you send per second. Higher bitrate = better quality, but more upload needed.",
  },
  streamKey: {
    def: "A secret code each platform gives you to authorize broadcasts. Treat it like a password.",
  },
  rotateKey: {
    def: "Generate a new stream key. The old one stops working immediately; paste the new one into your broadcast app.",
  },
  lufs: {
    def: "Loudness units — how loud your audio sounds. Music targets around -14 LUFS; talk streams target -18 LUFS.",
  },
  resolutionFps: (q: string) => ({
    def: `${q.replace("p", "p vertical resolution at ").replace("60", "60 frames per second").replace("30", "30 frames per second")}. Higher = smoother, but more bandwidth.`,
  }),
  droppedFrames: {
    def: "Frames your computer failed to send in time. A few are normal; sustained drops mean upload can't keep up.",
  },
} as const;

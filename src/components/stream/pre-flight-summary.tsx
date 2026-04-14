"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Clock, Eye, Wand } from "lucide-react";
import { GoLiveButton, type StreamPhase } from "@/components/stream/go-live-button";
import { cn } from "@/lib/utils";
import { springSoft, springSnap, easeOutExpo } from "@/lib/motion";
import type { Destination } from "@/components/stream/destination-card";

export const UPLOAD_MBPS = 8.4;

export type FitRemedy = {
  kind: "lower-quality" | "disable";
  destinationId: string;
  destinationName: string;
  detail: string;
  /** Post-fix needed-bitrate — used by hover-preview on the Apply button. */
  postFixNeeded: number;
  delta: number;
  apply: () => void;
};

type StatusTone = "idle" | "ready" | "warn" | "live";

type PreFlightSummaryProps = {
  phase: StreamPhase;
  countdownValue: number;
  destinations: Destination[];
  enabled: Record<string, boolean>;
  qualityIndex: Record<string, number>;
  onStart: () => void;
  onCancel: () => void;
  onEnd: () => void;
  remedy?: FitRemedy;
};

export function PreFlightSummary({
  phase,
  countdownValue,
  destinations,
  enabled,
  qualityIndex,
  onStart,
  onCancel,
  onEnd,
  remedy,
}: PreFlightSummaryProps) {
  const enabledList = destinations.filter((d) => enabled[d.id]);
  const needed = enabledList.reduce((s, d) => {
    const q = d.qualities[qualityIndex[d.id] ?? 0];
    return s + q.bitrate;
  }, 0);
  const overBudget = needed > UPLOAD_MBPS;
  const overBy = Math.max(0, needed - UPLOAD_MBPS);

  // hover-preview state for "Apply fix"
  const [remedyHover, setRemedyHover] = React.useState(false);
  const displayedNeeded = remedyHover && remedy ? remedy.postFixNeeded : needed;
  const displayedOverBudget = displayedNeeded > UPLOAD_MBPS;
  const displayedOverBy = Math.max(0, displayedNeeded - UPLOAD_MBPS);

  const status: { label: string; tone: StatusTone } =
    phase === "live"
      ? { label: "Broadcasting", tone: "live" }
      : phase === "counting"
        ? { label: "Starting in", tone: "warn" }
        : enabledList.length === 0
          ? { label: "Add a destination to start", tone: "idle" }
          : overBudget
            ? { label: "Upload over capacity", tone: "warn" }
            : { label: "Ready to broadcast", tone: "ready" };

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[var(--radius-xl)]",
        "border border-hairline bg-white/[0.025] backdrop-blur-xl",
        "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.07),0_20px_60px_-30px_rgba(0,0,0,0.6)]"
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background:
            phase === "live"
              ? "radial-gradient(120% 100% at 100% 0%, rgba(255,71,87,0.16), transparent 55%)"
              : overBudget
                ? "radial-gradient(120% 100% at 100% 0%, rgba(255,181,71,0.14), transparent 55%)"
                : "radial-gradient(120% 100% at 100% 0%, rgba(124,92,255,0.14), transparent 55%)",
        }}
        aria-hidden
      />

      <div className="relative grid gap-5 p-5 md:grid-cols-[1fr_auto] md:items-center md:gap-8 md:p-6">
        {/* LEFT column */}
        <div className="flex flex-col gap-4 min-w-0">
          {/* status label */}
          <div className="flex items-center gap-2">
            <StatusDot tone={status.tone} />
            <span className="text-[0.75rem] font-semibold uppercase tracking-[0.1em] text-fg-muted">
              {status.label}
            </span>
          </div>

          {/* chip row */}
          <div className="flex flex-wrap items-center gap-2 min-h-[32px]">
            <AnimatePresence mode="popLayout">
              {enabledList.length === 0 ? (
                <motion.span
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-[0.875rem] text-fg-subtle"
                >
                  No destinations selected
                </motion.span>
              ) : (
                enabledList.map((d) => {
                  const q = d.qualities[qualityIndex[d.id] ?? 0];
                  return (
                    <motion.div
                      key={d.id}
                      layout
                      initial={{ opacity: 0, scale: 0.8, y: -4 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.8, y: 4 }}
                      transition={springSnap}
                      className="inline-flex items-center gap-2 rounded-full border border-hairline bg-white/[0.04] pl-1.5 pr-3 h-8"
                    >
                      <span
                        className="relative flex size-5 items-center justify-center rounded-full overflow-hidden border border-hairline shrink-0"
                        style={{
                          background: `linear-gradient(135deg, ${d.color}44 0%, ${d.color}11 100%)`,
                        }}
                        aria-hidden
                      >
                        <span className="scale-[0.55]" style={{ color: d.color }}>
                          {d.icon}
                        </span>
                      </span>
                      <span className="text-[0.75rem] font-medium text-fg-primary">
                        {d.platform}
                      </span>
                      <span className="text-[0.75rem] text-fg-subtle tabular-nums">
                        {q.bitrate.toFixed(1)} Mbps
                      </span>
                    </motion.div>
                  );
                })
              )}
            </AnimatePresence>
          </div>

          {/* Upload bar with inline over-by label */}
          <UploadBar
            needed={displayedNeeded}
            available={UPLOAD_MBPS}
            overBudget={displayedOverBudget}
            overBy={displayedOverBy}
            previewing={remedyHover}
          />

          {/* Remedy callout — shown only when over */}
          <AnimatePresence initial={false}>
            {overBudget && remedy && (
              <motion.div
                key="remedy"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25, ease: easeOutExpo }}
                className="overflow-hidden"
              >
                <div className="flex items-center justify-between gap-3 rounded-[var(--radius-md)] border border-warn/30 bg-warn/[0.06] px-3 py-2">
                  <span className="inline-flex items-center gap-2 text-[0.75rem] text-fg-primary min-w-0">
                    <Wand className="size-3.5 text-warn shrink-0" />
                    <span className="truncate">{remedy.detail}</span>
                  </span>
                  <button
                    type="button"
                    onClick={remedy.apply}
                    onMouseEnter={() => setRemedyHover(true)}
                    onMouseLeave={() => setRemedyHover(false)}
                    onFocus={() => setRemedyHover(true)}
                    onBlur={() => setRemedyHover(false)}
                    className={cn(
                      "inline-flex items-center h-7 px-3 rounded-[var(--radius-sm)]",
                      "text-[0.75rem] font-medium shrink-0",
                      "bg-warn/20 text-warn border border-warn/40",
                      "hover:bg-warn/30 transition-colors"
                    )}
                  >
                    Apply fix
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Last session */}
          <div className="flex items-center gap-5 text-[0.75rem] text-fg-subtle">
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-3.5" />
              Last stream 2h 14m
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Eye className="size-3.5" />
              342 peak (+12% over last stream)
            </span>
          </div>
        </div>

        {/* RIGHT column: CTA */}
        <div className="flex flex-col items-stretch md:items-end gap-2 md:min-w-[220px]">
          <GoLiveButton
            phase={phase}
            countdownValue={countdownValue}
            destinationCount={enabledList.length}
            overBudget={overBudget}
            onStart={onStart}
            onCancel={onCancel}
            onEnd={onEnd}
            size="lg"
          />
          <AnimatePresence initial={false} mode="wait">
            <motion.span
              key={phase}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="text-[0.6875rem] text-fg-subtle text-center md:text-right"
            >
              {phase === "live"
                ? "Streaming across all destinations"
                : phase === "counting"
                  ? "Tap to cancel"
                  : enabledList.length === 0
                    ? "Enable at least one destination"
                    : "\u00A0"}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function StatusDot({ tone }: { tone: StatusTone }) {
  /* ─────────────────────────────────────────────────────────────
   * STATUS DOT TONE HIERARCHY
   *   idle   — no glow, 8px neutral
   *   ready  — subtle violet glow, 8px
   *   warn   — amber glow, 10px (larger = more attention)
   *   live   — red + pulsing ring, 10px (most alive)
   * ──────────────────────────────────────────────────────────── */
  if (tone === "live") {
    return (
      <span className="relative inline-block size-2.5 shrink-0" aria-hidden>
        <span
          className="absolute inset-0 rounded-full"
          style={{
            background: "#ff4757",
            boxShadow: "0 0 14px 2px rgba(255,71,87,0.8)",
          }}
        />
        <span className="absolute inset-0 rounded-full bg-live animate-ping opacity-40" />
      </span>
    );
  }
  if (tone === "warn") {
    return (
      <span
        className="inline-block size-2.5 rounded-full shrink-0"
        style={{
          background: "#ffb547",
          boxShadow: "0 0 12px 1px rgba(255,181,71,0.55)",
        }}
        aria-hidden
      />
    );
  }
  if (tone === "ready") {
    return (
      <span
        className="inline-block size-2 rounded-full shrink-0"
        style={{
          background: "#7c5cff",
          boxShadow: "0 0 10px rgba(124,92,255,0.45)",
        }}
        aria-hidden
      />
    );
  }
  // idle
  return (
    <span
      className="inline-block size-2 rounded-full shrink-0 bg-fg-subtle/60"
      aria-hidden
    />
  );
}

function UploadBar({
  needed,
  available,
  overBudget,
  overBy,
  previewing,
}: {
  needed: number;
  available: number;
  overBudget: boolean;
  overBy: number;
  previewing: boolean;
}) {
  const underPct = Math.min((needed / available) * 100, 100);

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-[0.75rem]">
        <span className="text-fg-muted">
          Upload{" "}
          <motion.span
            className={cn(
              "font-medium tabular-nums",
              overBudget ? "text-warn" : "text-fg-primary"
            )}
            animate={{ opacity: previewing ? 0.7 : 1 }}
          >
            {needed.toFixed(1)}
          </motion.span>
          <span className="text-fg-subtle"> / {available.toFixed(1)} Mbps</span>
          {overBudget && (
            <span className="text-warn tabular-nums ml-1.5">
              · over by {overBy.toFixed(1)}
            </span>
          )}
        </span>
        {previewing && (
          <span className="text-[0.6875rem] uppercase tracking-[0.08em] text-fg-subtle">
            Preview
          </span>
        )}
      </div>
      <div className="relative flex items-center gap-1 h-4">
        {/* within-budget rail */}
        <div className="relative flex-1 h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
          <motion.div
            className={cn(
              "absolute inset-y-0 left-0 rounded-full",
              overBudget
                ? "bg-gradient-to-r from-brand-500 to-brand-400"
                : "bg-gradient-to-r from-brand-400 to-brand-600"
            )}
            initial={false}
            animate={{ width: `${underPct}%` }}
            transition={springSoft}
            style={{ boxShadow: "0 0 12px rgba(124,92,255,0.3)" }}
          />
        </div>

        {/* fat cap tick — 2px wide × 16px tall in contrasting neutral */}
        <span
          className="relative w-[2px] h-4 rounded-full bg-white/50 shrink-0"
          aria-label="Upload cap"
        />

        {/* overage segment — only when over */}
        <AnimatePresence initial={false}>
          {overBudget && (
            <motion.div
              key="overage"
              initial={{ width: 0, opacity: 0 }}
              animate={{
                width: `${Math.min((overBy / available) * 100, 40)}%`,
                opacity: 1,
              }}
              exit={{ width: 0, opacity: 0 }}
              transition={springSoft}
              className="h-1.5 rounded-full bg-gradient-to-r from-warn to-live shrink-0"
              style={{ boxShadow: "0 0 16px rgba(255,71,87,0.35)" }}
              aria-hidden
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

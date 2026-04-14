"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Clock, Eye, Wand } from "lucide-react";
import { GoLiveButton, type StreamPhase } from "@/components/stream/go-live-button";
import { cn } from "@/lib/utils";
import type { Destination } from "@/components/stream/destination-card";

export const UPLOAD_MBPS = 8.4;

export type FitRemedy = {
  kind: "lower-quality" | "disable";
  destinationId: string;
  destinationName: string;
  detail: string; // human-friendly: "Reduce Twitch to 720p60 (−2.0 Mbps)"
  delta: number; // Mbps saved
  apply: () => void;
};

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
  const underPct = Math.min((needed / UPLOAD_MBPS) * 100, 100);

  const status =
    phase === "live"
      ? { label: "Broadcasting", tone: "live" as const }
      : phase === "counting"
        ? { label: "Starting in", tone: "warn" as const }
        : enabledList.length === 0
          ? { label: "Add a destination to start", tone: "idle" as const }
          : overBudget
            ? { label: "Upload over capacity", tone: "warn" as const }
            : { label: "Ready to broadcast", tone: "ready" as const };

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
        {/* LEFT column: status truth */}
        <div className="flex flex-col gap-4 min-w-0">
          <div className="flex items-center gap-2">
            <StatusDot tone={status.tone} />
            <span className="text-[0.75rem] font-semibold uppercase tracking-[0.1em] text-fg-muted">
              {status.label}
            </span>
          </div>

          {/* Chip row */}
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
                      transition={{ type: "spring", stiffness: 420, damping: 28 }}
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
                      <span className="text-[0.8125rem] font-medium text-fg-primary">
                        {d.platform}
                      </span>
                      <span className="text-[0.75rem] text-fg-subtle tabular-nums">
                        {q.bitrate.toFixed(1)}
                      </span>
                    </motion.div>
                  );
                })
              )}
            </AnimatePresence>
          </div>

          {/* Upload bar — two visual regions when over */}
          <UploadBar
            needed={needed}
            available={UPLOAD_MBPS}
            overBudget={overBudget}
            overBy={overBy}
            underPct={underPct}
          />

          {/* Remedy — only when over */}
          <AnimatePresence initial={false}>
            {overBudget && remedy && (
              <motion.div
                key="remedy"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden"
              >
                <div className="flex items-center justify-between gap-3 rounded-[var(--radius-md)] border border-warn/30 bg-warn/[0.06] px-3 py-2">
                  <span className="inline-flex items-center gap-2 text-[0.8125rem] text-fg-primary min-w-0">
                    <Wand className="size-3.5 text-warn shrink-0" />
                    <span className="truncate">{remedy.detail}</span>
                  </span>
                  <button
                    type="button"
                    onClick={remedy.apply}
                    className={cn(
                      "inline-flex items-center h-7 px-3 rounded-[8px]",
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
              342 peak viewers
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

function StatusDot({ tone }: { tone: "idle" | "ready" | "warn" | "live" }) {
  const color =
    tone === "live"
      ? "#ff4757"
      : tone === "warn"
        ? "#ffb547"
        : tone === "ready"
          ? "#7c5cff"
          : "#6a6b84";
  return (
    <span
      className="size-2 rounded-full shrink-0"
      style={{
        background: color,
        boxShadow: tone === "idle" ? "none" : `0 0 10px ${color}`,
      }}
      aria-hidden
    />
  );
}

function UploadBar({
  needed,
  available,
  overBudget,
  overBy,
  underPct,
}: {
  needed: number;
  available: number;
  overBudget: boolean;
  overBy: number;
  underPct: number;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-[0.75rem]">
        <span className="text-fg-muted">
          Upload{" "}
          <span
            className={cn(
              "font-medium tabular-nums",
              overBudget ? "text-warn" : "text-fg-primary"
            )}
          >
            {needed.toFixed(1)}
          </span>
          <span className="text-fg-subtle"> / {available.toFixed(1)} Mbps</span>
        </span>
        {overBudget && (
          <span className="inline-flex items-center gap-1 text-warn font-medium tabular-nums">
            Over by {overBy.toFixed(1)} Mbps
          </span>
        )}
      </div>
      <div className="relative flex items-center gap-1 h-3">
        {/* "within budget" track — fixed-width rail representing upload cap */}
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
            transition={{ type: "spring", stiffness: 240, damping: 32 }}
            style={{ boxShadow: "0 0 12px rgba(124,92,255,0.3)" }}
          />
        </div>

        {/* cap tick */}
        <span
          className="relative w-px h-3 bg-fg-subtle/80 shrink-0"
          aria-hidden
        />

        {/* overage segment — only rendered when over */}
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
              transition={{ type: "spring", stiffness: 220, damping: 30 }}
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

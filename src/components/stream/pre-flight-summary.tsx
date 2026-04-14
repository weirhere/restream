"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Clock, Eye, Video, Wand, AlertTriangle } from "lucide-react";
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
  firstTime: boolean;
  lastStream?: { duration: string; peakViewers: number; deltaPct: number; when: string };
  onStart: () => void;
  onCancel: () => void;
  onEnd: () => void;
  onProceedAnyway: () => void;
  onOpenSourceConfig: () => void;
  remedy?: FitRemedy;
};

export function PreFlightSummary({
  phase,
  countdownValue,
  destinations,
  enabled,
  qualityIndex,
  firstTime,
  lastStream,
  onStart,
  onCancel,
  onEnd,
  onProceedAnyway,
  onOpenSourceConfig,
  remedy,
}: PreFlightSummaryProps) {
  const enabledList = destinations.filter((d) => enabled[d.id]);
  const needed = enabledList.reduce((s, d) => {
    const q = d.qualities[qualityIndex[d.id] ?? 0];
    return s + q.bitrate;
  }, 0);
  const overBudget = needed > UPLOAD_MBPS;
  const overBy = Math.max(0, needed - UPLOAD_MBPS);

  // hover-preview state
  const [remedyHover, setRemedyHover] = React.useState(false);

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

      <div className="relative grid gap-5 p-6 md:grid-cols-[1fr_auto] md:items-center md:gap-8">
        {/* LEFT column */}
        <div className="flex flex-col gap-4 min-w-0">
          {/* status label */}
          <div className="flex items-center gap-2">
            <StatusDot tone={status.tone} />
            <span className="text-[0.75rem] font-semibold uppercase tracking-[0.1em] text-fg-muted">
              {status.label}
            </span>
          </div>

          {/* SEGMENTED UPLOAD BAR — the single visual for destinations + budget */}
          <SegmentedUploadBar
            destinations={enabledList}
            qualityIndex={qualityIndex}
            needed={needed}
            cap={UPLOAD_MBPS}
            overBy={overBy}
            remedyTargetId={remedyHover ? remedy?.destinationId : undefined}
            previewNeeded={remedyHover ? remedy?.postFixNeeded : undefined}
          />

          {/* Remedy callout */}
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
                  <span className="inline-flex items-center gap-2 text-[0.875rem] text-fg-primary min-w-0">
                    <Wand className="size-3.5 text-warn shrink-0" />
                    <span className="truncate">{remedy.detail}</span>
                  </span>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={onProceedAnyway}
                      className="inline-flex items-center h-7 px-2.5 rounded-[var(--radius-sm)] text-[0.75rem] font-medium text-fg-muted hover:text-fg-primary hover:bg-white/[0.04] transition-colors"
                      title="Go live despite over-capacity (stream may drop frames)"
                    >
                      Go live anyway
                    </button>
                    <button
                      type="button"
                      onClick={remedy.apply}
                      onMouseEnter={() => setRemedyHover(true)}
                      onMouseLeave={() => setRemedyHover(false)}
                      onFocus={() => setRemedyHover(true)}
                      onBlur={() => setRemedyHover(false)}
                      className="inline-flex items-center h-7 px-3 rounded-[var(--radius-sm)] text-[0.75rem] font-medium bg-warn/20 text-warn border border-warn/40 hover:bg-warn/30 transition-colors"
                    >
                      Apply fix
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Ambient info row: source + last stream */}
          <div className="flex items-center gap-4 text-[0.75rem] text-fg-subtle flex-wrap">
            <button
              type="button"
              onClick={onOpenSourceConfig}
              className="inline-flex items-center gap-1.5 hover:text-fg-primary transition-colors"
            >
              <Video className="size-3.5" />
              Camera + screen share · 1080p60
            </button>
            <span className="text-fg-subtle/60">·</span>
            {firstTime || !lastStream ? (
              <span>First stream — we'll track stats from here</span>
            ) : (
              <>
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="size-3.5" />
                  Last stream {lastStream.when} · {lastStream.duration}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Eye className="size-3.5" />
                  {lastStream.peakViewers} peak viewers
                  {lastStream.deltaPct !== 0 && (
                    <span
                      className={cn(
                        "font-medium tabular-nums",
                        lastStream.deltaPct > 0 ? "text-success" : "text-warn"
                      )}
                    >
                      ({lastStream.deltaPct > 0 ? "+" : ""}
                      {lastStream.deltaPct}% vs prior avg)
                    </span>
                  )}
                </span>
              </>
            )}
          </div>
        </div>

        {/* RIGHT column: CTA */}
        <div className="flex flex-col items-stretch md:items-end gap-2 md:min-w-[220px]">
          <GoLiveButton
            phase={phase}
            countdownValue={countdownValue}
            destinationCount={enabledList.length}
            overBudget={overBudget}
            disabled={overBudget && phase === "offline"}
            onStart={onStart}
            onCancel={onCancel}
            onEnd={onEnd}
            size="lg"
          />
          <AnimatePresence initial={false} mode="wait">
            <motion.span
              key={phase + (overBudget ? "-over" : "-ok")}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="text-[0.75rem] text-fg-subtle text-center md:text-right"
            >
              {phase === "live"
                ? "Streaming across all destinations"
                : phase === "counting"
                  ? "Tap to cancel"
                  : enabledList.length === 0
                    ? "Enable at least one destination"
                    : overBudget
                      ? (
                        <span className="inline-flex items-center gap-1 text-warn">
                          <AlertTriangle className="size-3" />
                          Resolve to continue
                        </span>
                      )
                      : "\u00A0"}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
 * StatusDot — tone hierarchy (idle / ready / warn / live)
 * ──────────────────────────────────────────────────────────── */
function StatusDot({ tone }: { tone: StatusTone }) {
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
  return (
    <span
      className="inline-block size-2 rounded-full shrink-0 bg-fg-subtle/60"
      aria-hidden
    />
  );
}

/* ─────────────────────────────────────────────────────────────
 * SegmentedUploadBar — single visual combining the chip row + upload bar.
 *
 *   One bar, sized to the upload cap. Each enabled destination contributes
 *   a colored segment proportional to its bitrate. Overage extrudes past
 *   the cap tick in red.
 *
 *   The remedy target (the destination being suggested for reduction)
 *   pulses when hovering "Apply fix".
 * ──────────────────────────────────────────────────────────── */
function SegmentedUploadBar({
  destinations,
  qualityIndex,
  needed,
  cap,
  overBy,
  remedyTargetId,
  previewNeeded,
}: {
  destinations: Destination[];
  qualityIndex: Record<string, number>;
  needed: number;
  cap: number;
  overBy: number;
  remedyTargetId?: string;
  previewNeeded?: number;
}) {
  const overBudget = needed > cap;
  const displayedNeeded = previewNeeded ?? needed;
  const displayedOverBy = Math.max(0, displayedNeeded - cap);
  const displayedOverBudget = displayedNeeded > cap;
  const previewing = previewNeeded !== undefined;

  // Allocate segment widths. When over, segments fill bar to cap proportionally.
  // The within-cap portion is `min(needed, cap)`. Each segment's width within bar = (bitrate / cap) * 100%,
  // clipped so the cumulative sum doesn't exceed 100%.
  const segments: {
    id: string;
    platform: string;
    color: string;
    bitrate: number;
    widthPct: number;
  }[] = [];
  let used = 0;
  for (const d of destinations) {
    const br = d.qualities[qualityIndex[d.id] ?? 0].bitrate;
    const remaining = cap - used;
    const within = Math.max(0, Math.min(br, remaining));
    if (within > 0) {
      segments.push({
        id: d.id,
        platform: d.platform,
        color: d.color,
        bitrate: br,
        widthPct: (within / cap) * 100,
      });
    }
    used += br;
  }

  return (
    <div className="flex flex-col gap-2">
      {/* Header */}
      <div className="flex items-baseline justify-between text-[0.875rem]">
        <span className="text-fg-muted">
          Upload{" "}
          <motion.span
            className={cn(
              "font-medium tabular-nums",
              displayedOverBudget ? "text-warn" : "text-fg-primary"
            )}
            animate={{ opacity: previewing ? 0.7 : 1 }}
          >
            {displayedNeeded.toFixed(1)}
          </motion.span>
          <span className="text-fg-subtle"> / {cap.toFixed(1)} Mbps</span>
          {displayedOverBudget && (
            <span className="text-warn tabular-nums ml-1.5">
              · over by {displayedOverBy.toFixed(1)}
            </span>
          )}
        </span>
        {previewing && (
          <span className="text-[0.6875rem] uppercase tracking-[0.08em] text-fg-subtle">
            Preview
          </span>
        )}
      </div>

      {/* Bar */}
      <div className="relative flex items-center gap-1 h-7">
        {/* cap rail — fixed width, holds segments */}
        <div className="relative flex-1 h-6 rounded-[var(--radius-sm)] bg-white/[0.03] border border-hairline overflow-hidden">
          <div className="absolute inset-y-0 left-0 right-0 flex">
            <AnimatePresence initial={false} mode="popLayout">
              {segments.map((s, i) => (
                <motion.div
                  key={s.id}
                  layout
                  initial={{ opacity: 0, flexGrow: 0 }}
                  animate={{
                    opacity: 1,
                  }}
                  exit={{ opacity: 0 }}
                  transition={springSnap}
                  style={{
                    width: `${s.widthPct}%`,
                    background: s.color,
                  }}
                  className={cn(
                    "relative h-full overflow-hidden",
                    i > 0 && "border-l border-black/30",
                    remedyTargetId === s.id &&
                      "outline outline-2 outline-warn -outline-offset-1"
                  )}
                >
                  {/* sheen */}
                  <span
                    aria-hidden
                    className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.3),transparent_50%,rgba(0,0,0,0.15))]"
                  />
                  {/* inline label — only if segment is wide enough */}
                  <SegmentLabel
                    platform={s.platform}
                    bitrate={s.bitrate}
                    widthPct={s.widthPct}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* cap tick — outside the rail, before overage */}
        <span
          className="relative w-[3px] h-7 rounded-full bg-white/60 shrink-0 shadow-[0_0_8px_rgba(255,255,255,0.25)]"
          aria-label="Upload cap"
        />

        {/* overage segment */}
        <AnimatePresence initial={false}>
          {displayedOverBudget && (
            <motion.div
              key="overage"
              initial={{ width: 0, opacity: 0 }}
              animate={{
                width: `${Math.min((displayedOverBy / cap) * 100, 45)}%`,
                opacity: 1,
              }}
              exit={{ width: 0, opacity: 0 }}
              transition={springSoft}
              className="relative h-6 rounded-[var(--radius-sm)] bg-gradient-to-r from-warn to-live shrink-0 overflow-hidden"
              style={{ boxShadow: "0 0 18px rgba(255,71,87,0.45)" }}
            >
              <span
                aria-hidden
                className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.3),transparent_50%,rgba(0,0,0,0.15))]"
              />
              <span className="relative z-10 flex items-center h-full px-2 text-[0.6875rem] font-semibold tabular-nums text-white">
                +{displayedOverBy.toFixed(1)}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Legend below — for narrow segments where inline label hides */}
      {segments.length > 0 && (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.6875rem] text-fg-muted">
          {segments.map((s) => (
            <span key={s.id} className="inline-flex items-center gap-1.5">
              <span
                className="size-2 rounded-sm shrink-0"
                style={{ background: s.color }}
                aria-hidden
              />
              <span>
                {s.platform}{" "}
                <span className="text-fg-subtle tabular-nums">
                  {s.bitrate.toFixed(1)}
                </span>
              </span>
            </span>
          ))}
          {overBudget && !previewing && (
            <span className="inline-flex items-center gap-1.5 text-warn">
              <span className="size-2 rounded-sm bg-live" aria-hidden />
              over {overBy.toFixed(1)}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

function SegmentLabel({
  platform,
  bitrate,
  widthPct,
}: {
  platform: string;
  bitrate: number;
  widthPct: number;
}) {
  // Hide inline label if segment is too narrow (e.g., < 18% of bar)
  if (widthPct < 18) return null;
  return (
    <span className="relative z-10 flex items-center justify-between h-full px-2 gap-2 text-[0.75rem] font-medium text-white/95 [text-shadow:0_1px_2px_rgba(0,0,0,0.4)]">
      <span className="truncate">{platform}</span>
      <span className="tabular-nums opacity-80 shrink-0">
        {bitrate.toFixed(1)}
      </span>
    </span>
  );
}

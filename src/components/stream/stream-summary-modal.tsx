"use client";

import * as React from "react";
import { Clock, Eye, TrendingUp, Film, Mic } from "lucide-react";
import { ModalShell } from "@/components/stream/source-config-modal";
import { cn } from "@/lib/utils";
import { Hint, GLOSSARY } from "@/components/ui/hint";

type SummaryData = {
  endedAt: number;
  destinations: string[];
  duration: string;
  peakViewers: number;
  deltaPct: number;
} | null;

export function StreamSummaryModal({
  open,
  onClose,
  data,
}: {
  open: boolean;
  onClose: () => void;
  data: SummaryData;
}) {
  return (
    <ModalShell open={open} onClose={onClose} title="Stream summary">
      {!data ? (
        <p className="text-[0.875rem] text-fg-muted">No recent stream.</p>
      ) : (
        <div className="flex flex-col gap-5">
          {/* Headline stats */}
          <div className="grid grid-cols-3 gap-3">
            <SummaryStat
              icon={Clock}
              label="Duration"
              value={data.duration}
              tone="neutral"
            />
            <SummaryStat
              icon={Eye}
              label="Peak viewers"
              value={data.peakViewers.toString()}
              tone="neutral"
            />
            <SummaryStat
              icon={TrendingUp}
              label="vs prior avg"
              value={`${data.deltaPct > 0 ? "+" : ""}${data.deltaPct}%`}
              tone={data.deltaPct >= 0 ? "success" : "warn"}
            />
          </div>

          {/* Destinations */}
          <div className="flex flex-col gap-2">
            <span className="text-[0.75rem] font-semibold uppercase tracking-[0.1em] text-fg-muted">
              Broadcast to
            </span>
            <div className="flex flex-wrap gap-1.5">
              {data.destinations.map((d) => (
                <span
                  key={d}
                  className="inline-flex items-center h-7 px-2.5 rounded-full border border-hairline bg-white/[0.04] text-[0.75rem] text-fg-primary"
                >
                  {d}
                </span>
              ))}
            </div>
          </div>

          {/* Audio — trend + consistency */}
          <AudioTrendSection />

          {/* Placeholder: highlights / clips */}
          <div className="flex flex-col gap-2">
            <span className="text-[0.75rem] font-semibold uppercase tracking-[0.1em] text-fg-muted">
              Highlights
            </span>
            <div className="flex items-center gap-3 rounded-[var(--radius-md)] border border-hairline bg-white/[0.02] px-4 py-3">
              <Film className="size-4 text-fg-subtle shrink-0" />
              <div className="flex flex-col min-w-0 flex-1 leading-tight">
                <span className="text-[0.875rem] font-medium text-fg-primary">
                  3 clip candidates detected
                </span>
                <span className="text-[0.75rem] text-fg-subtle">
                  From chat engagement spikes · 00:12, 00:24, 00:35
                </span>
              </div>
              <button
                type="button"
                className="inline-flex items-center h-7 px-2.5 rounded-[var(--radius-sm)] text-[0.75rem] font-medium border border-hairline bg-white/[0.04] text-fg-primary hover:bg-white/[0.08] transition-colors"
              >
                Review
              </button>
            </div>
          </div>

          <p className="text-[0.75rem] text-fg-subtle">
            Full analytics available in Recordings.
          </p>
        </div>
      )}
    </ModalShell>
  );
}

/* Post-stream audio: LUFS trend with target band, consistency read. */
function AudioTrendSection() {
  // Mock a 30-point LUFS trend. Mostly -18 target with a couple dips.
  const trend = [
    -18.2, -18.1, -17.9, -18.0, -18.3, -17.8, -19.1, -18.4, -18.1, -17.9,
    -18.0, -18.2, -17.7, -17.9, -18.1, -19.5, -18.8, -18.2, -17.9, -18.0,
    -18.3, -18.1, -17.8, -18.0, -18.2, -18.4, -18.1, -17.9, -18.0, -18.1,
  ];
  const avg = trend.reduce((s, v) => s + v, 0) / trend.length;
  const min = Math.min(...trend);
  const max = Math.max(...trend);
  const target = -18;
  const targetBand = 2; // ±2 LUFS around target is "good"

  const inBandCount = trend.filter(
    (v) => Math.abs(v - target) <= targetBand
  ).length;
  const consistencyPct = Math.round((inBandCount / trend.length) * 100);

  const w = 300;
  const h = 40;
  const yMax = Math.max(max + 1, target + targetBand + 1);
  const yMin = Math.min(min - 1, target - targetBand - 1);
  const range = yMax - yMin;
  const step = w / (trend.length - 1);
  const pts = trend
    .map((v, i) => {
      const x = i * step;
      const y = h - ((v - yMin) / range) * h;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");
  const bandTopY = h - ((target + targetBand - yMin) / range) * h;
  const bandBotY = h - ((target - targetBand - yMin) / range) * h;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between">
        <span className="text-[0.75rem] font-semibold uppercase tracking-[0.1em] text-fg-muted inline-flex items-center gap-2">
          <Mic className="size-3" />
          Audio
        </span>
        <span className="text-[0.6875rem] text-fg-subtle">Last 30 min</span>
      </div>
      <div className="rounded-[var(--radius-md)] border border-hairline bg-white/[0.02] px-4 py-3 flex flex-col gap-3">
        <div className="flex items-center gap-4 flex-wrap text-[0.75rem]">
          <span className="text-fg-muted">
            Avg{" "}
            <span className="text-fg-primary font-medium tabular-nums">
              {avg.toFixed(1)}
            </span>{" "}
            <Hint {...GLOSSARY.lufs}>LUFS</Hint>
          </span>
          <span className="text-fg-subtle">·</span>
          <span className="text-fg-muted tabular-nums">
            range {min.toFixed(1)} → {max.toFixed(1)}
          </span>
          <span className="text-fg-subtle">·</span>
          <span
            className={cn(
              "font-medium tabular-nums",
              consistencyPct >= 85
                ? "text-success"
                : consistencyPct >= 70
                  ? "text-warn"
                  : "text-live"
            )}
          >
            {consistencyPct}% in target band
          </span>
        </div>

        <svg
          viewBox={`0 0 ${w} ${h}`}
          className="w-full h-10"
          preserveAspectRatio="none"
          aria-hidden
        >
          {/* Target band */}
          <rect
            x={0}
            y={bandTopY}
            width={w}
            height={bandBotY - bandTopY}
            fill="rgba(61,220,151,0.08)"
          />
          <line
            x1={0}
            x2={w}
            y1={bandTopY}
            y2={bandTopY}
            stroke="rgba(61,220,151,0.35)"
            strokeWidth="0.75"
            strokeDasharray="2 2"
            vectorEffect="non-scaling-stroke"
          />
          <line
            x1={0}
            x2={w}
            y1={bandBotY}
            y2={bandBotY}
            stroke="rgba(61,220,151,0.35)"
            strokeWidth="0.75"
            strokeDasharray="2 2"
            vectorEffect="non-scaling-stroke"
          />
          <polyline
            points={pts}
            fill="none"
            stroke="#c3b4ff"
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        <div className="flex items-center justify-between text-[0.6875rem] text-fg-subtle">
          <span>Green band = {target - targetBand} to {target + targetBand} LUFS</span>
          <span>{inBandCount} / {trend.length} samples in range</span>
        </div>
      </div>
    </div>
  );
}

function SummaryStat({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  tone: "neutral" | "success" | "warn";
}) {
  const color =
    tone === "success"
      ? "text-success"
      : tone === "warn"
        ? "text-warn"
        : "text-fg-primary";
  return (
    <div className="flex flex-col gap-1.5 rounded-[var(--radius-md)] border border-hairline bg-white/[0.02] px-3 py-3">
      <div className="inline-flex items-center gap-1.5 text-[0.6875rem] text-fg-subtle uppercase tracking-[0.08em]">
        <Icon className="size-3" />
        {label}
      </div>
      <div
        className={`text-[1.125rem] font-semibold tracking-tight tabular-nums ${color}`}
      >
        {value}
      </div>
    </div>
  );
}

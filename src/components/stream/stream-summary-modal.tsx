"use client";

import * as React from "react";
import { Clock, Eye, TrendingUp, Film } from "lucide-react";
import { ModalShell } from "@/components/stream/source-config-modal";

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

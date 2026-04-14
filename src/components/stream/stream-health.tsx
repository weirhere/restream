"use client";

import * as React from "react";
import { motion } from "motion/react";
import { Activity, Upload, AlertTriangle, Gauge } from "lucide-react";
import { cn } from "@/lib/utils";

type Tone = "ok" | "warn" | "bad";

type HealthMetric = {
  key: string;
  label: string;
  value: string;
  unit?: string;
  trend: number[];
  icon: React.ComponentType<{ className?: string }>;
  tone: Tone;
  /** Threshold drawn as dashed line on sparkline. */
  threshold?: {
    value: number;
    /** Which side of the line is unhealthy — `above` = alert when trend exceeds value. */
    direction: "above" | "below";
  };
};

const METRICS: HealthMetric[] = [
  {
    key: "cpu",
    label: "CPU",
    value: "34",
    unit: "%",
    trend: [22, 28, 31, 38, 42, 35, 30, 34, 37, 34],
    icon: Activity,
    tone: "ok",
    threshold: { value: 75, direction: "above" },
  },
  {
    key: "upload",
    label: "Upload",
    value: "8.4",
    unit: "Mbps",
    trend: [6, 7, 7.5, 8, 9, 8.2, 7.9, 8.4, 8.6, 8.4],
    icon: Upload,
    tone: "ok",
    threshold: { value: 5, direction: "below" },
  },
  {
    key: "dropped",
    label: "Dropped",
    value: "12",
    unit: "frames",
    trend: [0, 0, 1, 3, 2, 4, 8, 10, 9, 12],
    icon: AlertTriangle,
    tone: "warn",
    threshold: { value: 5, direction: "above" },
  },
  {
    key: "latency",
    label: "Latency",
    value: "212",
    unit: "ms",
    trend: [180, 185, 190, 200, 205, 210, 215, 220, 218, 212],
    icon: Gauge,
    tone: "ok",
    threshold: { value: 300, direction: "above" },
  },
];

const toneColor: Record<Tone, string> = {
  ok: "#3ddc97",
  warn: "#ffb547",
  bad: "#ff4757",
};

export function StreamHealth() {
  const issueCount = METRICS.filter((m) => m.tone !== "ok").length;
  const worst = METRICS.reduce<Tone>((acc, m) => {
    if (m.tone === "bad") return "bad";
    if (m.tone === "warn" && acc !== "bad") return "warn";
    return acc;
  }, "ok");

  const rollupLabel =
    issueCount === 0
      ? "All healthy"
      : issueCount === 1
        ? "1 issue"
        : `${issueCount} issues`;

  return (
    <div
      className={cn(
        "flex items-center gap-5 rounded-[var(--radius-md)]",
        "border border-hairline bg-white/[0.02] px-4 py-3",
        "text-[0.8125rem]"
      )}
    >
      <div className="flex items-center gap-2 pr-5 border-r border-hairline shrink-0">
        <span
          className="size-2 rounded-full"
          style={{
            background: toneColor[worst],
            boxShadow: `0 0 10px ${toneColor[worst]}`,
          }}
          aria-hidden
        />
        <span className="text-[0.8125rem] font-medium text-fg-primary">
          {rollupLabel}
        </span>
      </div>
      <div className="flex items-center gap-5 flex-1 min-w-0 overflow-x-auto no-scrollbar">
        {METRICS.map((m) => (
          <MetricInline key={m.key} metric={m} />
        ))}
      </div>
    </div>
  );
}

function MetricInline({ metric }: { metric: HealthMetric }) {
  const Icon = metric.icon;
  const color = toneColor[metric.tone];
  return (
    <div className="flex items-center gap-2.5 min-w-0 group cursor-default">
      <Icon className="size-3.5 text-fg-subtle shrink-0" aria-hidden />
      <span className="text-fg-muted text-[0.75rem] shrink-0">{metric.label}</span>
      <span
        className="font-medium tabular-nums shrink-0"
        style={{ color: metric.tone === "ok" ? "var(--fg-primary)" : color }}
      >
        {metric.value}
        {metric.unit && (
          <span className="text-fg-subtle text-[0.6875rem] ml-0.5">
            {metric.unit}
          </span>
        )}
      </span>
      <Sparkline
        values={metric.trend}
        color={color}
        threshold={metric.threshold}
        tone={metric.tone}
        className="w-14 h-5 shrink-0"
      />
    </div>
  );
}

function Sparkline({
  values,
  color,
  threshold,
  tone,
  className,
}: {
  values: number[];
  color: string;
  threshold?: HealthMetric["threshold"];
  tone: Tone;
  className?: string;
}) {
  const w = 100;
  const h = 24;

  // include the threshold in the scale so it's visible
  const allValues = [...values, ...(threshold ? [threshold.value] : [])];
  const max = Math.max(...allValues);
  const min = Math.min(...allValues);
  const range = max - min || 1;
  const step = w / (values.length - 1);

  const pts = values.map((v, i) => {
    const x = i * step;
    const y = h - ((v - min) / range) * h;
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  });
  const poly = pts.join(" ");
  const lastX = (values.length - 1) * step;
  const lastY = h - ((values[values.length - 1] - min) / range) * h;

  const thresholdY = threshold
    ? h - ((threshold.value - min) / range) * h
    : null;

  // Dot color uses tone — if breached, red/amber matches rollup
  const dotColor = tone === "ok" ? color : color;

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className={cn("h-5", className)}
      preserveAspectRatio="none"
      aria-hidden
    >
      {thresholdY !== null && (
        <line
          x1={0}
          x2={w}
          y1={thresholdY}
          y2={thresholdY}
          stroke="rgba(255,255,255,0.18)"
          strokeWidth="0.75"
          strokeDasharray="2 2"
          vectorEffect="non-scaling-stroke"
        />
      )}
      <polyline
        points={poly}
        fill="none"
        stroke={color}
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      <circle cx={lastX} cy={lastY} r="1.75" fill={dotColor} />
    </svg>
  );
}

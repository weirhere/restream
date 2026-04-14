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
  trend: number[]; // rolling values, last is current
  icon: React.ComponentType<{ className?: string }>;
  tone: Tone;
  threshold?: { value: number; operator: "lt" | "gt"; hint: string };
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
    threshold: { value: 75, operator: "lt", hint: "OK under 75%" },
  },
  {
    key: "upload",
    label: "Upload",
    value: "8.4",
    unit: "Mbps",
    trend: [6, 7, 7.5, 8, 9, 8.2, 7.9, 8.4, 8.6, 8.4],
    icon: Upload,
    tone: "ok",
    threshold: { value: 5, operator: "gt", hint: "Need >5 Mbps" },
  },
  {
    key: "dropped",
    label: "Dropped",
    value: "12",
    unit: "f",
    trend: [0, 0, 1, 3, 2, 4, 8, 10, 9, 12],
    icon: AlertTriangle,
    tone: "warn",
    threshold: { value: 5, operator: "lt", hint: "Ideal under 5" },
  },
  {
    key: "latency",
    label: "Latency",
    value: "212",
    unit: "ms",
    trend: [180, 185, 190, 200, 205, 210, 215, 220, 218, 212],
    icon: Gauge,
    tone: "ok",
    threshold: { value: 300, operator: "lt", hint: "OK under 300ms" },
  },
];

const toneColor: Record<Tone, string> = {
  ok: "#3ddc97",
  warn: "#ffb547",
  bad: "#ff4757",
};

const toneLabel: Record<Tone, string> = {
  ok: "Healthy",
  warn: "Watch",
  bad: "Issue",
};

export function StreamHealth() {
  const worst = METRICS.reduce<Tone>((acc, m) => {
    if (m.tone === "bad") return "bad";
    if (m.tone === "warn" && acc !== "bad") return "warn";
    return acc;
  }, "ok");

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
        <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-fg-muted">
          {toneLabel[worst]}
        </span>
      </div>
      <div className="flex items-center gap-4 flex-1 min-w-0 overflow-x-auto no-scrollbar">
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
    <motion.div
      className="flex items-center gap-2.5 min-w-0 group cursor-default"
      title={metric.threshold?.hint}
    >
      <Icon className="size-3.5 text-fg-subtle shrink-0" aria-hidden />
      <span className="text-fg-muted text-[0.75rem] shrink-0">
        {metric.label}
      </span>
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
        className="w-12 h-4 shrink-0 opacity-80 group-hover:opacity-100"
      />
    </motion.div>
  );
}

function Sparkline({
  values,
  color,
  className,
}: {
  values: number[];
  color: string;
  className?: string;
}) {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const w = 100;
  const h = 24;
  const step = w / (values.length - 1);
  const pts = values.map((v, i) => {
    const x = i * step;
    const y = h - ((v - min) / range) * h;
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  });
  const poly = pts.join(" ");
  const lastX = (values.length - 1) * step;
  const lastY = h - ((values[values.length - 1] - min) / range) * h;

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className={cn("h-4", className)}
      preserveAspectRatio="none"
      aria-hidden
    >
      <polyline
        points={poly}
        fill="none"
        stroke={color}
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={lastX} cy={lastY} r="1.5" fill={color} />
    </svg>
  );
}

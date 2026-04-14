"use client";

import * as React from "react";
import { motion } from "motion/react";
import { Activity, Upload, AlertTriangle, Gauge } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { fadeUp } from "@/lib/motion";
import { cn } from "@/lib/utils";

type HealthMetric = {
  key: string;
  label: string;
  value: string;
  unit?: string;
  trend: number[]; // 0-100 sparkline values
  icon: React.ComponentType<{ className?: string }>;
  tone: "ok" | "warn" | "bad";
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
  },
  {
    key: "upload",
    label: "Upload",
    value: "8.4",
    unit: "Mbps",
    trend: [6, 7, 7.5, 8, 9, 8.2, 7.9, 8.4, 8.6, 8.4],
    icon: Upload,
    tone: "ok",
  },
  {
    key: "dropped",
    label: "Dropped",
    value: "12",
    unit: "frames",
    trend: [0, 0, 1, 3, 2, 4, 8, 10, 9, 12],
    icon: AlertTriangle,
    tone: "warn",
  },
  {
    key: "latency",
    label: "Latency",
    value: "212",
    unit: "ms",
    trend: [180, 185, 190, 200, 205, 210, 215, 220, 218, 212],
    icon: Gauge,
    tone: "ok",
  },
];

const toneColor: Record<HealthMetric["tone"], string> = {
  ok: "#3ddc97",
  warn: "#ffb547",
  bad: "#ff4757",
};

export function StreamHealth() {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {METRICS.map((m) => (
        <MetricTile key={m.key} metric={m} />
      ))}
    </div>
  );
}

function MetricTile({ metric }: { metric: HealthMetric }) {
  const Icon = metric.icon;
  const color = toneColor[metric.tone];
  return (
    <motion.div variants={fadeUp}>
      <Card size="sm" className="gap-2">
        <CardContent className="flex flex-col gap-3 py-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-fg-muted">
              <Icon className="size-3.5" />
              <span className="text-[0.75rem] font-medium uppercase tracking-[0.08em]">
                {metric.label}
              </span>
            </div>
            <span
              className="size-1.5 rounded-full"
              style={{
                background: color,
                boxShadow: `0 0 8px ${color}`,
              }}
              aria-hidden
            />
          </div>

          <div className="flex items-baseline gap-1">
            <span className="text-[1.5rem] font-semibold leading-none tracking-tight text-fg-primary tabular-nums">
              {metric.value}
            </span>
            {metric.unit && (
              <span className="text-[0.75rem] text-fg-subtle">
                {metric.unit}
              </span>
            )}
          </div>

          <Sparkline values={metric.trend} color={color} />
        </CardContent>
      </Card>
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
  const area = `0,${h} ${poly} ${w},${h}`;
  const gid = React.useId().replace(/:/g, "");

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className={cn("w-full h-6", className)}
      preserveAspectRatio="none"
      aria-hidden
    >
      <defs>
        <linearGradient id={`spark-${gid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill={`url(#spark-${gid})`} />
      <polyline
        points={poly}
        fill="none"
        stroke={color}
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

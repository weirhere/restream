"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  AlertTriangle,
  ChevronDown,
  KeyRound,
  Plug,
  TrendingDown,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { fadeUp, revealDuration, easeOutExpo } from "@/lib/motion";

export type QualityOption = { quality: string; bitrate: number };

export type WarningKind = "key" | "bitrate" | "disconnected";

export type DestinationWarning = {
  kind: WarningKind;
  severity: "warn" | "bad";
  label: string;
  detail?: string;
  action: { label: string; kind: "rotate" | "reconnect" | "lower-quality" };
};

export type Destination = {
  id: string;
  platform: string;
  color: string;
  connected: boolean;
  qualities: QualityOption[];
  icon: React.ReactNode;
  warning?: DestinationWarning;
};

type ResolveState = "idle" | "working" | "done";

type DestinationCardProps = {
  destination: Destination;
  enabled: boolean;
  qualityIndex: number;
  warningActive: boolean;
  resolveState: ResolveState;
  onToggle: (id: string, next: boolean) => void;
  onCycleQuality: (id: string) => void;
  onWarningAction: (id: string, action: DestinationWarning["action"]) => void;
};

/* ─────────────────────────────────────────────────────────────
 * Uniform tile height = 136px
 * (header row + quality pill + footer slot, footer always reserves space)
 * ──────────────────────────────────────────────────────────── */
const TILE_HEIGHT = 136;

export function DestinationCard({
  destination,
  enabled,
  qualityIndex,
  warningActive,
  resolveState,
  onToggle,
  onCycleQuality,
  onWarningAction,
}: DestinationCardProps) {
  const { id, platform, color, connected, qualities, icon, warning } =
    destination;
  const currentQuality =
    qualities[Math.min(qualityIndex, qualities.length - 1)];
  const canCycle = qualities.length > 1 && connected;

  const disconnected = !connected;
  const showWarning = warningActive && warning !== undefined;
  const showFooter = showWarning || disconnected;

  const WarningIcon =
    warning?.kind === "key"
      ? KeyRound
      : warning?.kind === "disconnected"
        ? Plug
        : AlertTriangle;

  return (
    <motion.div variants={fadeUp} layout className="relative">
      <Card
        interactive={!disconnected}
        onClick={() => !disconnected && onToggle(id, !enabled)}
        className={cn(
          "flex flex-col gap-0 p-0",
          disconnected && "opacity-75",
          enabled &&
            "border-brand-500/50 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1),0_0_0_1px_rgba(124,92,255,0.3),0_0_40px_-10px_rgba(124,92,255,0.5)]"
        )}
        style={{ minHeight: TILE_HEIGHT }}
      >
        {/* MAIN content — flex-1 so it fills remaining space above the footer slot */}
        <CardContent className="flex flex-1 flex-col gap-3 p-4">
          {/* platform + switch */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="relative flex size-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-hairline overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, ${color}33 0%, ${color}11 100%)`,
                }}
                aria-hidden
              >
                <div
                  className="absolute inset-0"
                  style={{
                    background: `radial-gradient(80% 80% at 30% 20%, ${color}55, transparent 70%)`,
                  }}
                />
                <span className="relative" style={{ color }}>
                  {icon}
                </span>
              </div>
              <span className="text-[0.875rem] font-medium text-fg-primary truncate">
                {platform}
              </span>
            </div>

            <div
              className="flex items-center shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              <Switch
                checked={enabled}
                disabled={disconnected}
                onCheckedChange={(checked) => onToggle(id, checked)}
                aria-label={`Broadcast to ${platform}`}
              />
            </div>
          </div>

          {/* quality cycler — first-class pill control */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (canCycle) onCycleQuality(id);
            }}
            disabled={!canCycle}
            className={cn(
              "group/q inline-flex items-center gap-1.5 w-fit",
              "h-8 px-2.5 rounded-[var(--radius-sm)]",
              "text-[0.75rem] tabular-nums text-fg-muted",
              "border border-hairline bg-white/[0.02]",
              "transition-colors",
              canCycle &&
                "hover:bg-white/[0.05] hover:border-hairline-strong hover:text-fg-primary cursor-pointer",
              !canCycle && "cursor-default opacity-70"
            )}
            title={canCycle ? "Cycle quality" : undefined}
            aria-label={`Quality: ${currentQuality.quality} at ${currentQuality.bitrate} Mbps${canCycle ? ". Tap to cycle." : ""}`}
          >
            <span className="text-fg-primary font-medium">
              {currentQuality.quality}
            </span>
            <span className="text-fg-subtle">·</span>
            <span>{currentQuality.bitrate.toFixed(1)} Mbps</span>
            {canCycle && (
              <ChevronDown className="size-3 opacity-50 group-hover/q:opacity-90 transition-opacity" />
            )}
          </button>
        </CardContent>

        {/* FOOTER slot — always reserves space so tile heights match across the grid.
            Rendered empty when there's no warning/disconnect. */}
        <div className="shrink-0" style={{ minHeight: 1 }}>
          <AnimatePresence initial={false} mode="wait">
            {showFooter ? (
              <motion.div
                key="warn-row"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: revealDuration, ease: easeOutExpo }}
                className={cn(
                  "flex items-center justify-between gap-2 px-4 py-2.5",
                  "border-t border-hairline",
                  disconnected
                    ? "bg-warn/[0.06]"
                    : warning?.severity === "bad"
                      ? "bg-live/[0.06]"
                      : "bg-warn/[0.06]"
                )}
                onClick={(e) => e.stopPropagation()}
              >
                <span
                  className={cn(
                    "inline-flex items-center gap-2 text-[0.75rem] min-w-0",
                    disconnected
                      ? "text-warn"
                      : warning?.severity === "bad"
                        ? "text-live"
                        : "text-warn"
                  )}
                >
                  <WarningIcon className="size-3.5 shrink-0" />
                  <span className="truncate">
                    {disconnected
                      ? "Not connected"
                      : (warning as DestinationWarning).label}
                  </span>
                </span>
                <button
                  type="button"
                  disabled={resolveState === "working"}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (disconnected) {
                      onWarningAction(id, {
                        label: "Reconnect",
                        kind: "reconnect",
                      });
                    } else if (warning) {
                      onWarningAction(id, warning.action);
                    }
                  }}
                  className={cn(
                    "inline-flex items-center gap-1.5 h-7 px-2.5 rounded-[var(--radius-sm)]",
                    "text-[0.75rem] font-medium shrink-0",
                    "border border-hairline bg-white/[0.04] text-fg-primary",
                    "hover:bg-white/[0.08] transition-colors",
                    "disabled:opacity-60 disabled:cursor-not-allowed"
                  )}
                >
                  {resolveState === "working" && (
                    <span
                      className="size-3 rounded-full border border-fg-muted/60 border-t-fg-primary animate-spin"
                      aria-hidden
                    />
                  )}
                  <span>
                    {resolveState === "working"
                      ? getWorkingLabel(
                          disconnected
                            ? "reconnect"
                            : (warning as DestinationWarning).action.kind
                        )
                      : disconnected
                        ? "Reconnect"
                        : (warning as DestinationWarning).action.label}
                  </span>
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="empty-footer"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="h-[41px]" /* matches footer row height (~41px incl. border-t) */
                aria-hidden
              />
            )}
          </AnimatePresence>
        </div>

        {/* active sweep at tile bottom */}
        <AnimatePresence>
          {enabled && (
            <motion.div
              key="active-sweep"
              initial={{ opacity: 0, scaleX: 0.4 }}
              animate={{ opacity: 1, scaleX: 1 }}
              exit={{ opacity: 0, scaleX: 0.4 }}
              transition={{ duration: 0.35, ease: easeOutExpo }}
              className="pointer-events-none absolute inset-x-4 bottom-0 h-[2px] origin-center bg-gradient-to-r from-transparent via-brand-500 to-transparent"
              aria-hidden
            />
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}

function getWorkingLabel(kind: DestinationWarning["action"]["kind"]) {
  switch (kind) {
    case "rotate":
      return "Rotating…";
    case "reconnect":
      return "Reconnecting…";
    case "lower-quality":
      return "Applying…";
  }
}

// Helper export: map warning kind to icon (used in other surfaces)
export function warningIconFor(kind: WarningKind) {
  switch (kind) {
    case "key":
      return KeyRound;
    case "disconnected":
      return Plug;
    case "bitrate":
    default:
      return TrendingDown;
  }
}

export const DESTINATIONS_BASE: Omit<Destination, "icon">[] = [
  {
    id: "twitch",
    platform: "Twitch",
    color: "#9146FF",
    connected: true,
    qualities: [
      { quality: "1080p60", bitrate: 6.0 },
      { quality: "720p60", bitrate: 4.0 },
      { quality: "720p30", bitrate: 2.5 },
    ],
  },
  {
    id: "youtube",
    platform: "YouTube",
    color: "#FF0033",
    connected: true,
    qualities: [
      { quality: "1080p60", bitrate: 4.5 },
      { quality: "1080p30", bitrate: 3.0 },
      { quality: "720p30", bitrate: 2.0 },
    ],
    warning: {
      kind: "key",
      severity: "warn",
      label: "Stream key expires in 3 days",
      detail: "Rotate the stream key to avoid interruption.",
      action: { label: "Rotate", kind: "rotate" },
    },
  },
  {
    id: "facebook",
    platform: "Facebook",
    color: "#1877F2",
    connected: true,
    qualities: [
      { quality: "1080p60", bitrate: 4.0 },
      { quality: "720p30", bitrate: 2.5 },
    ],
  },
  {
    id: "x",
    platform: "X",
    color: "#e5e5ea",
    connected: true,
    qualities: [{ quality: "720p30", bitrate: 2.5 }],
  },
  {
    id: "linkedin",
    platform: "LinkedIn",
    color: "#0A66C2",
    connected: false,
    qualities: [{ quality: "720p30", bitrate: 3.0 }],
  },
  {
    id: "kick",
    platform: "Kick",
    color: "#53FC18",
    connected: true,
    qualities: [
      { quality: "1080p60", bitrate: 6.0 },
      { quality: "720p60", bitrate: 4.0 },
    ],
  },
];

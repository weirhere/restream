"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Menu } from "@base-ui/react/menu";
import {
  AlertTriangle,
  ChevronDown,
  KeyRound,
  Plug,
  Settings2,
  TrendingDown,
  Check,
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

export type DestinationOverride = {
  title?: string;
  description?: string;
  category?: string;
};

type ResolveState = "idle" | "working" | "done";

type DestinationCardProps = {
  destination: Destination;
  enabled: boolean;
  qualityIndex: number;
  override?: DestinationOverride;
  warningActive: boolean;
  resolveState: ResolveState;
  onToggle: (id: string, next: boolean) => void;
  onSetQuality: (id: string, nextIndex: number) => void;
  onWarningAction: (id: string, action: DestinationWarning["action"]) => void;
  onOpenOverride: (id: string) => void;
};

const TILE_HEIGHT = 136;

export function DestinationCard({
  destination,
  enabled,
  qualityIndex,
  override,
  warningActive,
  resolveState,
  onToggle,
  onSetQuality,
  onWarningAction,
  onOpenOverride,
}: DestinationCardProps) {
  const { id, platform, color, connected, qualities, icon, warning } =
    destination;
  const currentIdx = Math.min(qualityIndex, qualities.length - 1);
  const currentQuality = qualities[currentIdx];
  const canChooseQuality = qualities.length > 1 && connected;

  const disconnected = !connected;
  const showWarning = warningActive && warning !== undefined;
  const showFooter = showWarning || disconnected;

  const hasOverride = Boolean(
    override?.title || override?.description || override?.category
  );

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
        onClick={(e) => {
          // don't toggle when the click came from an interactive inner element
          const target = e.target as HTMLElement;
          if (target.closest("[data-stop-toggle]")) return;
          if (!disconnected) onToggle(id, !enabled);
        }}
        className={cn(
          "flex flex-col gap-0 p-0",
          disconnected && "opacity-75",
          enabled &&
            "border-brand-500/50 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1),0_0_0_1px_rgba(124,92,255,0.3),0_0_40px_-10px_rgba(124,92,255,0.5)]"
        )}
        style={{ minHeight: TILE_HEIGHT }}
      >
        <CardContent className="flex flex-1 flex-col gap-3 p-4">
          {/* Header: icon + platform + (override dot) + switch + gear */}
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
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-[0.875rem] font-medium text-fg-primary truncate">
                  {platform}
                </span>
                {hasOverride && (
                  <span
                    className="inline-flex items-center h-5 px-1.5 rounded-full text-[0.625rem] font-medium text-brand-300 border border-brand-500/30 bg-brand-500/10"
                    title="This destination has per-platform overrides"
                  >
                    Custom
                  </span>
                )}
              </div>
            </div>

            <div
              data-stop-toggle
              className="flex items-center gap-1.5 shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => onOpenOverride(id)}
                disabled={disconnected}
                title="Override title/description for this platform"
                className={cn(
                  "inline-flex items-center justify-center size-7 rounded-[var(--radius-sm)]",
                  "text-fg-subtle hover:text-fg-primary hover:bg-white/[0.05] transition-colors",
                  "disabled:opacity-40 disabled:cursor-not-allowed"
                )}
                aria-label={`Override details for ${platform}`}
              >
                <Settings2 className="size-3.5" />
              </button>
              <Switch
                checked={enabled}
                disabled={disconnected}
                onCheckedChange={(checked) => onToggle(id, checked)}
                aria-label={`Broadcast to ${platform}`}
              />
            </div>
          </div>

          {/* Quality menu (replaces cycler) */}
          <div data-stop-toggle onClick={(e) => e.stopPropagation()}>
            <QualityMenu
              qualities={qualities}
              currentIdx={currentIdx}
              disabled={!canChooseQuality}
              onSelect={(idx) => onSetQuality(id, idx)}
            />
          </div>
        </CardContent>

        {/* Footer: warning or reserved spacer */}
        <div className="shrink-0">
          <AnimatePresence initial={false} mode="wait">
            {showFooter ? (
              <motion.div
                key="warn-row"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: revealDuration, ease: easeOutExpo }}
                data-stop-toggle
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
                  onClick={() => {
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
                className="h-[41px]"
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

/* ─────────────────────────────────────────────────────────────
 * QualityMenu — proper dropdown, replacing the tap-to-cycle button.
 * Uses Base UI's Menu primitive.
 * ──────────────────────────────────────────────────────────── */
function QualityMenu({
  qualities,
  currentIdx,
  disabled,
  onSelect,
}: {
  qualities: QualityOption[];
  currentIdx: number;
  disabled: boolean;
  onSelect: (idx: number) => void;
}) {
  const current = qualities[currentIdx];
  return (
    <Menu.Root>
      <Menu.Trigger
        disabled={disabled}
        className={cn(
          "group/q inline-flex items-center gap-1.5 w-fit",
          "h-8 px-2.5 rounded-[var(--radius-sm)]",
          "text-[0.75rem] tabular-nums text-fg-muted",
          "border border-hairline bg-white/[0.02]",
          "transition-colors outline-none",
          !disabled &&
            "hover:bg-white/[0.05] hover:border-hairline-strong hover:text-fg-primary cursor-pointer",
          "data-[popup-open]:bg-white/[0.06] data-[popup-open]:border-hairline-strong data-[popup-open]:text-fg-primary",
          disabled && "cursor-default opacity-70",
          "focus-visible:ring-2 focus-visible:ring-brand-500/50"
        )}
      >
        <span className="text-fg-primary font-medium">{current.quality}</span>
        <span className="text-fg-subtle">·</span>
        <span>{current.bitrate.toFixed(1)} Mbps</span>
        {!disabled && (
          <ChevronDown className="size-3 opacity-60 group-hover/q:opacity-90 transition-opacity" />
        )}
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner sideOffset={6} align="start">
          <Menu.Popup
            className={cn(
              "z-50 min-w-[180px] rounded-[var(--radius-md)] p-1",
              "border border-hairline-strong bg-bg-elevated/95 backdrop-blur-xl",
              "shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5),inset_0_1px_0_0_rgba(255,255,255,0.06)]",
              "origin-top-left",
              "data-[starting-style]:opacity-0 data-[starting-style]:scale-95",
              "data-[ending-style]:opacity-0 data-[ending-style]:scale-95",
              "transition-[opacity,transform] duration-150 ease-out"
            )}
          >
            {qualities.map((q, i) => {
              const isCurrent = i === currentIdx;
              return (
                <Menu.Item
                  key={q.quality + i}
                  onClick={() => onSelect(i)}
                  className={cn(
                    "flex items-center justify-between gap-3 px-2.5 py-2 rounded-[var(--radius-sm)]",
                    "text-[0.8125rem] cursor-pointer outline-none",
                    "data-[highlighted]:bg-white/[0.06]",
                    isCurrent && "text-fg-primary",
                    !isCurrent && "text-fg-muted"
                  )}
                >
                  <span className="flex items-center gap-2">
                    {isCurrent ? (
                      <Check className="size-3.5 text-brand-400" aria-hidden />
                    ) : (
                      <span className="size-3.5" aria-hidden />
                    )}
                    <span className="font-medium tabular-nums">
                      {q.quality}
                    </span>
                  </span>
                  <span className="text-fg-subtle tabular-nums text-[0.75rem]">
                    {q.bitrate.toFixed(1)} Mbps
                  </span>
                </Menu.Item>
              );
            })}
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
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

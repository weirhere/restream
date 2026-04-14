"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { AlertTriangle, Check, KeyRound } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { fadeUp } from "@/lib/motion";

export type DestinationWarning = {
  severity: "warn" | "bad";
  label: string; // short label on the tile
  detail?: string; // longer hover/aria text
  icon?: "key" | "alert";
};

export type Destination = {
  id: string;
  name: string;
  platform: string;
  handle: string;
  color: string; // platform accent
  connected: boolean;
  bitrate: number; // Mbps required at chosen quality
  quality: string; // e.g. "1080p60"
  icon: React.ReactNode;
  warning?: DestinationWarning;
};

type DestinationCardProps = {
  destination: Destination;
  enabled: boolean;
  onToggle: (id: string, next: boolean) => void;
};

export function DestinationCard({
  destination,
  enabled,
  onToggle,
}: DestinationCardProps) {
  const { id, platform, handle, color, connected, bitrate, quality, icon, warning } =
    destination;
  const disabled = !connected;

  const WarningIcon =
    warning?.icon === "key"
      ? KeyRound
      : warning?.icon === "alert" || warning
        ? AlertTriangle
        : null;

  return (
    <motion.div variants={fadeUp} className="relative" layout>
      <Card
        interactive={!disabled}
        onClick={() => !disabled && onToggle(id, !enabled)}
        className={cn(
          "min-h-[148px] gap-3 py-4",
          disabled && "opacity-70",
          enabled &&
            "border-brand-500/45 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1),0_0_0_1px_rgba(124,92,255,0.3),0_0_40px_-10px_rgba(124,92,255,0.5)]"
        )}
      >
        <CardContent className="flex flex-col gap-3 pt-0.5 pb-0">
          {/* platform header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={cn(
                  "relative flex size-10 shrink-0 items-center justify-center rounded-[10px]",
                  "border border-hairline overflow-hidden"
                )}
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
              <div className="flex flex-col leading-tight min-w-0">
                <span className="text-[0.9375rem] font-medium text-fg-primary truncate">
                  {platform}
                </span>
                <span className="text-[0.75rem] text-fg-subtle truncate">
                  {handle}
                </span>
              </div>
            </div>

            <div
              className="flex items-center shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              <Switch
                checked={enabled}
                disabled={disabled}
                onCheckedChange={(checked) => onToggle(id, checked)}
                aria-label={`Broadcast to ${platform}`}
              />
            </div>
          </div>

          {/* meta row: quality + bitrate */}
          <div className="flex items-center gap-2 text-[0.75rem]">
            <span className="text-fg-muted tabular-nums">{quality}</span>
            <span className="text-fg-subtle">·</span>
            <span className="text-fg-muted tabular-nums">
              {bitrate.toFixed(1)} Mbps
            </span>
          </div>

          {/* footer: status / warning */}
          <div className="flex items-center justify-between gap-2">
            {!connected ? (
              <button
                type="button"
                className="inline-flex items-center gap-1.5 text-[0.75rem] font-medium text-warn hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                <AlertTriangle className="size-3.5" />
                Reconnect
              </button>
            ) : warning ? (
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 text-[0.75rem]",
                  warning.severity === "bad" ? "text-live" : "text-warn"
                )}
                title={warning.detail}
              >
                {WarningIcon && <WarningIcon className="size-3.5" />}
                <span className="truncate">{warning.label}</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-[0.75rem] text-success">
                <Check className="size-3.5" />
                Ready
              </span>
            )}
            <Avatar size="sm" className="ml-auto">
              <AvatarFallback className="text-[0.625rem]">
                {handle.replace(/[^a-zA-Z]/g, "").slice(0, 2).toUpperCase() ||
                  platform.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* active sweep */}
          <AnimatePresence>
            {enabled && (
              <motion.div
                key="active-sweep"
                initial={{ opacity: 0, scaleX: 0.4 }}
                animate={{ opacity: 1, scaleX: 1 }}
                exit={{ opacity: 0, scaleX: 0.4 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="absolute inset-x-4 bottom-0 h-[2px] origin-center bg-gradient-to-r from-transparent via-brand-500 to-transparent"
                aria-hidden
              />
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      <Badge
        variant={enabled ? "brand" : "neutral"}
        size="sm"
        className="absolute -top-2 left-4 z-10 select-none pointer-events-none"
      >
        {enabled ? "On" : "Off"}
      </Badge>
    </motion.div>
  );
}

export const DESTINATIONS_BASE: Omit<Destination, "icon">[] = [
  {
    id: "twitch",
    name: "twitch.tv/andyweirdev",
    platform: "Twitch",
    handle: "andyweirdev",
    color: "#9146FF",
    connected: true,
    bitrate: 6.0,
    quality: "1080p60",
  },
  {
    id: "youtube",
    name: "YouTube Live",
    platform: "YouTube",
    handle: "@restream-playground",
    color: "#FF0033",
    connected: true,
    bitrate: 4.5,
    quality: "1080p60",
    warning: {
      severity: "warn",
      label: "Key expires in 3 days",
      detail: "Stream key rotates on 2026-04-17. Reconnect before then to avoid interruption.",
      icon: "key",
    },
  },
  {
    id: "facebook",
    name: "Facebook Live",
    platform: "Facebook",
    handle: "Restream Dev",
    color: "#1877F2",
    connected: true,
    bitrate: 4.0,
    quality: "1080p60",
  },
  {
    id: "x",
    name: "X (formerly Twitter)",
    platform: "X",
    handle: "@andyweirdev",
    color: "#e5e5ea",
    connected: true,
    bitrate: 2.5,
    quality: "720p30",
  },
  {
    id: "linkedin",
    name: "LinkedIn Live",
    platform: "LinkedIn",
    handle: "Andy Weir",
    color: "#0A66C2",
    connected: false,
    bitrate: 3.0,
    quality: "720p30",
  },
  {
    id: "kick",
    name: "kick.com/andyweir",
    platform: "Kick",
    handle: "andyweir",
    color: "#53FC18",
    connected: true,
    bitrate: 6.0,
    quality: "1080p60",
    warning: {
      severity: "warn",
      label: "High bitrate target",
      detail: "Kick recommends 6 Mbps at 1080p60. Close to your upload headroom.",
      icon: "alert",
    },
  },
];

"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { fadeUp } from "@/lib/motion";

export type Destination = {
  id: string;
  name: string;
  platform: string;
  handle: string;
  color: string; // platform brand accent
  connected: boolean;
  viewers?: number;
  icon: React.ReactNode;
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
  const { id, name, platform, handle, color, connected, icon } = destination;
  const disabled = !connected;

  return (
    <motion.div
      variants={fadeUp}
      className="relative"
      onClick={() => !disabled && onToggle(id, !enabled)}
    >
      <Card
        interactive={!disabled}
        className={cn(
          "min-h-[140px]",
          disabled && "opacity-55",
          enabled &&
            "border-brand-500/40 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1),0_0_0_1px_rgba(124,92,255,0.3),0_0_40px_-10px_rgba(124,92,255,0.5)]"
        )}
      >
        <CardContent className="flex flex-col gap-4 pt-1">
          {/* platform header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "relative flex size-10 items-center justify-center rounded-[10px]",
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
                <span
                  className="relative text-[18px]"
                  style={{ color }}
                >
                  {icon}
                </span>
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-[0.9375rem] font-medium text-fg-primary">
                  {platform}
                </span>
                <span className="text-[0.75rem] text-fg-subtle">{name}</span>
              </div>
            </div>

            <div
              className="flex items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <Switch
                checked={enabled}
                disabled={disabled}
                onCheckedChange={(checked) => onToggle(id, checked)}
                aria-label={`Stream to ${platform}`}
              />
            </div>
          </div>

          {/* divider */}
          <div className="h-px bg-hairline" />

          {/* account row */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <Avatar size="sm">
                <AvatarFallback className="text-[0.625rem]">
                  {handle.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="truncate text-[0.8125rem] text-fg-muted">
                {handle}
              </span>
            </div>
            {connected ? (
              <Badge variant="success" size="sm">
                <Check /> Linked
              </Badge>
            ) : (
              <Badge variant="warn" size="sm">
                Reconnect
              </Badge>
            )}
          </div>

          {/* active ring — anchored to bottom when enabled */}
          <AnimatePresence>
            {enabled && (
              <motion.div
                key="active-shimmer"
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
    </motion.div>
  );
}

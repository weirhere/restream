"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "motion/react";
import {
  Plus,
  Eye,
  Clock,
  TrendingUp,
  TrendingDown,
  Radio,
} from "lucide-react";
import { TopBar } from "@/components/app/topbar";
import { Button } from "@/components/ui/button";
import { useStreams, relativeTime, type StreamRecord } from "@/lib/streams-store";
import { StreamSummaryModal } from "@/components/stream/stream-summary-modal";
import { fadeUp, stagger, easeOutExpo } from "@/lib/motion";
import { cn } from "@/lib/utils";

export default function StreamsPage() {
  const { streams } = useStreams();
  const [activeSummary, setActiveSummary] = React.useState<StreamRecord | null>(
    null
  );

  return (
    <>
      <TopBar />

      <main className="mx-auto flex w-full max-w-[1100px] flex-1 flex-col gap-6 px-6 py-8 md:px-10">
        {/* Page header */}
        <motion.header
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="flex items-end justify-between gap-4"
        >
          <motion.div variants={fadeUp} className="flex flex-col gap-1">
            <h1 className="text-[1.5rem] font-semibold tracking-tight text-fg-primary">
              Streams
            </h1>
            <p className="text-[0.8125rem] text-fg-muted">
              {streams.length === 0
                ? "Your broadcasts will appear here once you go live."
                : `${streams.length} ${streams.length === 1 ? "stream" : "streams"} · most recent first`}
            </p>
          </motion.div>
          <motion.div variants={fadeUp}>
            <NewStreamButton />
          </motion.div>
        </motion.header>

        {/* List */}
        {streams.length === 0 ? (
          <EmptyState />
        ) : (
          <motion.ul
            variants={stagger}
            initial="hidden"
            animate="visible"
            className="flex flex-col gap-2"
          >
            {streams.map((s) => (
              <StreamRow
                key={s.id}
                stream={s}
                onView={() => setActiveSummary(s)}
              />
            ))}
          </motion.ul>
        )}
      </main>

      <StreamSummaryModal
        open={activeSummary !== null}
        onClose={() => setActiveSummary(null)}
        data={
          activeSummary
            ? {
                endedAt: activeSummary.endedAt,
                destinations: activeSummary.destinations,
                duration: activeSummary.duration,
                peakViewers: activeSummary.peakViewers,
                deltaPct: activeSummary.deltaPct,
              }
            : null
        }
      />
    </>
  );
}

function NewStreamButton() {
  return (
    <Link
      href="/stream/new"
      className={cn(
        "group/cta inline-flex items-center gap-2 h-10 px-5 rounded-[var(--radius-md)]",
        "text-[0.875rem] font-semibold tracking-tight text-white",
        "bg-gradient-brand border border-white/10",
        "shadow-[0_0_0_1px_rgba(124,92,255,0.15),0_8px_24px_-8px_rgba(124,92,255,0.55)]",
        "transition-shadow duration-200",
        "hover:shadow-[0_0_0_1px_rgba(124,92,255,0.3),0_12px_40px_-8px_rgba(124,92,255,0.7)]"
      )}
    >
      <Plus className="size-4" />
      New stream
    </Link>
  );
}

function StreamRow({
  stream,
  onView,
}: {
  stream: StreamRecord;
  onView: () => void;
}) {
  const trendUp = stream.deltaPct >= 0;
  const TrendIcon = trendUp ? TrendingUp : TrendingDown;
  return (
    <motion.li variants={fadeUp}>
      <button
        type="button"
        onClick={onView}
        className={cn(
          "group/row w-full text-left",
          "flex items-center gap-4 rounded-[var(--radius-md)]",
          "border border-hairline bg-white/[0.02] px-4 py-3",
          "transition-[background-color,border-color,box-shadow] duration-200 ease-out",
          "hover:bg-white/[0.04] hover:border-hairline-strong",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50"
        )}
      >
        {/* Title + meta */}
        <div className="flex flex-col min-w-0 flex-1 gap-1.5">
          <span className="text-[0.9375rem] font-medium text-fg-primary truncate">
            {stream.title}
          </span>
          <div className="flex items-center gap-3 text-[0.75rem] text-fg-subtle flex-wrap">
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-3" />
              {relativeTime(stream.endedAt)} · {stream.duration}
            </span>
            <span aria-hidden>·</span>
            <DestinationChips destinations={stream.destinations} />
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-5 shrink-0">
          <div className="flex items-baseline gap-1.5">
            <Eye className="size-3.5 text-fg-subtle" aria-hidden />
            <span className="text-[0.875rem] font-medium text-fg-primary tabular-nums">
              {stream.peakViewers.toLocaleString()}
            </span>
          </div>
          <div
            className={cn(
              "inline-flex items-center gap-1 text-[0.75rem] font-medium tabular-nums",
              trendUp ? "text-success" : "text-warn"
            )}
          >
            <TrendIcon className="size-3" />
            {trendUp ? "+" : ""}
            {stream.deltaPct}%
          </div>
        </div>
      </button>
    </motion.li>
  );
}

const PLATFORM_COLOR: Record<string, string> = {
  Twitch: "#9146FF",
  YouTube: "#FF0033",
  Facebook: "#1877F2",
  X: "#e5e5ea",
  LinkedIn: "#0A66C2",
  Kick: "#53FC18",
};

function DestinationChips({ destinations }: { destinations: string[] }) {
  const visible = destinations.slice(0, 3);
  const overflow = destinations.length - visible.length;
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="inline-flex -space-x-1">
        {visible.map((d) => (
          <span
            key={d}
            className="inline-flex items-center justify-center size-4 rounded-full border border-bg-base"
            style={{ background: PLATFORM_COLOR[d] ?? "#666" }}
            title={d}
            aria-label={d}
          />
        ))}
      </span>
      <span>
        {visible.join(", ")}
        {overflow > 0 && ` +${overflow}`}
      </span>
    </span>
  );
}

function EmptyState() {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      transition={{ duration: 0.4, ease: easeOutExpo }}
      className={cn(
        "flex flex-col items-center justify-center gap-4",
        "rounded-[var(--radius-lg)] border border-hairline bg-white/[0.02]",
        "px-6 py-16 text-center"
      )}
    >
      <div
        className={cn(
          "relative flex size-14 items-center justify-center rounded-full",
          "bg-gradient-brand text-white",
          "shadow-[0_0_0_1px_rgba(124,92,255,0.25),0_0_30px_-4px_rgba(124,92,255,0.6)]"
        )}
        aria-hidden
      >
        <Radio className="size-6" />
      </div>
      <div className="flex flex-col gap-1.5 max-w-md">
        <h2 className="text-[1.125rem] font-semibold text-fg-primary">
          No streams yet
        </h2>
        <p className="text-[0.875rem] text-fg-muted leading-relaxed">
          Start a new stream to broadcast to all your destinations at once.
          Past sessions will live here.
        </p>
      </div>
      <div className="mt-2">
        <NewStreamButton />
      </div>
    </motion.div>
  );
}

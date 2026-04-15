"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, X as XIcon, Settings2, Pencil } from "lucide-react";

import type { LiveState } from "@/components/app/live-indicator";
import { LiveIndicator } from "@/components/app/live-indicator";
import { cn } from "@/lib/utils";
import {
  DestinationCard,
  DESTINATIONS_BASE,
  type Destination,
  type DestinationOverride,
  type DestinationWarning,
} from "@/components/stream/destination-card";
import {
  PreFlightSummary,
  UPLOAD_MBPS,
  type FitRemedy,
} from "@/components/stream/pre-flight-summary";
import {
  TwitchIcon,
  YoutubeIcon,
  FacebookIcon,
  LinkedInIcon,
  KickIcon,
  XIcon as XBrandIcon,
} from "@/components/stream/brand-icons";
import { fadeUp, stagger, staggerTight, easeOutExpo } from "@/lib/motion";
import type { StreamPhase } from "@/components/stream/go-live-button";
import { SourceConfigModal } from "@/components/stream/source-config-modal";
import { DestinationOverrideModal } from "@/components/stream/destination-override-modal";
import { useToast } from "@/components/ui/toast";
import { useStreams } from "@/lib/streams-store";

const ICONS: Record<string, React.ReactNode> = {
  twitch: <TwitchIcon />,
  youtube: <YoutubeIcon />,
  facebook: <FacebookIcon />,
  x: <XBrandIcon />,
  linkedin: <LinkedInIcon />,
  kick: <KickIcon />,
};

const DESTINATIONS: Destination[] = DESTINATIONS_BASE.map((d) => ({
  ...d,
  icon: ICONS[d.id],
}));

const DEFAULT_TITLE = "Untitled stream";

type ResolveState = "idle" | "working" | "done";

export default function NewStreamPage() {
  const router = useRouter();
  const toast = useToast();
  const { recordStream } = useStreams();

  const [enabled, setEnabled] = React.useState<Record<string, boolean>>({
    twitch: true,
    youtube: true,
    facebook: false,
    x: false,
    linkedin: false,
    kick: false,
  });
  const [qualityIndex, setQualityIndex] = React.useState<Record<string, number>>({
    twitch: 0, youtube: 0, facebook: 0, x: 0, linkedin: 0, kick: 0,
  });
  const [resolvedWarnings, setResolvedWarnings] = React.useState<Record<string, boolean>>({});
  const [resolveState, setResolveState] = React.useState<Record<string, ResolveState>>({});
  const [connectedOverrides, setConnectedOverrides] = React.useState<Record<string, boolean>>({});
  const [destOverrides, setDestOverrides] = React.useState<Record<string, DestinationOverride>>({});

  const [title, setTitle] = React.useState(DEFAULT_TITLE);
  const [titleEditing, setTitleEditing] = React.useState(false);
  const [phase, setPhase] = React.useState<StreamPhase>("offline");
  const [countdown, setCountdown] = React.useState(3);

  const [sourceConfigOpen, setSourceConfigOpen] = React.useState(false);
  const [overrideForId, setOverrideForId] = React.useState<string | null>(null);

  const enabledCount = Object.values(enabled).filter(Boolean).length;

  const destinations = React.useMemo(
    () =>
      DESTINATIONS.map((d) => ({
        ...d,
        connected: connectedOverrides[d.id] ?? d.connected,
      })),
    [connectedOverrides]
  );

  function toggle(id: string, next: boolean) {
    setEnabled((prev) => ({ ...prev, [id]: next }));
  }

  function setQuality(id: string, nextIndex: number) {
    setQualityIndex((prev) => ({ ...prev, [id]: nextIndex }));
  }

  function handleWarningAction(id: string, action: DestinationWarning["action"]) {
    const platform = DESTINATIONS.find((d) => d.id === id)?.platform ?? "";
    setResolveState((prev) => ({ ...prev, [id]: "working" }));
    window.setTimeout(() => {
      if (action.kind === "reconnect") {
        setConnectedOverrides((prev) => ({ ...prev, [id]: true }));
        setResolvedWarnings((prev) => ({ ...prev, [id]: true }));
        toast.push({
          tone: "success",
          label: `${platform} reconnected`,
          detail: "You can now broadcast to this destination.",
        });
      } else if (action.kind === "rotate") {
        setResolvedWarnings((prev) => ({ ...prev, [id]: true }));
        toast.push({
          tone: "success",
          label: `${platform} stream key rotated`,
          detail: "Next expires in 90 days.",
        });
      } else if (action.kind === "lower-quality") {
        const dest = DESTINATIONS.find((d) => d.id === id);
        const current = qualityIndex[id] ?? 0;
        if (dest && current < dest.qualities.length - 1) {
          setQualityIndex((prev) => ({ ...prev, [id]: current + 1 }));
        }
      }
      setResolveState((prev) => ({ ...prev, [id]: "done" }));
    }, 500);
  }

  // Countdown driver
  React.useEffect(() => {
    if (phase !== "counting") return;
    if (countdown <= 0) {
      setPhase("live");
      return;
    }
    const t = window.setTimeout(() => setCountdown((n) => n - 1), 1000);
    return () => window.clearTimeout(t);
  }, [phase, countdown]);

  // Track elapsed live time for the duration label
  const liveStartedAtRef = React.useRef<number | null>(null);
  React.useEffect(() => {
    if (phase === "live" && liveStartedAtRef.current === null) {
      liveStartedAtRef.current = Date.now();
    }
    if (phase !== "live") {
      // reset only when fully back to offline (not countdown)
      if (phase === "offline") liveStartedAtRef.current = null;
    }
  }, [phase]);

  const onStart = () => {
    if (enabledCount === 0) return;
    setCountdown(3);
    setPhase("counting");
  };
  const onProceedAnyway = onStart;
  const onCancel = () => {
    setPhase("offline");
    setCountdown(3);
  };
  const onEnd = () => {
    const enabledList = destinations.filter((d) => enabled[d.id]);
    const destNames = enabledList.map((d) => d.platform);
    const startedAt = liveStartedAtRef.current ?? Date.now();
    const elapsedSec = Math.max(1, Math.floor((Date.now() - startedAt) / 1000));
    const duration = formatDuration(elapsedSec);
    // simulated audience metrics
    const peakViewers = Math.floor(180 + Math.random() * 220);
    const deltaPct = Math.floor(-5 + Math.random() * 30);
    const finalTitle = title.trim() || "Untitled stream";
    const record = recordStream({
      title: finalTitle,
      destinations: destNames,
      duration,
      peakViewers,
      deltaPct,
    });
    toast.push({
      tone: "success",
      label: `Stream ended · ${record.duration}`,
      detail: `${record.peakViewers} peak viewers across ${destNames.length} destinations.`,
      duration: 5000,
    });
    router.push("/streams");
  };

  const liveState: LiveState =
    phase === "live" ? "live" : phase === "counting" ? "starting" : "offline";

  // Compute remedy
  const remedy = React.useMemo<FitRemedy | undefined>(() => {
    const needed = destinations
      .filter((d) => enabled[d.id])
      .reduce((s, d) => s + d.qualities[qualityIndex[d.id] ?? 0].bitrate, 0);
    if (needed <= UPLOAD_MBPS) return undefined;

    let best: FitRemedy | undefined;
    for (const d of destinations) {
      if (!enabled[d.id]) continue;
      const curIdx = qualityIndex[d.id] ?? 0;
      for (let nextIdx = curIdx + 1; nextIdx < d.qualities.length; nextIdx++) {
        const cur = d.qualities[curIdx];
        const alt = d.qualities[nextIdx];
        const saved = cur.bitrate - alt.bitrate;
        if (needed - saved > UPLOAD_MBPS) continue;
        if (!best || saved < best.delta) {
          best = {
            kind: "lower-quality",
            destinationId: d.id,
            destinationName: d.platform,
            delta: saved,
            postFixNeeded: needed - saved,
            detail: `Reduce ${d.platform} to ${alt.quality} to fit (−${saved.toFixed(1)} Mbps)`,
            apply: () => {
              setQualityIndex((prev) => ({ ...prev, [d.id]: nextIdx }));
              toast.push({
                tone: "success",
                label: `Reduced ${d.platform} to ${alt.quality}`,
                detail: `Saved ${saved.toFixed(1)} Mbps · now fits upload.`,
              });
            },
          };
        }
      }
    }
    if (best) return best;

    const enabledSorted = destinations
      .filter((d) => enabled[d.id])
      .map((d) => ({ d, bitrate: d.qualities[qualityIndex[d.id] ?? 0].bitrate }))
      .sort((a, b) => b.bitrate - a.bitrate);
    const biggest = enabledSorted[0];
    if (biggest) {
      return {
        kind: "disable",
        destinationId: biggest.d.id,
        destinationName: biggest.d.platform,
        delta: biggest.bitrate,
        postFixNeeded: needed - biggest.bitrate,
        detail: `Disable ${biggest.d.platform} to fit (−${biggest.bitrate.toFixed(1)} Mbps)`,
        apply: () => {
          setEnabled((prev) => ({ ...prev, [biggest.d.id]: false }));
          toast.push({
            tone: "success",
            label: `${biggest.d.platform} disabled`,
            detail: `Saved ${biggest.bitrate.toFixed(1)} Mbps.`,
          });
        },
      };
    }
    return undefined;
  }, [destinations, enabled, qualityIndex, toast]);

  const onRetestUpload = () => {
    toast.push({
      tone: "info",
      label: "Running speed test…",
      detail: "Measuring upload capacity.",
      duration: 2000,
    });
    window.setTimeout(() => {
      toast.push({
        tone: "success",
        label: "Speed test complete",
        detail: "Upload cap · 8.4 Mbps (no change).",
      });
    }, 2200);
  };

  const currentOverrideDest = overrideForId
    ? destinations.find((d) => d.id === overrideForId) ?? null
    : null;

  return (
    <>
      {/* Session header — minimal: back/close + live status */}
      <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-hairline bg-bg-base/70 backdrop-blur-xl px-4 py-4">
        <Link
          href="/streams"
          className={cn(
            "inline-flex items-center gap-2 h-9 px-2.5 rounded-[var(--radius-sm)]",
            "text-[0.8125rem] text-fg-muted hover:text-fg-primary hover:bg-white/[0.04] transition-colors"
          )}
        >
          <ArrowLeft className="size-4" />
          Streams
        </Link>

        <LiveIndicator state={liveState} />

        <Link
          href="/streams"
          aria-label="Close session"
          className="inline-flex items-center justify-center size-9 rounded-[var(--radius-sm)] text-fg-subtle hover:text-fg-primary hover:bg-white/[0.04] transition-colors"
        >
          <XIcon className="size-4" />
        </Link>
      </header>

      <main className="mx-auto flex w-full max-w-[1100px] flex-1 flex-col gap-6 px-6 py-8 md:px-10">
        {/* Editable title */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <TitleField
            value={title}
            placeholder={DEFAULT_TITLE}
            editing={titleEditing}
            onStartEdit={() => setTitleEditing(true)}
            onCommit={(v) => {
              setTitle(v.trim() || DEFAULT_TITLE);
              setTitleEditing(false);
            }}
          />
        </motion.div>

        {/* Pre-flight summary (focused — no last-stream copy) */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <PreFlightSummary
            phase={phase}
            countdownValue={countdown}
            destinations={destinations}
            enabled={enabled}
            qualityIndex={qualityIndex}
            firstTime={true}
            lastStream={undefined}
            uploadSource={{
              label: "speed test 2m ago",
              onRetest: onRetestUpload,
            }}
            audio={{
              bitrateKbps: 192,
              lufs: -18.0,
              category: "Talk",
            }}
            remedy={remedy}
            onStart={onStart}
            onCancel={onCancel}
            onEnd={onEnd}
            onProceedAnyway={onProceedAnyway}
            onOpenSourceConfig={() => setSourceConfigOpen(true)}
          />
        </motion.div>

        {/* Destinations */}
        <motion.section
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="flex flex-col gap-3"
          aria-labelledby="destinations-heading"
        >
          <motion.div
            variants={fadeUp}
            className="flex items-end justify-between"
          >
            <div className="flex items-baseline gap-3">
              <h2
                id="destinations-heading"
                className="text-[1.125rem] font-semibold tracking-tight"
              >
                Destinations
              </h2>
              <span className="text-[0.75rem] text-fg-subtle tabular-nums">
                {enabledCount} of {DESTINATIONS.length}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setSourceConfigOpen(true)}
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-[var(--radius-sm)] text-[0.75rem] font-medium border border-hairline bg-white/[0.03] text-fg-muted hover:text-fg-primary hover:bg-white/[0.06] transition-colors"
            >
              <Settings2 className="size-3.5" />
              Source settings
            </button>
          </motion.div>

          <motion.div
            variants={staggerTight}
            initial="hidden"
            animate="visible"
            className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
          >
            {destinations.map((d) => (
              <DestinationCard
                key={d.id}
                destination={d}
                enabled={!!enabled[d.id]}
                qualityIndex={qualityIndex[d.id] ?? 0}
                override={destOverrides[d.id]}
                warningActive={!resolvedWarnings[d.id]}
                resolveState={resolveState[d.id] ?? "idle"}
                onToggle={toggle}
                onSetQuality={setQuality}
                onWarningAction={handleWarningAction}
                onOpenOverride={(id) => setOverrideForId(id)}
              />
            ))}
          </motion.div>
        </motion.section>
      </main>

      {/* Modals */}
      <SourceConfigModal
        open={sourceConfigOpen}
        onClose={() => setSourceConfigOpen(false)}
      />
      <DestinationOverrideModal
        open={overrideForId !== null}
        destination={currentOverrideDest}
        override={overrideForId ? destOverrides[overrideForId] : undefined}
        defaults={{ title, description: "", category: "Talk" }}
        onClose={() => setOverrideForId(null)}
        onSave={(id, next) => {
          setDestOverrides((prev) => ({ ...prev, [id]: next }));
          const platform = DESTINATIONS.find((d) => d.id === id)?.platform ?? "";
          toast.push({
            tone: "success",
            label: `${platform} details updated`,
            detail: "Will apply to this destination only.",
          });
        }}
        onClear={(id) => {
          setDestOverrides((prev) => {
            const next = { ...prev };
            delete next[id];
            return next;
          });
          const platform = DESTINATIONS.find((d) => d.id === id)?.platform ?? "";
          toast.push({
            tone: "info",
            label: `${platform} reverted to shared details`,
          });
        }}
      />
    </>
  );
}

function TitleField({
  value,
  placeholder,
  editing,
  onStartEdit,
  onCommit,
}: {
  value: string;
  placeholder: string;
  editing: boolean;
  onStartEdit: () => void;
  onCommit: (v: string) => void;
}) {
  const [draft, setDraft] = React.useState(value);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setDraft(value);
  }, [value, editing]);

  React.useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => onCommit(draft)}
        onKeyDown={(e) => {
          if (e.key === "Enter") onCommit(draft);
          if (e.key === "Escape") onCommit(value);
        }}
        placeholder={placeholder}
        className={cn(
          "block w-full bg-transparent outline-none",
          "text-[1.5rem] font-semibold tracking-tight text-fg-primary",
          "placeholder:text-fg-subtle"
        )}
      />
    );
  }
  return (
    <button
      type="button"
      onClick={onStartEdit}
      className={cn(
        "group/title flex items-center gap-2 text-left",
        "text-[1.5rem] font-semibold tracking-tight text-fg-primary",
        "hover:text-fg-primary transition-colors"
      )}
    >
      <span className={cn(value === placeholder && "text-fg-subtle")}>
        {value}
      </span>
      <Pencil className="size-4 text-fg-subtle opacity-0 group-hover/title:opacity-100 transition-opacity" />
    </button>
  );
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m < 60) return s === 0 ? `${m}m` : `${m}m ${s}s`;
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return mm === 0 ? `${h}h` : `${h}h ${mm}m`;
}

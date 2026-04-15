"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ChevronDown,
  X as XIconClose,
  CheckCircle2,
  History,
} from "lucide-react";

import { TopBar } from "@/components/app/topbar";
import type { LiveState } from "@/components/app/live-indicator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DestinationCard,
  DESTINATIONS_BASE,
  type Destination,
  type DestinationOverride,
  type DestinationWarning,
} from "@/components/stream/destination-card";
import { StreamHealth } from "@/components/stream/stream-health";
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
  XIcon,
} from "@/components/stream/brand-icons";
import { fadeUp, stagger, staggerTight, easeOutExpo } from "@/lib/motion";
import type { StreamPhase } from "@/components/stream/go-live-button";
import { SourceConfigModal } from "@/components/stream/source-config-modal";
import { StreamSummaryModal } from "@/components/stream/stream-summary-modal";
import { DestinationOverrideModal } from "@/components/stream/destination-override-modal";
import { FirstRunChecklist } from "@/components/stream/first-run-checklist";
import { useToast } from "@/components/ui/toast";
import { Hint, GLOSSARY } from "@/components/ui/hint";

const DEFAULT_TITLE =
  "Building restream-playground — live design engineering";

const CATEGORIES = [
  "Just Chatting",
  "Product Demo",
  "Gaming",
  "Music",
  "Software Dev",
  "Creative",
];

const ICONS: Record<string, React.ReactNode> = {
  twitch: <TwitchIcon />,
  youtube: <YoutubeIcon />,
  facebook: <FacebookIcon />,
  x: <XIcon />,
  linkedin: <LinkedInIcon />,
  kick: <KickIcon />,
};

const DESTINATIONS: Destination[] = DESTINATIONS_BASE.map((d) => ({
  ...d,
  icon: ICONS[d.id],
}));

type ResolveState = "idle" | "working" | "done";

type PostStream = {
  endedAt: number;
  destinations: string[];
  duration: string;
  peakViewers: number;
  deltaPct: number;
};

export default function StreamPage() {
  const toast = useToast();

  const [enabled, setEnabled] = React.useState<Record<string, boolean>>({
    twitch: true,
    youtube: true,
    facebook: false,
    x: false,
    linkedin: false,
    kick: false,
  });
  const [qualityIndex, setQualityIndex] = React.useState<Record<string, number>>({
    twitch: 0,
    youtube: 0,
    facebook: 0,
    x: 0,
    linkedin: 0,
    kick: 0,
  });
  const [resolvedWarnings, setResolvedWarnings] = React.useState<
    Record<string, boolean>
  >({});
  const [resolveState, setResolveState] = React.useState<
    Record<string, ResolveState>
  >({});
  const [connectedOverrides, setConnectedOverrides] = React.useState<
    Record<string, boolean>
  >({});
  const [destOverrides, setDestOverrides] = React.useState<
    Record<string, DestinationOverride>
  >({});

  const [category, setCategory] = React.useState("Software Dev");
  const [title, setTitle] = React.useState(DEFAULT_TITLE);
  const [description, setDescription] = React.useState(
    "Spinning up a fresh design system from scratch — Next.js, Tailwind, shadcn, motion. Chat along while we build."
  );
  const [detailsOpen, setDetailsOpen] = React.useState(false);

  const [phase, setPhase] = React.useState<StreamPhase>("offline");
  const [countdown, setCountdown] = React.useState(3);

  const [postStream, setPostStream] = React.useState<PostStream | null>(null);
  // First-time user state: show onboarding checklist until all steps
  // complete or user explicitly dismisses. Demo default is `true` so
  // new prototype visitors see the onboarded path first.
  const [firstTime, setFirstTime] = React.useState(true);
  const [tourDismissed, setTourDismissed] = React.useState(false);

  const [sourceConfigOpen, setSourceConfigOpen] = React.useState(false);
  const [summaryOpen, setSummaryOpen] = React.useState(false);
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

  const sortedDestinations = React.useMemo(() => {
    return [...destinations].sort((a, b) => {
      const ae = enabled[a.id] ? 1 : 0;
      const be = enabled[b.id] ? 1 : 0;
      if (ae !== be) return be - ae;
      if (a.connected !== b.connected) return a.connected ? -1 : 1;
      return 0;
    });
  }, [destinations, enabled]);

  function toggle(id: string, next: boolean) {
    setEnabled((prev) => ({ ...prev, [id]: next }));
  }

  function setQuality(id: string, nextIndex: number) {
    setQualityIndex((prev) => ({ ...prev, [id]: nextIndex }));
  }

  function handleWarningAction(
    id: string,
    action: DestinationWarning["action"]
  ) {
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
        const current = qualityIndex[id] ?? 0;
        const dest = DESTINATIONS.find((d) => d.id === id);
        if (dest && current < dest.qualities.length - 1) {
          setQualityIndex((prev) => ({ ...prev, [id]: current + 1 }));
        }
      }
      setResolveState((prev) => ({ ...prev, [id]: "done" }));
    }, 500);
  }

  React.useEffect(() => {
    if (phase !== "counting") return;
    if (countdown <= 0) {
      setPhase("live");
      return;
    }
    const t = window.setTimeout(() => setCountdown((n) => n - 1), 1000);
    return () => window.clearTimeout(t);
  }, [phase, countdown]);

  const onStart = () => {
    if (enabledCount === 0) return;
    setCountdown(3);
    setPhase("counting");
    setPostStream(null);
  };
  const onProceedAnyway = () => {
    if (enabledCount === 0) return;
    setCountdown(3);
    setPhase("counting");
    setPostStream(null);
  };
  const onCancel = () => {
    setPhase("offline");
    setCountdown(3);
  };
  const onEnd = () => {
    const destNames = destinations
      .filter((d) => enabled[d.id])
      .map((d) => d.platform);
    setPostStream({
      endedAt: Date.now(),
      destinations: destNames,
      duration: "42s",
      peakViewers: 287,
      deltaPct: 12,
    });
    setPhase("offline");
    setCountdown(3);
    setFirstTime(false);
  };

  const liveState: LiveState =
    phase === "live" ? "live" : phase === "counting" ? "starting" : "offline";

  const remedy = React.useMemo<FitRemedy | undefined>(() => {
    const needed = destinations
      .filter((d) => enabled[d.id])
      .reduce(
        (s, d) => s + d.qualities[qualityIndex[d.id] ?? 0].bitrate,
        0
      );
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
      .map((d) => ({
        d,
        bitrate: d.qualities[qualityIndex[d.id] ?? 0].bitrate,
      }))
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

  const lastStream = postStream
    ? {
        duration: postStream.duration,
        peakViewers: postStream.peakViewers,
        deltaPct: postStream.deltaPct,
        when: timeAgo(postStream.endedAt),
      }
    : firstTime
      ? undefined
      : {
          duration: "2h 14m",
          peakViewers: 342,
          deltaPct: 12,
          when: "yesterday",
        };

  const currentOverrideDest = overrideForId
    ? destinations.find((d) => d.id === overrideForId) ?? null
    : null;

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

  return (
    <>
      <TopBar liveState={liveState} />

      <main className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col gap-6 px-6 py-6 md:px-10 md:py-8">
        {/* First-run onboarding checklist — only while firstTime and not dismissed */}
        <AnimatePresence initial={false}>
          {firstTime && !tourDismissed && phase !== "counting" && (
            <FirstRunChecklist
              key="first-run"
              onDismiss={() => setTourDismissed(true)}
              steps={[
                {
                  id: "destination",
                  label: "Enable a destination",
                  hint: "Pick where you'll broadcast",
                  done: enabledCount > 0,
                },
                {
                  id: "title",
                  label: "Customize your title",
                  hint: "Edit from the Details row below",
                  done: title !== DEFAULT_TITLE,
                },
                {
                  id: "broadcast",
                  label: "Start your first broadcast",
                  hint: "Hit Go live when you're ready",
                  done: postStream !== null,
                },
              ]}
            />
          )}
        </AnimatePresence>

        <AnimatePresence initial={false}>
          {phase === "offline" && postStream && (
            <PostStreamBanner
              data={postStream}
              onViewSummary={() => setSummaryOpen(true)}
              onDismiss={() => setPostStream(null)}
            />
          )}
        </AnimatePresence>

        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <PreFlightSummary
            phase={phase}
            countdownValue={countdown}
            destinations={destinations}
            enabled={enabled}
            qualityIndex={qualityIndex}
            firstTime={firstTime}
            lastStream={lastStream}
            uploadSource={{ label: "speed test 2m ago", onRetest: onRetestUpload }}
            audio={{
              bitrateKbps: 192,
              lufs: category === "Music" ? -14.2 : -18.0,
              category,
            }}
            remedy={remedy}
            onStart={onStart}
            onCancel={onCancel}
            onEnd={onEnd}
            onProceedAnyway={onProceedAnyway}
            onOpenSourceConfig={() => setSourceConfigOpen(true)}
          />
        </motion.div>

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
            <div className="flex items-center gap-2">
              {postStream && (
                <button
                  type="button"
                  onClick={() => setSummaryOpen(true)}
                  className="inline-flex items-center gap-1.5 h-8 px-3 rounded-[var(--radius-sm)] text-[0.75rem] font-medium border border-hairline bg-white/[0.03] text-fg-muted hover:text-fg-primary hover:bg-white/[0.06] transition-colors"
                >
                  <History className="size-3.5" />
                  Last stream summary
                </button>
              )}
              <Button variant="outline" size="sm">
                Add destination
              </Button>
            </div>
          </motion.div>

          <motion.div
            variants={staggerTight}
            initial="hidden"
            animate="visible"
            className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
          >
            {sortedDestinations.map((d) => (
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

        <motion.section variants={fadeUp} initial="hidden" animate="visible">
          <UtilityFooter
            phase={phase}
            title={title}
            category={category}
            detailsOpen={detailsOpen}
            onToggleDetails={() => setDetailsOpen((v) => !v)}
          >
            {detailsOpen && (
              <DetailsForm
                title={title}
                setTitle={setTitle}
                description={description}
                setDescription={setDescription}
                category={category}
                setCategory={setCategory}
              />
            )}
          </UtilityFooter>
        </motion.section>
      </main>

      {/* Modals */}
      <SourceConfigModal
        open={sourceConfigOpen}
        onClose={() => setSourceConfigOpen(false)}
      />
      <StreamSummaryModal
        open={summaryOpen}
        onClose={() => setSummaryOpen(false)}
        data={postStream}
      />
      <DestinationOverrideModal
        open={overrideForId !== null}
        destination={currentOverrideDest}
        override={overrideForId ? destOverrides[overrideForId] : undefined}
        defaults={{ title, description, category }}
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

function timeAgo(ms: number): string {
  const seconds = Math.floor((Date.now() - ms) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return "yesterday";
}

function PostStreamBanner({
  data,
  onViewSummary,
  onDismiss,
}: {
  data: PostStream;
  onViewSummary: () => void;
  onDismiss: () => void;
}) {
  const destinations = data.destinations.join(", ");
  return (
    <motion.div
      key="post-stream"
      initial={{ opacity: 0, y: -8, height: 0 }}
      animate={{ opacity: 1, y: 0, height: "auto" }}
      exit={{ opacity: 0, y: -8, height: 0 }}
      transition={{ duration: 0.25, ease: easeOutExpo }}
      className="overflow-hidden"
    >
      <div className="flex items-center gap-3 rounded-[var(--radius-md)] border border-success/25 bg-success/[0.06] px-4 py-3">
        <CheckCircle2 className="size-4 text-success shrink-0" />
        <div className="flex flex-col min-w-0 flex-1 leading-tight">
          <span className="text-[0.875rem] font-medium text-fg-primary">
            Stream ended · {data.duration} · {data.peakViewers} peak viewers
          </span>
          <span className="text-[0.75rem] text-fg-subtle truncate">
            Broadcast to {destinations}. Summary available anytime.
          </span>
        </div>
        <button
          type="button"
          onClick={onViewSummary}
          className="inline-flex items-center h-8 px-3 rounded-[var(--radius-sm)] text-[0.75rem] font-medium border border-hairline bg-white/[0.04] text-fg-primary hover:bg-white/[0.08] transition-colors"
        >
          View summary
        </button>
        <button
          type="button"
          onClick={onDismiss}
          className="inline-flex items-center justify-center size-8 rounded-[var(--radius-sm)] text-fg-subtle hover:text-fg-primary hover:bg-white/[0.04] transition-colors"
          aria-label="Dismiss"
        >
          <XIconClose className="size-3.5" />
        </button>
      </div>
    </motion.div>
  );
}

function UtilityFooter({
  phase,
  title,
  category,
  detailsOpen,
  onToggleDetails,
  children,
}: {
  phase: StreamPhase;
  title: string;
  category: string;
  detailsOpen: boolean;
  onToggleDetails: () => void;
  children?: React.ReactNode;
}) {
  const showLivePreview = phase === "live";
  return (
    <div className="flex flex-col rounded-[var(--radius-lg)] border border-hairline bg-white/[0.02] overflow-hidden">
      <StreamHealth flush />
      <div className="h-px bg-hairline" />

      <button
        type="button"
        onClick={onToggleDetails}
        className={cn(
          "flex items-center gap-3 px-4 py-3 text-left transition-colors",
          "hover:bg-white/[0.02]"
        )}
        aria-expanded={detailsOpen}
      >
        <div className="flex flex-col min-w-0 flex-1 leading-tight">
          <span className="text-[0.875rem] font-medium text-fg-primary truncate">
            {title}
          </span>
          <span className="text-[0.75rem] text-fg-subtle">{category}</span>
        </div>
        <ChevronDown
          className={cn(
            "size-4 text-fg-subtle transition-transform shrink-0",
            detailsOpen && "rotate-180"
          )}
        />
      </button>

      <AnimatePresence initial={false}>
        {detailsOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: easeOutExpo }}
            className="overflow-hidden border-t border-hairline"
          >
            <div className="px-4 py-5">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>

      {showLivePreview && (
        <>
          <div className="h-px bg-hairline" />
          <LivePreview />
        </>
      )}
    </div>
  );
}

function DetailsForm({
  title,
  setTitle,
  description,
  setDescription,
  category,
  setCategory,
}: {
  title: string;
  setTitle: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
  category: string;
  setCategory: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-[0.75rem] text-fg-subtle -mt-1">
        Shared defaults — override per destination from any tile's settings button.
      </p>
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="stream-title"
          className="text-[0.75rem] font-medium text-fg-muted"
        >
          Title
        </label>
        <Input
          id="stream-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="stream-desc"
          className="text-[0.75rem] font-medium text-fg-muted"
        >
          Description
        </label>
        <Textarea
          id="stream-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <span className="text-[0.75rem] font-medium text-fg-muted">
          Category
        </span>
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map((c) => {
            const active = c === category;
            return (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                className={
                  active
                    ? "h-8 px-3 rounded-full text-[0.75rem] font-medium border border-brand-500/40 bg-brand-500/10 text-brand-300 shadow-[0_0_20px_-6px_rgba(124,92,255,0.5)] transition-all"
                    : "h-8 px-3 rounded-full text-[0.75rem] font-medium border border-hairline bg-white/[0.03] text-fg-muted hover:text-fg-primary hover:bg-white/[0.06] transition-colors"
                }
              >
                {c}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function LivePreview() {
  return (
    <div className="p-4">
      <div
        className="relative aspect-[16/7] overflow-hidden rounded-[var(--radius-md)] border border-hairline"
        style={{
          background:
            "radial-gradient(120% 100% at 30% 0%, rgba(124,92,255,0.35), transparent 60%), radial-gradient(100% 100% at 100% 100%, rgba(83,131,255,0.3), transparent 55%), #0b0b18",
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            type="button"
            aria-label="Play preview"
            className="group relative flex size-16 items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/20 transition-transform hover:scale-105 active:scale-95"
          >
            <span className="absolute inset-0 rounded-full bg-white/10 group-hover:bg-white/15 transition-colors" />
            <span
              className="relative size-0 border-y-[10px] border-y-transparent border-l-[16px] border-l-white ml-1 drop-shadow-[0_2px_6px_rgba(0,0,0,0.45)]"
              aria-hidden
            />
          </button>
        </div>
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[0.75rem] text-white/80">
          <span className="font-medium tabular-nums">Camera · Screen share</span>
          <span className="tabular-nums">
            Audio -18{" "}
            <Hint {...GLOSSARY.lufs} className="text-white/90">
              LUFS
            </Hint>
          </span>
        </div>
      </div>
    </div>
  );
}

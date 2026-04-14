"use client";

import * as React from "react";
import { motion } from "motion/react";

import { TopBar } from "@/components/app/topbar";
import {
  TwitchIcon,
  YoutubeIcon,
  FacebookIcon,
  LinkedInIcon,
  KickIcon,
  XIcon,
} from "@/components/stream/brand-icons";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DestinationCard,
  type Destination,
} from "@/components/stream/destination-card";
import { StreamHealth } from "@/components/stream/stream-health";
import { GoLiveButton } from "@/components/stream/go-live-button";
import { fadeUp, stagger, staggerTight } from "@/lib/motion";

const CATEGORIES = [
  "Just Chatting",
  "Product Demo",
  "Gaming",
  "Music",
  "Software Dev",
  "Creative",
];

const DESTINATIONS: Destination[] = [
  {
    id: "twitch",
    name: "twitch.tv/andyweirdev",
    platform: "Twitch",
    handle: "andyweirdev",
    color: "#9146FF",
    connected: true,
    icon: <TwitchIcon />,
  },
  {
    id: "youtube",
    name: "YouTube Live",
    platform: "YouTube",
    handle: "@restream-playground",
    color: "#FF0033",
    connected: true,
    icon: <YoutubeIcon />,
  },
  {
    id: "facebook",
    name: "Facebook Live",
    platform: "Facebook",
    handle: "Restream Dev",
    color: "#1877F2",
    connected: true,
    icon: <FacebookIcon />,
  },
  {
    id: "x",
    name: "X (formerly Twitter)",
    platform: "X",
    handle: "@andyweirdev",
    color: "#e5e5ea",
    connected: true,
    icon: <XIcon />,
  },
  {
    id: "linkedin",
    name: "LinkedIn Live",
    platform: "LinkedIn",
    handle: "Andy Weir",
    color: "#0A66C2",
    connected: false,
    icon: <LinkedInIcon />,
  },
  {
    id: "kick",
    name: "kick.com/andyweir",
    platform: "Kick",
    handle: "andyweir",
    color: "#53FC18",
    connected: true,
    icon: <KickIcon />,
  },
];

export default function StreamPage() {
  const [enabled, setEnabled] = React.useState<Record<string, boolean>>({
    twitch: true,
    youtube: true,
    facebook: false,
    x: false,
    linkedin: false,
    kick: false,
  });
  const [category, setCategory] = React.useState<string>("Software Dev");
  const [live, setLive] = React.useState(false);

  const enabledCount = Object.values(enabled).filter(Boolean).length;
  const armed = enabledCount > 0 && !live;

  function toggle(id: string, next: boolean) {
    setEnabled((prev) => ({ ...prev, [id]: next }));
  }

  return (
    <>
      <TopBar liveState={live ? "live" : "offline"} />

      <main className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col gap-8 px-6 py-8 md:px-10 md:py-10">
        {/* Header */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="flex flex-col gap-4"
        >
          <motion.div variants={fadeUp} className="flex items-center gap-3">
            <Badge variant={armed ? "brand" : "neutral"}>
              {live ? "Broadcasting" : armed ? "Armed" : "Idle"}
            </Badge>
            <span className="text-[0.75rem] text-fg-subtle">
              Session created just now
            </span>
          </motion.div>

          <motion.div
            variants={fadeUp}
            className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between"
          >
            <div>
              <h1 className="text-[2.25rem] font-semibold leading-[1.1] tracking-[-0.02em] md:text-[2.75rem]">
                <span className="text-gradient-brand">Stream Control Center</span>
              </h1>
              <p className="mt-1.5 max-w-xl text-sm text-fg-muted">
                Configure your broadcast, choose destinations, and go live to
                every platform at once.
              </p>
            </div>

            <GoLiveButton
              armed={armed}
              live={live}
              disabled={enabledCount === 0 && !live}
              destinationCount={enabledCount}
              onClick={() => setLive((l) => !l)}
            />
          </motion.div>
        </motion.div>

        {/* Main grid */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="grid gap-6 md:grid-cols-[1fr_360px]"
        >
          {/* Left column — details + destinations */}
          <div className="flex flex-col gap-6 min-w-0">
            {/* Stream details */}
            <motion.div variants={fadeUp}>
              <Card>
                <CardHeader>
                  <CardTitle>Stream details</CardTitle>
                  <CardDescription>
                    These appear on every destination that supports them.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4 pb-5">
                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="stream-title"
                      className="text-[0.75rem] font-medium uppercase tracking-[0.08em] text-fg-muted"
                    >
                      Title
                    </label>
                    <Input
                      id="stream-title"
                      defaultValue="Building restream-playground — live design engineering"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="stream-desc"
                      className="text-[0.75rem] font-medium uppercase tracking-[0.08em] text-fg-muted"
                    >
                      Description
                    </label>
                    <Textarea
                      id="stream-desc"
                      defaultValue="Spinning up a fresh design system from scratch — Next.js, Tailwind, shadcn, motion. Chat along while we build."
                      rows={3}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <span className="text-[0.75rem] font-medium uppercase tracking-[0.08em] text-fg-muted">
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
                                ? "h-8 px-3 rounded-full text-[0.8125rem] font-medium border border-brand-500/40 bg-brand-500/10 text-brand-300 shadow-[0_0_20px_-6px_rgba(124,92,255,0.5)] transition-all"
                                : "h-8 px-3 rounded-full text-[0.8125rem] font-medium border border-hairline bg-white/[0.03] text-fg-muted hover:text-fg-primary hover:bg-white/[0.06] transition-colors"
                            }
                          >
                            {c}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Destinations */}
            <motion.div variants={fadeUp} className="flex flex-col gap-3">
              <div className="flex items-end justify-between">
                <div>
                  <h2 className="text-[1.125rem] font-semibold tracking-tight">
                    Destinations
                  </h2>
                  <p className="text-[0.8125rem] text-fg-muted">
                    {enabledCount} of {DESTINATIONS.length} enabled
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Add destination
                </Button>
              </div>

              <motion.div
                variants={staggerTight}
                initial="hidden"
                animate="visible"
                className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3"
              >
                {DESTINATIONS.map((d) => (
                  <DestinationCard
                    key={d.id}
                    destination={d}
                    enabled={!!enabled[d.id]}
                    onToggle={toggle}
                  />
                ))}
              </motion.div>
            </motion.div>
          </div>

          {/* Right column — stream health + preview */}
          <div className="flex flex-col gap-6">
            <motion.div variants={fadeUp} className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h2 className="text-[1.125rem] font-semibold tracking-tight">
                  Stream health
                </h2>
                <span className="text-[0.6875rem] uppercase tracking-[0.1em] text-fg-subtle">
                  Last 30s
                </span>
              </div>
              <motion.div variants={staggerTight} initial="hidden" animate="visible">
                <StreamHealth />
              </motion.div>
            </motion.div>

            <motion.div variants={fadeUp}>
              <Card>
                <CardHeader>
                  <CardTitle>Preview</CardTitle>
                  <CardDescription>
                    What your audience will see at go-live.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div
                    className="relative aspect-video overflow-hidden rounded-[var(--radius-md)] border border-hairline"
                    style={{
                      background:
                        "radial-gradient(120% 100% at 30% 0%, rgba(124,92,255,0.35), transparent 60%), radial-gradient(100% 100% at 100% 100%, rgba(83,131,255,0.3), transparent 55%), #0b0b18",
                    }}
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="flex flex-col items-center gap-3 text-center">
                        <div className="relative flex size-14 items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/20">
                          <div className="absolute inset-0 rounded-full bg-brand-500/20 animate-pulse" />
                          <div className="relative size-0 border-y-[9px] border-y-transparent border-l-[14px] border-l-white ml-1" />
                        </div>
                        <span className="text-[0.75rem] font-medium text-fg-muted">
                          Camera + screen share
                        </span>
                      </div>
                    </div>
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      {live ? (
                        <Badge variant="live">
                          <span className="live-dot" /> Live
                        </Badge>
                      ) : (
                        <Badge variant="neutral">Preview</Badge>
                      )}
                    </div>
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[0.6875rem] text-white/80">
                      <span className="font-medium tabular-nums">
                        {live ? "00:00:42" : "00:00:00"}
                      </span>
                      <span className="tabular-nums">1080p · 60fps</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      </main>
    </>
  );
}

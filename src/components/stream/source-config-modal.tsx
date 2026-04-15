"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Video, Monitor, Mic, Camera, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { easeOutExpo } from "@/lib/motion";

type Source = {
  id: string;
  kind: "camera" | "screen" | "mic";
  label: string;
  detail: string;
  available: boolean;
  selected: boolean;
};

const INITIAL_SOURCES: Source[] = [
  {
    id: "camera-facetime",
    kind: "camera",
    label: "FaceTime HD Camera",
    detail: "1080p · 30fps",
    available: true,
    selected: true,
  },
  {
    id: "camera-logitech",
    kind: "camera",
    label: "Logitech Brio",
    detail: "1080p · 60fps",
    available: true,
    selected: false,
  },
  {
    id: "screen-main",
    kind: "screen",
    label: "Screen 1 — 2560×1440",
    detail: "Primary display",
    available: true,
    selected: true,
  },
  {
    id: "screen-external",
    kind: "screen",
    label: "Screen 2 — 3840×2160",
    detail: "Sidecar display",
    available: true,
    selected: false,
  },
  {
    id: "mic-default",
    kind: "mic",
    label: "MacBook Pro Microphone",
    detail: "Default input",
    available: true,
    selected: false,
  },
  {
    id: "mic-shure",
    kind: "mic",
    label: "Shure SM7B",
    detail: "-18 LUFS",
    available: true,
    selected: true,
  },
];

export function SourceConfigModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [sources, setSources] = React.useState<Source[]>(INITIAL_SOURCES);

  function toggleSource(id: string, kind: Source["kind"]) {
    setSources((prev) =>
      prev.map((s) => {
        if (s.kind !== kind) return s;
        if (s.id === id) return { ...s, selected: true };
        // within the same kind, only one can be selected at a time for camera/mic
        if (kind === "camera" || kind === "mic") return { ...s, selected: false };
        return s;
      })
    );
  }

  const grouped = React.useMemo(() => {
    return {
      camera: sources.filter((s) => s.kind === "camera"),
      screen: sources.filter((s) => s.kind === "screen"),
      mic: sources.filter((s) => s.kind === "mic"),
    };
  }, [sources]);

  return (
    <ModalShell open={open} onClose={onClose} title="Configure stream source">
      <div className="flex flex-col gap-5">
        <div className="rounded-[var(--radius-md)] border border-hairline bg-white/[0.02] px-3 py-2.5">
          <p className="text-[0.75rem] text-fg-muted leading-snug">
            Restream forwards your stream from OBS, Streamlabs, or another
            broadcast app. Set up scenes, overlays, and guests there — this
            app handles the multi-destination forwarding.
          </p>
        </div>
        <SourceGroup
          kind="camera"
          label="Camera"
          Icon={Camera}
          sources={grouped.camera}
          onSelect={(id) => toggleSource(id, "camera")}
        />
        <SourceGroup
          kind="screen"
          label="Screen share"
          Icon={Monitor}
          sources={grouped.screen}
          onSelect={(id) => toggleSource(id, "screen")}
          multi
        />
        <SourceGroup
          kind="mic"
          label="Microphone"
          Icon={Mic}
          sources={grouped.mic}
          onSelect={(id) => toggleSource(id, "mic")}
        />
      </div>
    </ModalShell>
  );
}

function SourceGroup({
  label,
  Icon,
  sources,
  onSelect,
  multi,
}: {
  kind: Source["kind"];
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
  sources: Source[];
  onSelect: (id: string) => void;
  multi?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 text-[0.75rem] font-semibold uppercase tracking-[0.1em] text-fg-muted">
        <Icon className="size-3.5" />
        <span>{label}</span>
      </div>
      <div className="flex flex-col gap-1.5">
        {sources.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => onSelect(s.id)}
            className={cn(
              "flex items-center gap-3 rounded-[var(--radius-md)] border px-3 py-2.5 text-left transition-colors",
              s.selected
                ? "border-brand-500/40 bg-brand-500/10"
                : "border-hairline bg-white/[0.02] hover:bg-white/[0.05]"
            )}
          >
            <span
              className={cn(
                "flex size-5 items-center justify-center rounded-full border shrink-0",
                s.selected
                  ? "border-brand-500 bg-brand-500 text-white"
                  : "border-hairline-strong"
              )}
            >
              {s.selected && <Check className="size-3" />}
            </span>
            <div className="flex flex-col min-w-0 flex-1 leading-tight">
              <span className="text-[0.875rem] font-medium text-fg-primary truncate">
                {s.label}
              </span>
              <span className="text-[0.75rem] text-fg-subtle">{s.detail}</span>
            </div>
          </button>
        ))}
      </div>
      {multi && (
        <p className="text-[0.6875rem] text-fg-subtle">
          Tap to add or remove from scene
        </p>
      )}
    </div>
  );
}

/* Shared modal shell used by both source + summary modals. */
export function ModalShell({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  // lock body scroll when open
  React.useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // escape to close
  React.useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden
          />
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.3, ease: easeOutExpo }}
            className="absolute inset-x-0 top-16 mx-auto w-full max-w-lg px-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            <div
              className={cn(
                "relative flex flex-col rounded-[var(--radius-xl)]",
                "border border-hairline-strong bg-bg-elevated backdrop-blur-2xl",
                "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1),0_30px_80px_-20px_rgba(0,0,0,0.8)]"
              )}
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-hairline">
                <h2
                  id="modal-title"
                  className="text-[1rem] font-semibold tracking-tight text-fg-primary"
                >
                  {title}
                </h2>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close"
                  className="inline-flex items-center justify-center size-8 rounded-[var(--radius-sm)] text-fg-subtle hover:text-fg-primary hover:bg-white/[0.05] transition-colors"
                >
                  <X className="size-4" />
                </button>
              </div>
              <div className="px-5 py-5 max-h-[70vh] overflow-y-auto">
                {children}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

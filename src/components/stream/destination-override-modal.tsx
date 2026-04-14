"use client";

import * as React from "react";
import { ModalShell } from "@/components/stream/source-config-modal";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type {
  Destination,
  DestinationOverride,
} from "@/components/stream/destination-card";

type Defaults = {
  title: string;
  description: string;
  category: string;
};

const CATEGORIES = [
  "Just Chatting",
  "Product Demo",
  "Gaming",
  "Music",
  "Software Dev",
  "Creative",
];

export function DestinationOverrideModal({
  open,
  destination,
  override,
  defaults,
  onClose,
  onSave,
  onClear,
}: {
  open: boolean;
  destination: Destination | null;
  override?: DestinationOverride;
  defaults: Defaults;
  onClose: () => void;
  onSave: (id: string, next: DestinationOverride) => void;
  onClear: (id: string) => void;
}) {
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [category, setCategory] = React.useState("");

  // Reset form when destination / override changes
  React.useEffect(() => {
    setTitle(override?.title ?? "");
    setDescription(override?.description ?? "");
    setCategory(override?.category ?? "");
  }, [override, destination?.id, open]);

  if (!destination) {
    return (
      <ModalShell open={open} onClose={onClose} title="Override details">
        <p className="text-[0.875rem] text-fg-muted">
          No destination selected.
        </p>
      </ModalShell>
    );
  }

  const hasAnyOverride = Boolean(
    override?.title || override?.description || override?.category
  );

  function handleSave() {
    onSave(destination!.id, {
      title: title.trim() || undefined,
      description: description.trim() || undefined,
      category: category || undefined,
    });
    onClose();
  }

  function handleClear() {
    onClear(destination!.id);
    onClose();
  }

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title={`${destination.platform} details`}
    >
      <div className="flex flex-col gap-5">
        <p className="text-[0.8125rem] text-fg-muted">
          Override what appears on {destination.platform}. Leave blank to use
          your shared stream details.
        </p>

        {/* Title */}
        <OverrideField
          label="Title"
          placeholder={defaults.title}
          value={title}
          onChange={setTitle}
          muted={!title}
        >
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={defaults.title}
          />
        </OverrideField>

        {/* Description */}
        <OverrideField
          label="Description"
          placeholder={defaults.description}
          value={description}
          onChange={setDescription}
          muted={!description}
        >
          <Textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={defaults.description}
          />
        </OverrideField>

        {/* Category */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-baseline justify-between">
            <label className="text-[0.75rem] font-medium text-fg-muted">
              Category
            </label>
            <span className="text-[0.6875rem] text-fg-subtle">
              Default: {defaults.category}
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {[""]
              .concat(CATEGORIES)
              .map((c) => {
                const active = c === category;
                const label = c === "" ? "Use default" : c;
                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setCategory(c)}
                    className={
                      active
                        ? "h-8 px-3 rounded-full text-[0.75rem] font-medium border border-brand-500/40 bg-brand-500/10 text-brand-300 shadow-[0_0_20px_-6px_rgba(124,92,255,0.5)] transition-all"
                        : "h-8 px-3 rounded-full text-[0.75rem] font-medium border border-hairline bg-white/[0.03] text-fg-muted hover:text-fg-primary hover:bg-white/[0.06] transition-colors"
                    }
                  >
                    {label}
                  </button>
                );
              })}
          </div>
        </div>

        {/* Action row */}
        <div className="flex items-center justify-between gap-3 pt-2 border-t border-hairline">
          <div>
            {hasAnyOverride && (
              <button
                type="button"
                onClick={handleClear}
                className="inline-flex items-center h-8 px-3 rounded-[var(--radius-sm)] text-[0.75rem] font-medium text-warn hover:underline"
              >
                Clear overrides
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center h-9 px-4 rounded-[var(--radius-md)] text-[0.8125rem] font-medium border border-hairline bg-white/[0.04] text-fg-primary hover:bg-white/[0.08] transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className={cn(
                "inline-flex items-center h-9 px-4 rounded-[var(--radius-md)] text-[0.8125rem] font-medium",
                "bg-brand-500 text-white hover:bg-brand-400 transition-colors",
                "shadow-[0_1px_0_0_rgba(255,255,255,0.12)_inset,0_8px_18px_-8px_rgba(124,92,255,0.55)]"
              )}
            >
              Save overrides
            </button>
          </div>
        </div>
      </div>
    </ModalShell>
  );
}

function OverrideField({
  label,
  value,
  muted,
  children,
}: {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  muted: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between">
        <label className="text-[0.75rem] font-medium text-fg-muted">
          {label}
        </label>
        {muted && (
          <span className="text-[0.6875rem] text-fg-subtle">
            Using shared
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

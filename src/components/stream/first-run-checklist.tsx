"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Check, Sparkles, X as XIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { easeOutExpo, springSnap } from "@/lib/motion";

export type ChecklistStep = {
  id: string;
  label: string;
  hint: string;
  done: boolean;
};

type FirstRunChecklistProps = {
  steps: ChecklistStep[];
  onDismiss: () => void;
};

/* ─────────────────────────────────────────────────────────────
 * FirstRunChecklist — a three-step progressive guide that reacts to
 * real page state. Steps flip from open circle → green check as the
 * user completes them in any order. When all three land, the strip
 * briefly celebrates then invites dismissal.
 * ──────────────────────────────────────────────────────────── */
export function FirstRunChecklist({ steps, onDismiss }: FirstRunChecklistProps) {
  const doneCount = steps.filter((s) => s.done).length;
  const allDone = doneCount === steps.length;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -8, height: 0 }}
      animate={{ opacity: 1, y: 0, height: "auto" }}
      exit={{ opacity: 0, y: -8, height: 0 }}
      transition={{ duration: 0.3, ease: easeOutExpo }}
      className="overflow-hidden"
    >
      <div
        className={cn(
          "relative overflow-hidden rounded-[var(--radius-lg)]",
          "border border-brand-500/25 bg-brand-500/[0.04]",
          "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]"
        )}
      >
        {/* soft corner glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(120% 100% at 0% 0%, rgba(124,92,255,0.10), transparent 55%)",
          }}
        />

        <div className="relative flex items-center gap-5 px-4 py-3">
          <div className="flex items-center gap-2 shrink-0">
            <span
              className={cn(
                "inline-flex items-center justify-center size-6 rounded-full",
                "bg-gradient-to-br from-brand-400 to-brand-600 text-white",
                "shadow-[0_0_12px_rgba(124,92,255,0.5)]"
              )}
              aria-hidden
            >
              <Sparkles className="size-3" />
            </span>
            <div className="flex flex-col leading-tight">
              <span className="text-[0.8125rem] font-semibold text-fg-primary">
                {allDone ? "You're ready" : "Welcome to Restream Playground"}
              </span>
              <span className="text-[0.6875rem] text-fg-subtle tabular-nums">
                {allDone
                  ? "All set — dismiss this tour when you're done"
                  : `${doneCount} of ${steps.length} steps complete`}
              </span>
            </div>
          </div>

          <div className="flex-1 min-w-0 flex items-center gap-3 overflow-x-auto no-scrollbar">
            {steps.map((step, i) => (
              <React.Fragment key={step.id}>
                <ChecklistItem step={step} index={i} />
                {i < steps.length - 1 && (
                  <span
                    className={cn(
                      "h-px w-6 shrink-0 transition-colors",
                      step.done ? "bg-brand-500/50" : "bg-hairline"
                    )}
                    aria-hidden
                  />
                )}
              </React.Fragment>
            ))}
          </div>

          <button
            type="button"
            onClick={onDismiss}
            aria-label="Dismiss tour"
            className={cn(
              "inline-flex items-center justify-center size-7 rounded-[var(--radius-sm)]",
              "text-fg-subtle hover:text-fg-primary hover:bg-white/[0.05] transition-colors shrink-0"
            )}
          >
            <XIcon className="size-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function ChecklistItem({ step, index }: { step: ChecklistStep; index: number }) {
  return (
    <div className="flex items-center gap-2 shrink-0 min-w-0">
      <span
        className={cn(
          "relative inline-flex items-center justify-center size-5 rounded-full shrink-0",
          "transition-colors duration-200",
          step.done
            ? "bg-success text-bg-base"
            : "border border-hairline-strong text-fg-subtle"
        )}
      >
        <AnimatePresence mode="wait" initial={false}>
          {step.done ? (
            <motion.span
              key="done"
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.6, opacity: 0 }}
              transition={springSnap}
              className="absolute inset-0 flex items-center justify-center"
            >
              <Check className="size-3" strokeWidth={3} />
            </motion.span>
          ) : (
            <motion.span
              key="num"
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.6, opacity: 0 }}
              transition={springSnap}
              className="absolute inset-0 flex items-center justify-center text-[0.6875rem] font-semibold tabular-nums"
            >
              {index + 1}
            </motion.span>
          )}
        </AnimatePresence>
      </span>
      <div className="flex flex-col leading-tight min-w-0">
        <span
          className={cn(
            "text-[0.75rem] font-medium truncate transition-colors",
            step.done ? "text-fg-muted line-through decoration-fg-subtle/60" : "text-fg-primary"
          )}
        >
          {step.label}
        </span>
        <span className="text-[0.6875rem] text-fg-subtle truncate">
          {step.hint}
        </span>
      </div>
    </div>
  );
}

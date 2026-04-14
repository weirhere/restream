"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { CheckCircle2, AlertTriangle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { springSnap, easeOutExpo } from "@/lib/motion";

export type ToastTone = "success" | "warn" | "info";

export type Toast = {
  id: string;
  tone: ToastTone;
  label: string;
  detail?: string;
  /** ms until auto-dismiss. 0 = sticky. Default 3500. */
  duration?: number;
};

type ToastContextValue = {
  push: (t: Omit<Toast, "id">) => string;
  dismiss: (id: string) => void;
};

const ToastContext = React.createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);
  const timers = React.useRef<Record<string, number>>({});

  const dismiss = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    if (timers.current[id]) {
      window.clearTimeout(timers.current[id]);
      delete timers.current[id];
    }
  }, []);

  const push = React.useCallback(
    (t: Omit<Toast, "id">) => {
      const id = Math.random().toString(36).slice(2, 9);
      const toast: Toast = { duration: 3500, ...t, id };
      setToasts((prev) => [...prev, toast]);
      if (toast.duration && toast.duration > 0) {
        timers.current[id] = window.setTimeout(() => dismiss(id), toast.duration);
      }
      return id;
    },
    [dismiss]
  );

  const value = React.useMemo(() => ({ push, dismiss }), [push, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Toaster toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

function Toaster({
  toasts,
  onDismiss,
}: {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}) {
  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="pointer-events-none fixed bottom-4 right-4 z-[100] flex flex-col items-end gap-2"
    >
      <AnimatePresence initial={false}>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={springSnap}
            className="pointer-events-auto"
          >
            <ToastCard toast={t} onDismiss={() => onDismiss(t.id)} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

function ToastCard({
  toast,
  onDismiss,
}: {
  toast: Toast;
  onDismiss: () => void;
}) {
  const Icon =
    toast.tone === "success"
      ? CheckCircle2
      : toast.tone === "warn"
        ? AlertTriangle
        : Info;
  const accent =
    toast.tone === "success"
      ? "text-success border-success/30 bg-success/[0.08]"
      : toast.tone === "warn"
        ? "text-warn border-warn/30 bg-warn/[0.08]"
        : "text-brand-300 border-brand-500/30 bg-brand-500/[0.08]";

  return (
    <div
      className={cn(
        "flex items-start gap-3 w-[320px] max-w-[92vw] rounded-[var(--radius-md)] border backdrop-blur-xl",
        "bg-bg-elevated/95 px-3.5 py-3 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.7),inset_0_1px_0_0_rgba(255,255,255,0.08)]",
        "border-hairline"
      )}
      role="status"
    >
      <Icon className={cn("size-4 mt-0.5 shrink-0", accent.split(" ")[0])} aria-hidden />
      <div className="flex flex-col min-w-0 flex-1 leading-tight">
        <span className="text-[0.875rem] font-medium text-fg-primary">
          {toast.label}
        </span>
        {toast.detail && (
          <span className="text-[0.75rem] text-fg-muted mt-0.5">
            {toast.detail}
          </span>
        )}
      </div>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss"
        className="inline-flex items-center justify-center size-6 rounded-[var(--radius-sm)] text-fg-subtle hover:text-fg-primary hover:bg-white/[0.05] transition-colors shrink-0"
      >
        <X className="size-3.5" />
      </button>
    </div>
  );
}

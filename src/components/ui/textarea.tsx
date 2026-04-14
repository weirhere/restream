import * as React from "react";

import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-20 w-full rounded-[var(--radius-md)] px-3.5 py-2.5 text-sm",
        "bg-white/[0.03] border border-hairline",
        "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]",
        "text-fg-primary placeholder:text-fg-subtle",
        "transition-[border-color,box-shadow,background-color] duration-200 ease-out outline-none resize-none",
        "hover:bg-white/[0.04] hover:border-hairline-strong",
        "focus-visible:border-brand-500/60 focus-visible:bg-white/[0.05]",
        "focus-visible:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_0_0_3px_rgba(124,92,255,0.25)]",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "aria-invalid:border-live/60",
        className
      )}
      {...props}
    />
  );
}

export { Textarea };

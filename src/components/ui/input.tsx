import * as React from "react";
import { Input as InputPrimitive } from "@base-ui/react/input";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-10 w-full min-w-0 rounded-[var(--radius-md)] px-3.5 py-2 text-sm",
        "bg-white/[0.03] border border-hairline",
        "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]",
        "text-fg-primary placeholder:text-fg-subtle",
        "transition-[border-color,box-shadow,background-color] duration-200 ease-out outline-none",
        "hover:bg-white/[0.04] hover:border-hairline-strong",
        "focus-visible:border-brand-500/60 focus-visible:bg-white/[0.05]",
        "focus-visible:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_0_0_3px_rgba(124,92,255,0.25)]",
        "disabled:pointer-events-none disabled:opacity-50",
        "aria-invalid:border-live/60 aria-invalid:shadow-[0_0_0_3px_rgba(255,71,87,0.2)]",
        "file:inline-flex file:h-8 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-fg-primary",
        className
      )}
      {...props}
    />
  );
}

export { Input };

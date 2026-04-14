import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  [
    "group/badge inline-flex h-6 w-fit shrink-0 items-center justify-center gap-1.5",
    "overflow-hidden whitespace-nowrap",
    "rounded-full border px-2.5 py-0.5 text-[0.6875rem] font-semibold uppercase tracking-[0.08em]",
    "transition-all",
    "[&>svg]:pointer-events-none [&>svg]:size-3",
  ],
  {
    variants: {
      variant: {
        neutral:
          "border-hairline bg-white/[0.04] text-fg-muted",
        brand:
          "border-brand-500/40 bg-brand-500/10 text-brand-300 shadow-[0_0_20px_-6px_rgba(124,92,255,0.4)]",
        success:
          "border-[rgba(61,220,151,0.35)] bg-[rgba(61,220,151,0.1)] text-[#6ae9b3]",
        warn:
          "border-[rgba(255,181,71,0.35)] bg-[rgba(255,181,71,0.1)] text-[#ffc877]",
        // "LIVE" pill with pulsing dot, rendered by live-dot before the label
        live:
          "border-live/40 bg-live/10 text-live shadow-[0_0_24px_-8px_rgba(255,71,87,0.7)]",
        outline:
          "border-hairline-strong bg-transparent text-fg-primary",
      },
      size: {
        sm: "h-5 px-2 text-[0.625rem]",
        default: "h-6 px-2.5",
      },
    },
    defaultVariants: {
      variant: "neutral",
      size: "default",
    },
  }
);

function Badge({
  className,
  variant = "neutral",
  size = "default",
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant, size }), className),
      },
      props
    ),
    render,
    state: {
      slot: "badge",
      variant,
    },
  });
}

export { Badge, badgeVariants };

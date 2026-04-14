import * as React from "react";
import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  [
    "group/button inline-flex shrink-0 items-center justify-center gap-2",
    "whitespace-nowrap text-sm font-medium tracking-tight",
    "rounded-[var(--radius-md)] border border-transparent",
    "transition-[transform,box-shadow,background-color,color,border-color] duration-200 ease-out",
    "outline-none select-none",
    "focus-visible:ring-2 focus-visible:ring-brand-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base",
    "disabled:pointer-events-none disabled:opacity-40",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  ],
  {
    variants: {
      variant: {
        // flat violet fill
        default:
          "bg-brand-500 text-white shadow-[0_1px_0_0_rgba(255,255,255,0.12)_inset,0_8px_18px_-8px_rgba(124,92,255,0.55)] hover:bg-brand-400 hover:-translate-y-[1px] active:translate-y-0 active:bg-brand-600",
        // hero CTA — gradient fill + brand glow, reacts to hover/arm
        glow: [
          "text-white bg-gradient-brand",
          "shadow-[var(--shadow-glow-brand)]",
          "hover:shadow-[var(--shadow-glow-brand-strong)] hover:-translate-y-[1px]",
          "active:translate-y-0",
          "after:absolute after:inset-0 after:rounded-[inherit] after:bg-[linear-gradient(180deg,rgba(255,255,255,0.2),transparent_40%)] after:pointer-events-none",
          "relative overflow-hidden",
        ],
        // subtle frost outline
        outline:
          "border-hairline-strong bg-white/[0.03] text-fg-primary hover:bg-white/[0.06] hover:border-hairline-strong hover:-translate-y-[1px]",
        ghost:
          "text-fg-muted hover:text-fg-primary hover:bg-white/[0.04]",
        destructive:
          "bg-live/90 text-white hover:bg-live shadow-[0_0_0_1px_rgba(255,71,87,0.25),0_6px_18px_-6px_rgba(255,71,87,0.55)]",
        link: "text-brand-400 hover:text-brand-300 underline-offset-4 hover:underline",
      },
      size: {
        xs: "h-7 px-2 text-xs rounded-[8px]",
        sm: "h-8 px-3 text-[0.8125rem] rounded-[10px]",
        default: "h-10 px-4",
        lg: "h-11 px-5 text-[0.9375rem]",
        xl: "h-14 px-7 text-base rounded-[14px]",
        icon: "size-10",
        "icon-sm": "size-8 rounded-[10px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

type ButtonProps = React.ComponentProps<typeof ButtonPrimitive> &
  VariantProps<typeof buttonVariants>;

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonProps) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };

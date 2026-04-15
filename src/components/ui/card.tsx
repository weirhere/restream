import * as React from "react";

import { cn } from "@/lib/utils";

type CardProps = React.ComponentProps<"div"> & {
  size?: "default" | "sm";
  interactive?: boolean;
};

function Card({
  className,
  size = "default",
  interactive = false,
  ...props
}: CardProps) {
  return (
    <div
      data-slot="card"
      data-size={size}
      data-interactive={interactive || undefined}
      className={cn(
        // base frosted surface — restream's stacked card look
        "group/card relative flex flex-col gap-4 overflow-hidden",
        "rounded-[var(--radius-lg)]",
        "bg-bg-frost backdrop-blur-xl backdrop-saturate-150",
        "border border-hairline",
        // subtle inner top-edge highlight — matches restream's inset 1px white 10%
        "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08),0_1px_2px_0_rgba(0,0,0,0.35)]",
        "py-5 text-sm text-card-foreground",
        "has-data-[slot=card-footer]:pb-0",
        "data-[size=sm]:gap-3 data-[size=sm]:py-4",
        // interactive: border color shift + brand ring glow — no translate
        "data-[interactive=true]:transition-[box-shadow,border-color] data-[interactive=true]:duration-300 data-[interactive=true]:ease-out",
        "data-[interactive=true]:cursor-pointer",
        "data-[interactive=true]:hover:border-hairline-strong",
        "data-[interactive=true]:hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1),0_24px_60px_-18px_rgba(0,0,0,0.7),0_0_0_1px_rgba(124,92,255,0.25),0_12px_40px_-10px_rgba(124,92,255,0.35)]",
        className
      )}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min items-start gap-1 px-5",
        "group-data-[size=sm]/card:px-4",
        "has-data-[slot=card-action]:grid-cols-[1fr_auto]",
        "has-data-[slot=card-description]:grid-rows-[auto_auto]",
        "[.border-b]:pb-5 group-data-[size=sm]/card:[.border-b]:pb-4 [.border-b]:border-hairline",
        className
      )}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn(
        "font-heading text-[0.9375rem] leading-snug font-medium tracking-tight",
        "group-data-[size=sm]/card:text-sm",
        className
      )}
      {...props}
    />
  );
}

function CardDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-sm text-fg-muted", className)}
      {...props}
    />
  );
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-5 group-data-[size=sm]/card:px-4", className)}
      {...props}
    />
  );
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        "flex items-center border-t border-hairline bg-white/[0.02] px-5 py-4",
        "group-data-[size=sm]/card:px-4 group-data-[size=sm]/card:py-3",
        className
      )}
      {...props}
    />
  );
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
};

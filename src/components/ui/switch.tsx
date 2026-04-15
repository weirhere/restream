"use client";

import { Switch as SwitchPrimitive } from "@base-ui/react/switch";

import { cn } from "@/lib/utils";

function Switch({
  className,
  size = "default",
  ...props
}: SwitchPrimitive.Root.Props & {
  size?: "sm" | "default";
}) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      className={cn(
        "peer group/switch relative inline-flex shrink-0 items-center rounded-full border transition-colors duration-150 ease-out outline-none cursor-pointer",
        "after:absolute after:-inset-x-3 after:-inset-y-2",
        "focus-visible:ring-2 focus-visible:ring-brand-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base",
        "data-[size=default]:h-6 data-[size=default]:w-[42px] data-[size=sm]:h-[18px] data-[size=sm]:w-8",
        // UNCHECKED — dim, sunken "off metal"
        "data-unchecked:bg-black/40 data-unchecked:border-hairline",
        "data-unchecked:shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)]",
        // CHECKED — solid brand fill, no rim/ring, outer glow only
        "data-checked:bg-brand-500 data-checked:border-brand-500",
        "data-checked:shadow-[0_0_22px_-2px_rgba(124,92,255,0.8)]",
        "data-disabled:cursor-not-allowed data-disabled:opacity-40",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none block rounded-full bg-white",
          "shadow-[0_1px_2px_rgba(0,0,0,0.5),0_0_0_0.5px_rgba(0,0,0,0.1)]",
          "transition-transform duration-200 ease-out",
          "group-data-[size=default]/switch:size-5 group-data-[size=sm]/switch:size-[14px]",
          "group-data-[size=default]/switch:ml-0.5 group-data-[size=sm]/switch:ml-0.5",
          "group-data-[size=default]/switch:data-checked:translate-x-[18px]",
          "group-data-[size=sm]/switch:data-checked:translate-x-[14px]",
          "data-unchecked:translate-x-0"
        )}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };

"use client";

import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import { cn } from "@/lib/utils";

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-gray-300",

        "focus-visible:ring-2 focus-visible:ring-blue-500/50",
        "inline-flex h-[1.15rem] w-8 shrink-0 items-center rounded-full border border-transparent",
        "transition-all outline-none cursor-pointer",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        className={cn(
          "bg-white shadow-md pointer-events-none block size-4 rounded-full transition-transform",
          "data-[state=checked]:translate-x-[calc(100%-2px)]",
          "data-[state=unchecked]:translate-x-0",
        )}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };

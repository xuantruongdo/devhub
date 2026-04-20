"use client";

import { cn } from "@/lib/utils";

type StatusBadgeProps = {
  value: boolean;
};

export function StatusBadge({ value }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-block rounded-full px-3 py-1 text-xs font-medium",
        value ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800",
      )}
    >
      {value ? "Active" : "Inactive"}
    </span>
  );
}

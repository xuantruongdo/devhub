"use client";

import { CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

type VerifiedBadgeProps = {
  value: boolean;
};

export function VerifiedBadge({ value }: VerifiedBadgeProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2",
        value ? "text-green-600" : "text-gray-500",
      )}
    >
      {value ? (
        <>
          <CheckCircle2 className="h-4 w-4" />
          <span>Yes</span>
        </>
      ) : (
        <>
          <Circle className="h-4 w-4" />
          <span>No</span>
        </>
      )}
    </div>
  );
}

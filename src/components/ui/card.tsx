import * as React from "react";

import { cn } from "@/lib/utils";

export function Card({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-md)] bg-[var(--bg-elevated-1)] transition-colors",
        className,
      )}
      {...props}
    />
  );
}

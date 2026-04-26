import * as React from "react";

import { cn } from "@/lib/utils";

export function Card({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-md border border-border bg-surface shadow-[var(--shadow-card)] transition-colors",
        className,
      )}
      {...props}
    />
  );
}

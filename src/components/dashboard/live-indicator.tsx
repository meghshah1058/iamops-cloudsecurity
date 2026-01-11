"use client";

import { cn } from "@/lib/utils";

interface LiveIndicatorProps {
  label?: string;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function LiveIndicator({
  label = "Live",
  showLabel = true,
  size = "md",
  className,
}: LiveIndicatorProps) {
  const sizeConfig = {
    sm: {
      dot: "w-1.5 h-1.5",
      text: "text-xs",
      gap: "gap-1.5",
    },
    md: {
      dot: "w-2 h-2",
      text: "text-sm",
      gap: "gap-2",
    },
    lg: {
      dot: "w-2.5 h-2.5",
      text: "text-base",
      gap: "gap-2.5",
    },
  };

  const styles = sizeConfig[size];

  return (
    <div className={cn("flex items-center", styles.gap, className)}>
      <span className="relative flex">
        <span
          className={cn(
            "absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75",
            styles.dot
          )}
        />
        <span
          className={cn(
            "relative inline-flex rounded-full bg-emerald-400",
            styles.dot
          )}
        />
      </span>
      {showLabel && (
        <span className={cn("tracking-wider uppercase text-white/40", styles.text)}>
          {label}
        </span>
      )}
    </div>
  );
}

// Connection status indicator
interface ConnectionStatusProps {
  status: "connected" | "connecting" | "disconnected" | "error";
  label?: string;
  className?: string;
}

export function ConnectionStatus({ status, label, className }: ConnectionStatusProps) {
  const statusConfig = {
    connected: {
      color: "bg-emerald-400",
      label: label || "Connected",
      pulse: true,
    },
    connecting: {
      color: "bg-yellow-400",
      label: label || "Connecting",
      pulse: true,
    },
    disconnected: {
      color: "bg-gray-400",
      label: label || "Disconnected",
      pulse: false,
    },
    error: {
      color: "bg-red-400",
      label: label || "Error",
      pulse: true,
    },
  };

  const config = statusConfig[status];

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="relative flex">
        {config.pulse && (
          <span
            className={cn(
              "absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 w-2 h-2",
              config.color
            )}
          />
        )}
        <span className={cn("relative inline-flex rounded-full w-2 h-2", config.color)} />
      </span>
      <span className="text-sm text-white/60">{config.label}</span>
    </div>
  );
}

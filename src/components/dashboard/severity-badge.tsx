"use client";

import { cn } from "@/lib/utils";
import { AlertTriangle, AlertCircle, Info, CheckCircle } from "lucide-react";
import type { Severity } from "@/types";

interface SeverityBadgeProps {
  severity: Severity;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
  showLabel?: boolean;
  count?: number;
  className?: string;
}

const severityConfig = {
  CRITICAL: {
    label: "Critical",
    bgClass: "bg-critical-light",
    textClass: "text-critical",
    borderClass: "border-critical/30",
    icon: AlertTriangle,
  },
  HIGH: {
    label: "High",
    bgClass: "bg-high-light",
    textClass: "text-high",
    borderClass: "border-high/30",
    icon: AlertCircle,
  },
  MEDIUM: {
    label: "Medium",
    bgClass: "bg-medium-light",
    textClass: "text-medium",
    borderClass: "border-medium/30",
    icon: Info,
  },
  LOW: {
    label: "Low",
    bgClass: "bg-low-light",
    textClass: "text-low",
    borderClass: "border-low/30",
    icon: CheckCircle,
  },
};

const sizeConfig = {
  sm: {
    padding: "px-2 py-0.5",
    text: "text-xs",
    iconSize: "w-3 h-3",
    gap: "gap-1",
  },
  md: {
    padding: "px-2.5 py-1",
    text: "text-sm",
    iconSize: "w-4 h-4",
    gap: "gap-1.5",
  },
  lg: {
    padding: "px-3 py-1.5",
    text: "text-base",
    iconSize: "w-5 h-5",
    gap: "gap-2",
  },
};

export function SeverityBadge({
  severity,
  size = "md",
  showIcon = true,
  showLabel = true,
  count,
  className,
}: SeverityBadgeProps) {
  const config = severityConfig[severity];
  const sizeStyles = sizeConfig[size];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium border",
        config.bgClass,
        config.textClass,
        config.borderClass,
        sizeStyles.padding,
        sizeStyles.text,
        sizeStyles.gap,
        className
      )}
    >
      {showIcon && <Icon className={sizeStyles.iconSize} />}
      {showLabel && <span>{config.label}</span>}
      {count !== undefined && (
        <span className="font-bold">{count}</span>
      )}
    </span>
  );
}

// Simple severity dot indicator
interface SeverityDotProps {
  severity: Severity;
  size?: "sm" | "md" | "lg";
  pulse?: boolean;
  className?: string;
}

export function SeverityDot({ severity, size = "md", pulse = false, className }: SeverityDotProps) {
  const colorConfig = {
    CRITICAL: "bg-critical",
    HIGH: "bg-high",
    MEDIUM: "bg-medium",
    LOW: "bg-low",
  };

  const sizeConfig = {
    sm: "w-2 h-2",
    md: "w-3 h-3",
    lg: "w-4 h-4",
  };

  return (
    <span className={cn("relative inline-flex", className)}>
      {pulse && (
        <span
          className={cn(
            "absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping",
            colorConfig[severity]
          )}
        />
      )}
      <span
        className={cn(
          "relative inline-flex rounded-full",
          colorConfig[severity],
          sizeConfig[size]
        )}
      />
    </span>
  );
}

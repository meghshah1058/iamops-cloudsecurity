"use client";

import { cn } from "@/lib/utils";
import { HTMLAttributes, forwardRef } from "react";

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "solid";
  hover?: boolean;
  glow?: boolean;
}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant = "default", hover = true, glow = false, children, ...props }, ref) => {
    const variants = {
      default: "bg-white/5 backdrop-blur-xl border-white/10",
      elevated: "bg-surface-elevated/80 backdrop-blur-xl border-white/10",
      solid: "bg-surface border-white/10",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-2xl border transition-all duration-300",
          variants[variant],
          hover && "hover:border-white/20 hover:translate-y-[-2px] hover:shadow-lg hover:shadow-black/20",
          glow && "shadow-[0_0_30px_rgba(139,92,246,0.15)]",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

GlassCard.displayName = "GlassCard";

"use client";

import { GlassCard } from "./glass-card";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface SecurityScoreProps {
  score: number;
  previousScore?: number;
  className?: string;
}

export function SecurityScore({ score, previousScore, className }: SecurityScoreProps) {
  const scoreDiff = previousScore ? score - previousScore : 0;

  const getScoreColor = (s: number) => {
    if (s >= 80) return { text: "text-green-400", gradient: "#22C55E" };
    if (s >= 60) return { text: "text-yellow-400", gradient: "#EAB308" };
    if (s >= 40) return { text: "text-orange-400", gradient: "#F97316" };
    return { text: "text-red-400", gradient: "#EF4444" };
  };

  const getScoreLabel = (s: number) => {
    if (s >= 80) return { label: "Excellent", bg: "bg-green-500/10", text: "text-green-400" };
    if (s >= 60) return { label: "Good", bg: "bg-yellow-500/10", text: "text-yellow-400" };
    if (s >= 40) return { label: "Needs Attention", bg: "bg-orange-500/10", text: "text-orange-400" };
    return { label: "Critical", bg: "bg-red-500/10", text: "text-red-400" };
  };

  const colors = getScoreColor(score);
  const labelConfig = getScoreLabel(score);

  // Calculate the stroke dash for the circular progress
  const circumference = 2 * Math.PI * 56; // radius = 56
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <GlassCard className={cn("p-6", className)}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white">Security Score</h3>
        <p className="text-sm text-white/40 mt-1">Overall compliance</p>
      </div>

      <div className="flex flex-col items-center">
        {/* Circular Progress */}
        <div className="relative w-36 h-36">
          <svg className="w-full h-full transform -rotate-90">
            {/* Background circle */}
            <circle
              cx="72"
              cy="72"
              r="56"
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="12"
            />
            {/* Progress circle */}
            <circle
              cx="72"
              cy="72"
              r="56"
              fill="none"
              stroke={`url(#scoreGradient-${score})`}
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-1000 ease-out"
            />
            <defs>
              <linearGradient
                id={`scoreGradient-${score}`}
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
              >
                <stop offset="0%" stopColor="#8B5CF6" />
                <stop offset="100%" stopColor={colors.gradient} />
              </linearGradient>
            </defs>
          </svg>

          {/* Center Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={cn("text-4xl font-bold", colors.text)}>
              {score}%
            </span>
          </div>
        </div>

        {/* Score Label */}
        <div
          className={cn(
            "mt-4 px-4 py-1.5 rounded-full text-sm font-medium",
            labelConfig.bg,
            labelConfig.text
          )}
        >
          {labelConfig.label}
        </div>

        {/* Score Change */}
        {previousScore !== undefined && (
          <div className="flex items-center gap-1.5 mt-3">
            {scoreDiff > 0 ? (
              <>
                <TrendingUp className="w-4 h-4 text-green-400" />
                <span className="text-sm text-green-400">+{scoreDiff}%</span>
              </>
            ) : scoreDiff < 0 ? (
              <>
                <TrendingDown className="w-4 h-4 text-red-400" />
                <span className="text-sm text-red-400">{scoreDiff}%</span>
              </>
            ) : (
              <>
                <Minus className="w-4 h-4 text-white/40" />
                <span className="text-sm text-white/40">No change</span>
              </>
            )}
            <span className="text-xs text-white/30">vs last scan</span>
          </div>
        )}

        {/* View Details Link */}
        <Link href="/dashboard/findings" className="block w-full mt-4">
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-primary hover:text-primary/80 hover:bg-primary/10 gap-2"
          >
            View All Findings
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>
    </GlassCard>
  );
}

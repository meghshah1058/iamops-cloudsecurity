"use client";

import { cn } from "@/lib/utils";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { GlassCard } from "./glass-card";
import Link from "next/link";

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "increase" | "decrease" | "neutral";
  icon: LucideIcon;
  iconColor?: string;
  iconBgColor?: string;
  valueColor?: string;
  className?: string;
}

export function StatsCard({
  title,
  value,
  change,
  changeType = "neutral",
  icon: Icon,
  iconColor = "text-white",
  iconBgColor = "bg-white/10",
  valueColor = "text-white",
  className,
}: StatsCardProps) {
  return (
    <GlassCard className={cn("p-5 group", className)}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm text-white/50 font-medium">{title}</p>
          <p className={cn("text-3xl font-bold", valueColor)}>{value}</p>
          {change && (
            <div className="flex items-center gap-1.5 pt-1">
              {changeType === "increase" ? (
                <TrendingUp className="w-4 h-4 text-red-400" />
              ) : changeType === "decrease" ? (
                <TrendingDown className="w-4 h-4 text-green-400" />
              ) : null}
              <span
                className={cn(
                  "text-xs font-medium",
                  changeType === "increase"
                    ? "text-red-400"
                    : changeType === "decrease"
                    ? "text-green-400"
                    : "text-white/40"
                )}
              >
                {change}
              </span>
            </div>
          )}
        </div>
        <div
          className={cn(
            "p-3 rounded-xl transition-transform group-hover:scale-110",
            iconBgColor
          )}
        >
          <Icon className={cn("w-6 h-6", iconColor)} />
        </div>
      </div>
    </GlassCard>
  );
}

// Specific severity stat cards
interface SeverityStatsProps {
  critical: number;
  high: number;
  medium: number;
  low: number;
  total: number;
  changes?: {
    critical?: string;
    high?: string;
    medium?: string;
    low?: string;
    total?: string;
  };
}

export function SeverityStatsRow({ critical, high, medium, low, total, changes }: SeverityStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      <Link href="/dashboard/findings" className="block">
        <GlassCard className="p-5 group cursor-pointer hover:scale-[1.02] transition-all">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-white/50 font-medium">Total Findings</p>
              <p className="text-3xl font-bold text-white mt-1">{total}</p>
              {changes?.total && (
                <p className="text-xs text-white/40 mt-2">{changes.total}</p>
              )}
            </div>
            <div className="p-3 rounded-xl bg-white/10 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </GlassCard>
      </Link>

      <Link href="/dashboard/findings?severity=CRITICAL" className="block">
        <GlassCard className="p-5 group border-red-500/20 hover:border-red-500/40 cursor-pointer hover:scale-[1.02] transition-all">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-white/50 font-medium">Critical</p>
              <p className="text-3xl font-bold text-red-400 mt-1">{critical}</p>
              {changes?.critical && (
                <div className="flex items-center gap-1 mt-2">
                  <TrendingDown className="w-3 h-3 text-green-400" />
                  <span className="text-xs text-green-400">{changes.critical}</span>
                </div>
              )}
            </div>
            <div className="p-3 rounded-xl bg-red-500/10 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
        </GlassCard>
      </Link>

      <Link href="/dashboard/findings?severity=HIGH" className="block">
        <GlassCard className="p-5 group border-orange-500/20 hover:border-orange-500/40 cursor-pointer hover:scale-[1.02] transition-all">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-white/50 font-medium">High</p>
              <p className="text-3xl font-bold text-orange-400 mt-1">{high}</p>
              {changes?.high && (
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="w-3 h-3 text-red-400" />
                  <span className="text-xs text-red-400">{changes.high}</span>
                </div>
              )}
            </div>
            <div className="p-3 rounded-xl bg-orange-500/10 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </GlassCard>
      </Link>

      <Link href="/dashboard/findings?severity=MEDIUM" className="block">
        <GlassCard className="p-5 group border-yellow-500/20 hover:border-yellow-500/40 cursor-pointer hover:scale-[1.02] transition-all">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-white/50 font-medium">Medium</p>
              <p className="text-3xl font-bold text-yellow-400 mt-1">{medium}</p>
              {changes?.medium && (
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="w-3 h-3 text-red-400" />
                  <span className="text-xs text-red-400">{changes.medium}</span>
                </div>
              )}
            </div>
            <div className="p-3 rounded-xl bg-yellow-500/10 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </GlassCard>
      </Link>

      <Link href="/dashboard/findings?severity=LOW" className="block">
        <GlassCard className="p-5 group border-green-500/20 hover:border-green-500/40 cursor-pointer hover:scale-[1.02] transition-all">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-white/50 font-medium">Low</p>
              <p className="text-3xl font-bold text-green-400 mt-1">{low}</p>
              {changes?.low && (
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="w-3 h-3 text-white/40" />
                  <span className="text-xs text-white/40">{changes.low}</span>
                </div>
              )}
            </div>
            <div className="p-3 rounded-xl bg-green-500/10 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </GlassCard>
      </Link>
    </div>
  );
}

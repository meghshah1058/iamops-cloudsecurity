"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { GlassCard } from "@/components/dashboard/glass-card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";

interface AuditData {
  id: string;
  critical: number;
  high: number;
  medium: number;
  low: number;
  completedAt: string;
}

interface FindingsTrendChartProps {
  data?: AuditData[];
}

// Fallback sample data
const sampleData = [
  { date: "Jan 5", critical: 15, high: 28, medium: 42, low: 35 },
  { date: "Jan 6", critical: 12, high: 32, medium: 38, low: 40 },
  { date: "Jan 7", critical: 18, high: 25, medium: 45, low: 38 },
  { date: "Jan 8", critical: 10, high: 30, medium: 40, low: 42 },
  { date: "Jan 9", critical: 14, high: 28, medium: 48, low: 36 },
  { date: "Jan 10", critical: 8, high: 35, medium: 44, low: 39 },
  { date: "Jan 11", critical: 12, high: 34, medium: 45, low: 36 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1a0a2e]/95 backdrop-blur-sm border border-white/10 rounded-lg p-3 shadow-xl">
        <p className="text-white/60 text-xs mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-white/70 capitalize">{entry.name}:</span>
            <span className="text-white font-medium">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function FindingsTrendChart({ data: rawData }: FindingsTrendChartProps) {
  // Transform API data to chart format
  const chartData = rawData && rawData.length > 0
    ? rawData.map((audit) => ({
        date: format(new Date(audit.completedAt), "MMM d"),
        critical: audit.critical,
        high: audit.high,
        medium: audit.medium,
        low: audit.low,
      }))
    : sampleData;

  return (
    <GlassCard className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white">Findings Trend</h3>
          <p className="text-sm text-white/40 mt-1">Last {chartData.length} audits</p>
        </div>
        <div className="flex items-center gap-4">
          {[
            { name: "Critical", color: "#EF4444" },
            { name: "High", color: "#F97316" },
            { name: "Medium", color: "#EAB308" },
            { name: "Low", color: "#22C55E" },
          ].map((item) => (
            <div key={item.name} className="flex items-center gap-1.5">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-xs text-white/50">{item.name}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="criticalGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="highGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F97316" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#F97316" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="mediumGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#EAB308" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#EAB308" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="lowGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22C55E" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.05)"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="critical"
              stroke="#EF4444"
              strokeWidth={2}
              fill="url(#criticalGradient)"
              dot={false}
              activeDot={{ r: 4, fill: "#EF4444" }}
            />
            <Area
              type="monotone"
              dataKey="high"
              stroke="#F97316"
              strokeWidth={2}
              fill="url(#highGradient)"
              dot={false}
              activeDot={{ r: 4, fill: "#F97316" }}
            />
            <Area
              type="monotone"
              dataKey="medium"
              stroke="#EAB308"
              strokeWidth={2}
              fill="url(#mediumGradient)"
              dot={false}
              activeDot={{ r: 4, fill: "#EAB308" }}
            />
            <Area
              type="monotone"
              dataKey="low"
              stroke="#22C55E"
              strokeWidth={2}
              fill="url(#lowGradient)"
              dot={false}
              activeDot={{ r: 4, fill: "#22C55E" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* View All Link */}
      <Link href="/dashboard/audits" className="block mt-4">
        <Button
          variant="ghost"
          size="sm"
          className="w-full text-primary hover:text-primary/80 hover:bg-primary/10 gap-2"
        >
          View Audit History
          <ArrowRight className="w-4 h-4" />
        </Button>
      </Link>
    </GlassCard>
  );
}

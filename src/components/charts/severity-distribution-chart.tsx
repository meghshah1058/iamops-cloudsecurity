"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { GlassCard } from "@/components/dashboard/glass-card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

interface SeverityDistributionProps {
  critical: number;
  high: number;
  medium: number;
  low: number;
}

const COLORS = {
  critical: "#EF4444",
  high: "#F97316",
  medium: "#EAB308",
  low: "#22C55E",
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-[#1a0a2e]/95 backdrop-blur-sm border border-white/10 rounded-lg p-3 shadow-xl">
        <div className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: data.payload.fill }}
          />
          <span className="text-white/70 capitalize">{data.name}:</span>
          <span className="text-white font-medium">{data.value}</span>
          <span className="text-white/40">({data.payload.percentage}%)</span>
        </div>
      </div>
    );
  }
  return null;
};

export function SeverityDistributionChart({
  critical,
  high,
  medium,
  low,
}: SeverityDistributionProps) {
  const total = critical + high + medium + low;

  const data = [
    {
      name: "Critical",
      value: critical,
      fill: COLORS.critical,
      percentage: Math.round((critical / total) * 100),
    },
    {
      name: "High",
      value: high,
      fill: COLORS.high,
      percentage: Math.round((high / total) * 100),
    },
    {
      name: "Medium",
      value: medium,
      fill: COLORS.medium,
      percentage: Math.round((medium / total) * 100),
    },
    {
      name: "Low",
      value: low,
      fill: COLORS.low,
      percentage: Math.round((low / total) * 100),
    },
  ];

  return (
    <GlassCard className="p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white">Severity Distribution</h3>
        <p className="text-sm text-white/40 mt-1">By finding count</p>
      </div>

      <div className="h-[220px] relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={2}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        {/* Center Text */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <p className="text-3xl font-bold text-white">{total}</p>
            <p className="text-xs text-white/40">Total</p>
          </div>
        </div>
      </div>

      {/* Legend - Clickable */}
      <div className="grid grid-cols-2 gap-3 mt-4">
        {data.map((item) => (
          <Link
            key={item.name}
            href={`/dashboard/findings?severity=${item.name.toUpperCase()}`}
            className="block"
          >
            <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all cursor-pointer group">
              <div className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.fill }}
                />
                <span className="text-sm text-white/70 group-hover:text-white transition-colors">{item.name}</span>
              </div>
              <span className="text-sm font-medium text-white">{item.value}</span>
            </div>
          </Link>
        ))}
      </div>

      {/* View All Link */}
      <Link href="/dashboard/findings" className="block mt-4">
        <Button
          variant="ghost"
          size="sm"
          className="w-full text-primary hover:text-primary/80 hover:bg-primary/10 gap-2"
        >
          View All Findings
          <ArrowRight className="w-4 h-4" />
        </Button>
      </Link>
    </GlassCard>
  );
}

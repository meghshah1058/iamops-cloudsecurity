"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { GlassCard } from "@/components/dashboard/glass-card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

interface Finding {
  id: string;
  findingId: string;
  severity: string;
  title: string;
  resource: string;
}

interface TopResourcesChartProps {
  findings?: Finding[];
}

// Sample data fallback
const sampleData = [
  { name: "S3 Buckets", critical: 5, high: 8, medium: 12, low: 6 },
  { name: "IAM Roles", critical: 3, high: 12, medium: 8, low: 4 },
  { name: "EC2 Instances", critical: 2, high: 6, medium: 15, low: 8 },
  { name: "Security Groups", critical: 4, high: 7, medium: 10, low: 5 },
  { name: "Lambda Functions", critical: 1, high: 4, medium: 8, low: 12 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const total = payload.reduce((sum: number, p: any) => sum + p.value, 0);
    return (
      <div className="bg-[#1a0a2e]/95 backdrop-blur-sm border border-white/10 rounded-lg p-3 shadow-xl min-w-[150px]">
        <p className="text-white font-medium text-sm mb-2">{label}</p>
        <p className="text-white/50 text-xs mb-2">Total: {total} findings</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center justify-between gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-white/70 capitalize">{entry.name}</span>
            </div>
            <span className="text-white font-medium">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function TopResourcesChart({ findings }: TopResourcesChartProps) {
  // Transform findings to resource data
  const chartData = findings && findings.length > 0
    ? (() => {
        const resourceMap: Record<string, { critical: number; high: number; medium: number; low: number }> = {};
        findings.forEach((finding) => {
          // Extract resource type from findingId (e.g., "IAM-C01" -> "IAM")
          const resourceType = finding.findingId.split("-")[0] || "Other";
          if (!resourceMap[resourceType]) {
            resourceMap[resourceType] = { critical: 0, high: 0, medium: 0, low: 0 };
          }
          const severity = finding.severity.toLowerCase() as "critical" | "high" | "medium" | "low";
          if (resourceMap[resourceType][severity] !== undefined) {
            resourceMap[resourceType][severity]++;
          }
        });
        return Object.entries(resourceMap).map(([name, counts]) => ({
          name,
          ...counts,
        }));
      })()
    : sampleData;

  return (
    <GlassCard className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white">Top Vulnerable Resources</h3>
          <p className="text-sm text-white/40 mt-1">By resource type</p>
        </div>
        <div className="flex items-center gap-3">
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
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 0, right: 10, left: 0, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.05)"
              horizontal={false}
            />
            <XAxis
              type="number"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 12 }}
            />
            <YAxis
              type="category"
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 12 }}
              width={110}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
            <Bar dataKey="critical" stackId="a" fill="#EF4444" radius={[0, 0, 0, 0]} />
            <Bar dataKey="high" stackId="a" fill="#F97316" />
            <Bar dataKey="medium" stackId="a" fill="#EAB308" />
            <Bar dataKey="low" stackId="a" fill="#22C55E" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* View All Link */}
      <Link href="/dashboard/findings" className="block mt-4">
        <Button
          variant="ghost"
          size="sm"
          className="w-full text-primary hover:text-primary/80 hover:bg-primary/10 gap-2"
        >
          View All Findings by Resource
          <ArrowRight className="w-4 h-4" />
        </Button>
      </Link>
    </GlassCard>
  );
}

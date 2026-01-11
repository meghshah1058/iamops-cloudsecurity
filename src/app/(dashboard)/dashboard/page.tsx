"use client";

import { useEffect, useState } from "react";
import {
  SeverityStatsRow,
  ActivityFeed,
  PhaseSummary,
  SecurityScore,
  QuickActions,
  GlassCard,
} from "@/components/dashboard";
import {
  FindingsTrendChart,
  SeverityDistributionChart,
  TopResourcesChart,
} from "@/components/charts";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Play, Sparkles, AlertTriangle, ArrowRight, RefreshCw } from "lucide-react";
import Link from "next/link";

interface DashboardData {
  stats: {
    totalFindings: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
    riskScore: number;
    accountName: string;
    lastScanAt: string | null;
  };
  phases: Array<{
    id: string;
    phaseNumber: number;
    name: string;
    status: string;
    findings: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
  }>;
  findings: Array<{
    id: string;
    findingId: string;
    severity: string;
    title: string;
    description?: string;
    resource: string;
    resourceArn?: string;
    region?: string;
    recommendation?: string;
    status: string;
  }>;
  historicalAudits: Array<{
    id: string;
    critical: number;
    high: number;
    medium: number;
    low: number;
    completedAt: string;
  }>;
  accounts: Array<{
    id: string;
    name: string;
    accountId: string;
  }>;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/dashboard");
      if (!response.ok) {
        throw new Error("Failed to fetch dashboard data");
      }
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const criticalFindings = data?.findings.filter(f => f.severity === "CRITICAL") || [];

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Skeleton className="h-8 w-48 bg-white/10" />
            <Skeleton className="h-4 w-64 mt-2 bg-white/10" />
          </div>
          <Skeleton className="h-10 w-32 bg-white/10" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-32 bg-white/10 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="lg:col-span-2 h-80 bg-white/10 rounded-2xl" />
          <Skeleton className="h-80 bg-white/10 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <AlertTriangle className="w-12 h-12 text-red-400 mb-4" />
        <h2 className="text-xl font-semibold text-white mb-2">Failed to load dashboard</h2>
        <p className="text-white/50 mb-4">{error}</p>
        <Button onClick={fetchDashboardData} className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Try Again
        </Button>
      </div>
    );
  }

  const severityData = {
    critical: data?.stats.critical || 0,
    high: data?.stats.high || 0,
    medium: data?.stats.medium || 0,
    low: data?.stats.low || 0,
    total: data?.stats.totalFindings || 0,
    changes: {
      critical: "from last scan",
      high: "from last scan",
      medium: "from last scan",
      low: "from last scan",
      total: "from last scan",
    },
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Security Dashboard</h1>
          <p className="text-white/50 mt-1">
            {data?.stats.accountName ? (
              <>Account: <span className="text-primary">{data.stats.accountName}</span></>
            ) : (
              "Overview of your AWS security posture"
            )}
          </p>
        </div>
        <Button className="btn-gradient gap-2">
          <Play className="w-4 h-4" />
          Run Full Audit
        </Button>
      </div>

      {/* Stats Cards Row */}
      <SeverityStatsRow {...severityData} />

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <FindingsTrendChart data={data?.historicalAudits} />
        </div>
        <div>
          <SeverityDistributionChart
            critical={severityData.critical}
            high={severityData.high}
            medium={severityData.medium}
            low={severityData.low}
          />
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          {/* Top Vulnerable Resources */}
          <TopResourcesChart findings={data?.findings} />

          {/* Recent Activity */}
          <ActivityFeed findings={data?.findings} />
        </div>

        {/* Right Column - 1/3 width */}
        <div className="space-y-6">
          {/* AI Security Insights */}
          <GlassCard className="p-6 border-primary/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">AI Insights</h3>
                <p className="text-xs text-white/40">Powered by Claude</p>
              </div>
            </div>
            <div className="space-y-3 text-sm">
              <p className="text-white/70">
                Your <span className="text-primary font-medium">{data?.stats.accountName}</span> account
                has <Link href="/dashboard/findings?severity=CRITICAL" className="text-red-400 hover:text-red-300 underline underline-offset-2">
                  {data?.stats.critical || 0} critical issues
                </Link> requiring immediate attention.
              </p>
              <ul className="space-y-2 text-white/60">
                {criticalFindings.slice(0, 3).map((finding) => (
                  <Link key={finding.id} href="/dashboard/findings?severity=CRITICAL" className="block">
                    <li className="flex items-start gap-2 hover:text-white transition-colors cursor-pointer">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 flex-shrink-0" />
                      {finding.title}
                    </li>
                  </Link>
                ))}
                {criticalFindings.length === 0 && (
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 mt-1.5 flex-shrink-0" />
                    No critical issues found - great work!
                  </li>
                )}
              </ul>
            </div>
            <Link href="/dashboard/findings">
              <Button
                variant="ghost"
                className="w-full mt-4 text-primary hover:text-primary/80 hover:bg-primary/10 gap-2"
              >
                View All Findings
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </GlassCard>

          {/* Security Score */}
          <SecurityScore score={data?.stats.riskScore || 0} previousScore={(data?.stats.riskScore || 0) - 5} />

          {/* Critical Alerts */}
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Critical Alerts</h3>
              <Link href="/dashboard/findings?severity=CRITICAL">
                <span className="text-xs px-2 py-1 rounded-full bg-red-500/10 text-red-400 font-medium hover:bg-red-500/20 cursor-pointer transition-colors">
                  {criticalFindings.length} active
                </span>
              </Link>
            </div>
            <div className="space-y-3">
              {criticalFindings.length === 0 ? (
                <p className="text-white/40 text-sm text-center py-4">No critical alerts</p>
              ) : (
                criticalFindings.slice(0, 3).map((finding) => (
                  <Link key={finding.id} href="/dashboard/findings?severity=CRITICAL">
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-red-500/5 border border-red-500/10 hover:border-red-500/30 hover:bg-red-500/10 transition-all cursor-pointer group">
                      <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white/80 font-medium truncate group-hover:text-white">
                          {finding.title}
                        </p>
                        <p className="text-xs text-white/40 mt-0.5">
                          {finding.resource}
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-red-400 transition-colors" />
                    </div>
                  </Link>
                ))
              )}
            </div>
            {criticalFindings.length > 0 && (
              <Link href="/dashboard/findings?severity=CRITICAL">
                <Button
                  variant="ghost"
                  className="w-full mt-4 text-red-400/70 hover:text-red-400 hover:bg-red-500/10 gap-2"
                >
                  View All Critical Findings ({criticalFindings.length})
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            )}
          </GlassCard>

          {/* Quick Actions */}
          <QuickActions />
        </div>
      </div>

      {/* Phase Summary */}
      <PhaseSummary phases={data?.phases} />
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { GlassCard } from "@/components/dashboard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  Shield,
  ArrowLeft,
  Clock,
  Calendar,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  RefreshCw,
  Download,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { format } from "date-fns";

interface Finding {
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
}

interface Phase {
  id: string;
  phaseNumber: number;
  name: string;
  status: string;
  findings: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  duration?: number;
}

interface AuditDetail {
  id: string;
  status: string;
  riskScore: number | null;
  totalFindings: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  duration: number | null;
  errorMessage: string | null;
  startedAt: string | null;
  completedAt: string | null;
  account: {
    name: string;
    accountId: string;
  };
  phases: Phase[];
  findings: Finding[];
}

const severityConfig = {
  CRITICAL: { color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20" },
  HIGH: { color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20" },
  MEDIUM: { color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20" },
  LOW: { color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/20" },
};

const statusConfig = {
  completed: { icon: CheckCircle, color: "text-green-400", bg: "bg-green-500/10", label: "Completed" },
  running: { icon: RefreshCw, color: "text-blue-400", bg: "bg-blue-500/10", label: "Running" },
  failed: { icon: XCircle, color: "text-red-400", bg: "bg-red-500/10", label: "Failed" },
  pending: { icon: Clock, color: "text-white/40", bg: "bg-white/5", label: "Pending" },
};

export default function AuditDetailPage() {
  const params = useParams();
  const [audit, setAudit] = useState<AuditDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedPhases, setExpandedPhases] = useState<string[]>([]);

  useEffect(() => {
    const fetchAudit = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/audits/${params.id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch audit");
        }
        const data = await response.json();
        setAudit(data.audit);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchAudit();
    }
  }, [params.id]);

  const togglePhase = (phaseId: string) => {
    setExpandedPhases((prev) =>
      prev.includes(phaseId)
        ? prev.filter((id) => id !== phaseId)
        : [...prev, phaseId]
    );
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-lg bg-white/10" />
          <div>
            <Skeleton className="h-8 w-48 bg-white/10" />
            <Skeleton className="h-4 w-32 mt-2 bg-white/10" />
          </div>
        </div>
        <div className="grid grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-24 bg-white/10 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-96 bg-white/10 rounded-2xl" />
      </div>
    );
  }

  if (error || !audit) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <AlertTriangle className="w-12 h-12 text-red-400 mb-4" />
        <h2 className="text-xl font-semibold text-white mb-2">Failed to load audit</h2>
        <p className="text-white/50 mb-4">{error || "Audit not found"}</p>
        <Link href="/dashboard/audits">
          <Button className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Audits
          </Button>
        </Link>
      </div>
    );
  }

  const status = statusConfig[audit.status as keyof typeof statusConfig] || statusConfig.pending;
  const StatusIcon = status.icon;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/audits">
            <Button variant="ghost" size="icon" className="hover:bg-white/10">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="p-3 rounded-xl bg-primary/10">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">{audit.account.name}</h1>
            <p className="text-white/50 font-mono text-sm">{audit.account.accountId}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="bg-white/5 border-white/10 gap-2">
            <Download className="w-4 h-4" />
            Export Report
          </Button>
          <Link href="/dashboard/findings">
            <Button className="btn-gradient gap-2">
              <ExternalLink className="w-4 h-4" />
              View Findings
            </Button>
          </Link>
        </div>
      </div>

      {/* Status & Time */}
      <GlassCard className="p-4">
        <div className="flex flex-wrap items-center gap-6">
          <div className={cn("flex items-center gap-2 px-3 py-1.5 rounded-full", status.bg, status.color)}>
            <StatusIcon className={cn("w-4 h-4", audit.status === "running" && "animate-spin")} />
            <span className="font-medium">{status.label}</span>
          </div>
          {audit.startedAt && (
            <div className="flex items-center gap-2 text-white/50">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">
                {format(new Date(audit.startedAt), "MMM d, yyyy h:mm a")}
              </span>
            </div>
          )}
          {audit.duration && (
            <div className="flex items-center gap-2 text-white/50">
              <Clock className="w-4 h-4" />
              <span className="text-sm">{Math.floor(audit.duration / 60)} min {audit.duration % 60} sec</span>
            </div>
          )}
          {audit.riskScore !== null && (
            <div className={cn(
              "ml-auto px-4 py-1.5 rounded-full font-bold text-lg",
              audit.riskScore >= 80 ? "bg-green-500/10 text-green-400" :
              audit.riskScore >= 60 ? "bg-yellow-500/10 text-yellow-400" :
              "bg-red-500/10 text-red-400"
            )}>
              {audit.riskScore}% Score
            </div>
          )}
        </div>
      </GlassCard>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <Link href="/dashboard/findings" className="block">
          <GlassCard className="p-4 hover:scale-[1.02] transition-all cursor-pointer">
            <p className="text-xs text-white/50 uppercase">Total</p>
            <p className="text-2xl font-bold text-white mt-1">{audit.totalFindings}</p>
          </GlassCard>
        </Link>
        <Link href="/dashboard/findings?severity=CRITICAL" className="block">
          <GlassCard className="p-4 border-red-500/20 hover:border-red-500/40 hover:scale-[1.02] transition-all cursor-pointer">
            <p className="text-xs text-red-400/70 uppercase">Critical</p>
            <p className="text-2xl font-bold text-red-400 mt-1">{audit.critical}</p>
          </GlassCard>
        </Link>
        <Link href="/dashboard/findings?severity=HIGH" className="block">
          <GlassCard className="p-4 border-orange-500/20 hover:border-orange-500/40 hover:scale-[1.02] transition-all cursor-pointer">
            <p className="text-xs text-orange-400/70 uppercase">High</p>
            <p className="text-2xl font-bold text-orange-400 mt-1">{audit.high}</p>
          </GlassCard>
        </Link>
        <Link href="/dashboard/findings?severity=MEDIUM" className="block">
          <GlassCard className="p-4 border-yellow-500/20 hover:border-yellow-500/40 hover:scale-[1.02] transition-all cursor-pointer">
            <p className="text-xs text-yellow-400/70 uppercase">Medium</p>
            <p className="text-2xl font-bold text-yellow-400 mt-1">{audit.medium}</p>
          </GlassCard>
        </Link>
        <Link href="/dashboard/findings?severity=LOW" className="block">
          <GlassCard className="p-4 border-green-500/20 hover:border-green-500/40 hover:scale-[1.02] transition-all cursor-pointer">
            <p className="text-xs text-green-400/70 uppercase">Low</p>
            <p className="text-2xl font-bold text-green-400 mt-1">{audit.low}</p>
          </GlassCard>
        </Link>
      </div>

      {/* Phases */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-white">Audit Phases</h3>
            <p className="text-sm text-white/40 mt-1">{audit.phases?.length || 0} phases completed</p>
          </div>
          <Progress
            value={100}
            className="w-32 h-2 bg-white/10"
          />
        </div>

        <div className="space-y-2">
          {audit.phases?.map((phase) => {
            const isExpanded = expandedPhases.includes(phase.id);
            const phaseFindings = audit.findings?.filter(f =>
              f.findingId.startsWith(phase.name.split(" ")[0].replace(/[^A-Z]/g, ""))
            ) || [];

            return (
              <div
                key={phase.id}
                className="rounded-lg border border-white/10 bg-white/5 hover:border-white/20 transition-all"
              >
                <button
                  onClick={() => togglePhase(phase.id)}
                  className="w-full flex items-center gap-4 p-4 text-left"
                >
                  <div className="flex-shrink-0">
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-white/40" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-white/40" />
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-white/40 font-mono">
                        #{phase.phaseNumber.toString().padStart(2, "0")}
                      </span>
                      <span className="text-sm font-medium text-white">
                        {phase.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-xs text-white/40">{phase.findings} findings</span>
                    </div>
                  </div>

                  {/* Severity badges */}
                  <div className="flex items-center gap-2">
                    {phase.critical > 0 && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/10 text-red-400">
                        {phase.critical}
                      </span>
                    )}
                    {phase.high > 0 && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400">
                        {phase.high}
                      </span>
                    )}
                    {phase.medium > 0 && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400">
                        {phase.medium}
                      </span>
                    )}
                    {phase.low > 0 && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-400">
                        {phase.low}
                      </span>
                    )}
                  </div>

                  <CheckCircle className="w-4 h-4 text-green-400" />
                </button>

                {/* Expanded findings */}
                {isExpanded && phaseFindings.length > 0 && (
                  <div className="px-4 pb-4 border-t border-white/5">
                    <div className="mt-4 space-y-2">
                      {phaseFindings.map((finding) => {
                        const config = severityConfig[finding.severity as keyof typeof severityConfig] || severityConfig.MEDIUM;
                        return (
                          <Link
                            key={finding.id}
                            href="/dashboard/findings"
                            className="block"
                          >
                            <div className={cn(
                              "flex items-center gap-3 p-3 rounded-lg border transition-all hover:scale-[1.01] cursor-pointer",
                              config.border,
                              config.bg
                            )}>
                              <span className={cn("px-2 py-0.5 rounded text-xs font-bold uppercase", config.bg, config.color)}>
                                {finding.severity}
                              </span>
                              <span className="text-xs text-white/50 font-mono">{finding.findingId}</span>
                              <span className="flex-1 text-sm text-white truncate">{finding.title}</span>
                              <ChevronRight className="w-4 h-4 text-white/20" />
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </GlassCard>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { GlassCard } from "@/components/dashboard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Shield,
  Play,
  Search,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  ChevronRight,
  Calendar,
  Filter,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { format } from "date-fns";

interface Audit {
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
}

const statusConfig = {
  completed: {
    icon: CheckCircle,
    color: "text-green-400",
    bg: "bg-green-500/10",
    label: "Completed",
    animate: false,
  },
  running: {
    icon: Loader2,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    label: "Running",
    animate: true,
  },
  failed: {
    icon: XCircle,
    color: "text-red-400",
    bg: "bg-red-500/10",
    label: "Failed",
    animate: false,
  },
  pending: {
    icon: Clock,
    color: "text-white/40",
    bg: "bg-white/5",
    label: "Pending",
    animate: false,
  },
};

export default function AuditsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [audits, setAudits] = useState<Audit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAudits = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/audits");
      if (!response.ok) {
        throw new Error("Failed to fetch audits");
      }
      const data = await response.json();
      setAudits(data.audits || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAudits();
  }, []);

  const filteredAudits = audits.filter((audit) => {
    const matchesSearch =
      audit.account.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      audit.account.accountId.includes(searchQuery);
    const matchesStatus =
      statusFilter === "all" || audit.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32 bg-white/10 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Security Audits</h1>
          <p className="text-white/50 mt-1">
            View and manage security audit history
          </p>
        </div>
        <Button className="btn-gradient gap-2">
          <Play className="w-4 h-4" />
          New Audit
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <Input
            placeholder="Search audits..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white/5 border-white/10 text-white"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px] bg-white/5 border-white/10 text-white">
            <Filter className="w-4 h-4 mr-2 text-white/40" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="running">Running</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Audits List */}
      <div className="space-y-4">
        {filteredAudits.map((audit) => {
          const status = statusConfig[audit.status as keyof typeof statusConfig] || statusConfig.pending;
          const StatusIcon = status.icon;
          const totalFindings = audit.totalFindings;
          const progress = audit.status === "completed" ? 100 : audit.status === "running" ? 60 : 0;

          return (
            <Link key={audit.id} href={`/dashboard/audits/${audit.id}`}>
              <GlassCard className="p-5 hover:border-white/20 cursor-pointer group">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  {/* Left: Account Info */}
                  <div className="flex items-center gap-4 lg:w-1/4">
                    <div className="p-3 rounded-xl bg-primary/10">
                      <Shield className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">
                        {audit.account.name}
                      </h3>
                      <p className="text-xs text-white/40 font-mono">
                        {audit.account.accountId}
                      </p>
                    </div>
                  </div>

                  {/* Center: Status & Progress */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <div
                        className={cn(
                          "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
                          status.bg,
                          status.color
                        )}
                      >
                        <StatusIcon
                          className={cn(
                            "w-3 h-3",
                            status.animate && "animate-spin"
                          )}
                        />
                        {status.label}
                      </div>
                      <span className="text-xs text-white/40">
                        {totalFindings} findings
                      </span>
                    </div>
                    <Progress value={progress} className="h-1.5 bg-white/10" />
                    {audit.errorMessage && (
                      <p className="text-xs text-red-400">{audit.errorMessage}</p>
                    )}
                  </div>

                  {/* Right: Findings & Time */}
                  <div className="flex items-center gap-6 lg:w-1/3 justify-end">
                    {audit.status === "completed" && (
                      <>
                        {/* Findings */}
                        <div className="flex items-center gap-2">
                          {audit.critical > 0 && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/10 text-red-400">
                              {audit.critical} critical
                            </span>
                          )}
                          {audit.high > 0 && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400">
                              {audit.high} high
                            </span>
                          )}
                        </div>

                        {/* Score */}
                        {audit.riskScore !== null && (
                          <div
                            className={cn(
                              "text-lg font-bold",
                              audit.riskScore >= 80
                                ? "text-green-400"
                                : audit.riskScore >= 60
                                ? "text-yellow-400"
                                : "text-red-400"
                            )}
                          >
                            {audit.riskScore}%
                          </div>
                        )}
                      </>
                    )}

                    {/* Time */}
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-xs text-white/40">
                        <Calendar className="w-3 h-3" />
                        {audit.startedAt
                          ? format(new Date(audit.startedAt), "MMM d, h:mm a")
                          : "Not started"}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-white/30 mt-0.5">
                        <Clock className="w-3 h-3" />
                        {audit.duration
                          ? `${Math.floor(audit.duration / 60)} min`
                          : "In progress..."}
                      </div>
                    </div>

                    {/* Arrow */}
                    <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-white/40 transition-colors" />
                  </div>
                </div>
              </GlassCard>
            </Link>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredAudits.length === 0 && !loading && (
        <div className="text-center py-12">
          <Shield className="w-12 h-12 text-white/20 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No audits found</h3>
          <p className="text-white/50 mb-4">
            {searchQuery || statusFilter !== "all"
              ? "Try adjusting your filters"
              : "Run your first security audit to get started"}
          </p>
          {!searchQuery && statusFilter === "all" && (
            <Button className="btn-gradient gap-2">
              <Play className="w-4 h-4" />
              Start Audit
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

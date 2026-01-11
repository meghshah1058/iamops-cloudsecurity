"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { GlassCard } from "@/components/dashboard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertTriangle,
  Search,
  ChevronRight,
  Copy,
  Check,
  Shield,
  ExternalLink,
  Filter,
  Download,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  ArrowLeft,
  Lightbulb,
  AlertOctagon,
  Wrench,
  Server,
  Cloud,
  Key,
  Database,
  Globe,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import Link from "next/link";

interface Finding {
  id: string;
  findingId: string;
  severity: string;
  title: string;
  description?: string;
  resource: string;
  resourcePath?: string;
  region?: string;
  recommendation?: string;
  status: string;
}

const severityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };

const severityConfig = {
  CRITICAL: { color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20", label: "Critical" },
  HIGH: { color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20", label: "High" },
  MEDIUM: { color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20", label: "Medium" },
  LOW: { color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/20", label: "Low" },
};

const statusConfig = {
  open: { color: "text-red-400", bg: "bg-red-500/10", icon: AlertTriangle, label: "Open" },
  resolved: { color: "text-green-400", bg: "bg-green-500/10", icon: CheckCircle, label: "Resolved" },
  ignored: { color: "text-white/40", bg: "bg-white/5", icon: XCircle, label: "Ignored" },
};

const getCategoryIcon = (findingId: string) => {
  const prefix = findingId.split("-")[1] || findingId.split("-")[0];
  const iconMap: Record<string, any> = {
    "IAM": Key,
    "GCS": Database,
    "VPC": Globe,
    "LOG": AlertTriangle,
    "GCE": Server,
    "SQL": Database,
    "GKE": Cloud,
    "KMS": Key,
  };
  return iconMap[prefix] || Shield;
};

const getImpactInfo = (severity: string) => {
  const impacts: Record<string, { title: string; description: string; riskLevel: string }> = {
    CRITICAL: {
      title: "Immediate Action Required",
      description: "This vulnerability poses an immediate threat to your GCP infrastructure. Attackers could exploit this to gain unauthorized access or compromise your cloud environment.",
      riskLevel: "Maximum Risk - Exploitable Now",
    },
    HIGH: {
      title: "High Priority Fix Needed",
      description: "This security gap significantly weakens your defense posture and creates opportunities for attackers.",
      riskLevel: "Significant Risk - Action Within 24-48 Hours",
    },
    MEDIUM: {
      title: "Security Enhancement Recommended",
      description: "This configuration doesn't follow GCP security best practices. Addressing this will strengthen your security posture.",
      riskLevel: "Moderate Risk - Plan Remediation This Week",
    },
    LOW: {
      title: "Best Practice Improvement",
      description: "This finding represents a deviation from security best practices. Fixing it contributes to a stronger security baseline.",
      riskLevel: "Low Risk - Address During Maintenance Window",
    },
  };
  return impacts[severity] || impacts.MEDIUM;
};

const parseRecommendationSteps = (recommendation: string | undefined): string[] => {
  if (!recommendation) {
    return ["Review the affected resource configuration", "Apply GCP security best practices", "Verify changes in GCP Console"];
  }
  const steps = recommendation.split(/(?:\d+\.\s)/).map(s => s.trim()).filter(s => s.length > 5);
  return steps.length >= 2 ? steps : [recommendation];
};

export default function GcpFindingsPage() {
  const searchParams = useSearchParams();
  const initialSeverity = searchParams.get("severity") || "all";

  const [findings, setFindings] = useState<Finding[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState(initialSeverity);
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedFinding, setSelectedFinding] = useState<Finding | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchFindings = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/gcp/findings");
      if (response.ok) {
        const data = await response.json();
        setFindings(data.findings || []);
      }
    } catch (error) {
      console.error("Failed to fetch findings:", error);
      toast.error("Failed to load findings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFindings();
  }, []);

  useEffect(() => {
    const severity = searchParams.get("severity");
    if (severity) setSeverityFilter(severity);
  }, [searchParams]);

  const filteredFindings = findings
    .filter((finding) => {
      const matchesSearch =
        finding.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        finding.findingId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        finding.resource.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSeverity = severityFilter === "all" || finding.severity === severityFilter;
      const matchesStatus = statusFilter === "all" || finding.status === statusFilter;
      return matchesSearch && matchesSeverity && matchesStatus;
    })
    .sort((a, b) => {
      const aOrder = severityOrder[a.severity as keyof typeof severityOrder] ?? 4;
      const bOrder = severityOrder[b.severity as keyof typeof severityOrder] ?? 4;
      return aOrder - bOrder;
    });

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const updateFindingStatus = async (findingId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/gcp/findings/${findingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (response.ok) {
        setFindings(findings.map(f => f.id === findingId ? { ...f, status: newStatus } : f));
        toast.success(`Finding marked as ${newStatus}`);
        setSelectedFinding(null);
      }
    } catch (error) {
      toast.error("Failed to update finding");
    }
  };

  const stats = {
    total: findings.length,
    critical: findings.filter(f => f.severity === "CRITICAL").length,
    high: findings.filter(f => f.severity === "HIGH").length,
    medium: findings.filter(f => f.severity === "MEDIUM").length,
    low: findings.filter(f => f.severity === "LOW").length,
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Skeleton className="h-8 w-48 bg-white/10" />
        <div className="grid grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-24 bg-white/10 rounded-xl" />)}
        </div>
        <Skeleton className="h-96 bg-white/10 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/gcp">
            <Button variant="ghost" size="icon" className="hover:bg-white/10">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-500/10">
              <Cloud className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">GCP Security Findings</h1>
              <p className="text-white/50 mt-1">{filteredFindings.length} of {findings.length} findings</p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="bg-white/5 border-white/10 gap-2" onClick={fetchFindings}>
            <RefreshCw className="w-4 h-4" /> Refresh
          </Button>
          <Button className="btn-gradient gap-2">
            <Download className="w-4 h-4" /> Export
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: "Total", value: stats.total, filter: "all", color: "white" },
          { label: "Critical", value: stats.critical, filter: "CRITICAL", color: "red" },
          { label: "High", value: stats.high, filter: "HIGH", color: "orange" },
          { label: "Medium", value: stats.medium, filter: "MEDIUM", color: "yellow" },
          { label: "Low", value: stats.low, filter: "LOW", color: "green" },
        ].map((stat) => (
          <button
            key={stat.label}
            onClick={() => setSeverityFilter(stat.filter)}
            className={cn(
              "p-4 rounded-xl border transition-all text-left",
              severityFilter === stat.filter
                ? `bg-${stat.color}-500/20 border-${stat.color}-500/50`
                : `bg-${stat.color}-500/10 border-${stat.color}-500/20 hover:border-${stat.color}-500/40`
            )}
          >
            <p className={`text-xs text-${stat.color}-400/70 uppercase`}>{stat.label}</p>
            <p className={`text-2xl font-bold text-${stat.color}-400 mt-1`}>{stat.value}</p>
          </button>
        ))}
      </div>

      {/* Filters */}
      <GlassCard className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <Input
              placeholder="Search findings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/5 border-white/10 text-white"
            />
          </div>
          <Select value={severityFilter} onValueChange={setSeverityFilter}>
            <SelectTrigger className="w-[160px] bg-white/5 border-white/10 text-white">
              <Filter className="w-4 h-4 mr-2 text-white/40" />
              <SelectValue placeholder="Severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severity</SelectItem>
              <SelectItem value="CRITICAL">Critical</SelectItem>
              <SelectItem value="HIGH">High</SelectItem>
              <SelectItem value="MEDIUM">Medium</SelectItem>
              <SelectItem value="LOW">Low</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px] bg-white/5 border-white/10 text-white">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="ignored">Ignored</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </GlassCard>

      {/* Findings List */}
      <div className="space-y-3">
        {filteredFindings.length === 0 ? (
          <GlassCard className="p-12 text-center">
            <Shield className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No findings found</h3>
            <p className="text-white/50">Try adjusting your filters</p>
          </GlassCard>
        ) : (
          filteredFindings.map((finding) => {
            const config = severityConfig[finding.severity as keyof typeof severityConfig] || severityConfig.MEDIUM;
            const status = statusConfig[finding.status as keyof typeof statusConfig] || statusConfig.open;
            const StatusIcon = status.icon;
            const CategoryIcon = getCategoryIcon(finding.findingId);
            const impact = getImpactInfo(finding.severity);

            return (
              <GlassCard
                key={finding.id}
                className={cn("p-0 overflow-hidden cursor-pointer transition-all hover:scale-[1.005]", config.border)}
                onClick={() => setSelectedFinding(finding)}
              >
                <div className="flex items-start gap-4 p-4">
                  <div className="flex flex-col items-center gap-2">
                    <div className={cn("p-2.5 rounded-xl", config.bg)}>
                      <CategoryIcon className={cn("w-5 h-5", config.color)} />
                    </div>
                    <div className={cn("px-2 py-1 rounded text-[10px] font-bold uppercase", config.bg, config.color)}>
                      {finding.severity}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-white/40 font-mono">{finding.findingId}</span>
                          {finding.region && (
                            <span className="text-xs text-white/30 px-1.5 py-0.5 bg-white/5 rounded">{finding.region}</span>
                          )}
                        </div>
                        <h3 className="text-sm font-semibold text-white">{finding.title}</h3>
                      </div>
                      <div className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs flex-shrink-0", status.bg, status.color)}>
                        <StatusIcon className="w-3 h-3" />
                        {status.label}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <Server className="w-3 h-3 text-white/30" />
                      <span className="text-white/50 truncate">{finding.resource}</span>
                    </div>
                    {finding.description && (
                      <p className="text-xs text-white/40 line-clamp-2">{finding.description}</p>
                    )}
                    <div className={cn("flex items-center gap-2 text-xs px-2 py-1.5 rounded-lg", config.bg)}>
                      <AlertOctagon className={cn("w-3 h-3", config.color)} />
                      <span className={cn("font-medium", config.color)}>{impact.riskLevel}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-white/20 self-center" />
                </div>
                {finding.recommendation && (
                  <div className="px-4 pb-4">
                    <div className="flex items-start gap-2 p-3 bg-blue-500/5 rounded-lg border border-blue-500/10">
                      <Lightbulb className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-white/60 line-clamp-2">{finding.recommendation}</p>
                    </div>
                  </div>
                )}
              </GlassCard>
            );
          })
        )}
      </div>

      {/* Detail Modal */}
      <Dialog open={!!selectedFinding} onOpenChange={() => setSelectedFinding(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-background border-white/10">
          {selectedFinding && (() => {
            const config = severityConfig[selectedFinding.severity as keyof typeof severityConfig] || severityConfig.MEDIUM;
            const CategoryIcon = getCategoryIcon(selectedFinding.findingId);
            const impact = getImpactInfo(selectedFinding.severity);
            const steps = parseRecommendationSteps(selectedFinding.recommendation);
            const status = statusConfig[selectedFinding.status as keyof typeof statusConfig] || statusConfig.open;
            const StatusIcon = status.icon;

            return (
              <>
                <DialogHeader className="pb-4 border-b border-white/10">
                  <div className="flex items-start gap-4">
                    <div className={cn("p-3 rounded-xl", config.bg)}>
                      <CategoryIcon className={cn("w-6 h-6", config.color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <div className={cn("px-2.5 py-1 rounded-lg text-xs font-bold uppercase", config.bg, config.color)}>
                          {selectedFinding.severity}
                        </div>
                        <span className="text-xs text-white/40 font-mono bg-white/5 px-2 py-1 rounded">
                          {selectedFinding.findingId}
                        </span>
                        {selectedFinding.region && (
                          <span className="text-xs text-white/40 bg-white/5 px-2 py-1 rounded flex items-center gap-1">
                            <Globe className="w-3 h-3" />
                            {selectedFinding.region}
                          </span>
                        )}
                        <div className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs ml-auto", status.bg, status.color)}>
                          <StatusIcon className="w-3 h-3" />
                          {status.label}
                        </div>
                      </div>
                      <DialogTitle className="text-xl text-white">{selectedFinding.title}</DialogTitle>
                    </div>
                  </div>
                </DialogHeader>

                <div className="space-y-6 mt-6">
                  {/* Impact */}
                  <div className={cn("p-4 rounded-xl border", config.border, config.bg)}>
                    <div className="flex items-start gap-3">
                      <AlertOctagon className={cn("w-5 h-5 mt-0.5", config.color)} />
                      <div className="space-y-2">
                        <h4 className={cn("font-semibold", config.color)}>{impact.title}</h4>
                        <p className="text-sm text-white/70">{impact.description}</p>
                        <div className={cn("inline-flex items-center gap-2 text-xs font-medium px-2.5 py-1 rounded-full", config.bg, config.color)}>
                          <Clock className="w-3 h-3" />
                          {impact.riskLevel}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Resource */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                      <Server className="w-4 h-4 text-white/40" />
                      Affected Resource
                    </h4>
                    <div className="bg-white/5 rounded-xl p-4">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs text-white/40 uppercase">Resource</span>
                        <Button variant="ghost" size="sm" className="h-7 text-xs text-white/40" onClick={() => copyToClipboard(selectedFinding.resource, selectedFinding.id)}>
                          {copiedId === selectedFinding.id ? <><Check className="w-3 h-3 mr-1 text-green-400" /> Copied</> : <><Copy className="w-3 h-3 mr-1" /> Copy</>}
                        </Button>
                      </div>
                      <code className="block text-sm text-white/80 font-mono break-all mt-1">{selectedFinding.resource}</code>
                      {selectedFinding.resourcePath && (
                        <>
                          <div className="border-t border-white/10 my-3" />
                          <span className="text-xs text-white/40 uppercase">Path</span>
                          <code className="block text-xs text-white/60 font-mono break-all mt-1">{selectedFinding.resourcePath}</code>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  {selectedFinding.description && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                        <Info className="w-4 h-4 text-white/40" />
                        Vulnerability Details
                      </h4>
                      <div className="bg-white/5 rounded-xl p-4">
                        <p className="text-sm text-white/70">{selectedFinding.description}</p>
                      </div>
                    </div>
                  )}

                  {/* Remediation Steps */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                      <Wrench className="w-4 h-4 text-blue-400" />
                      Remediation Steps
                    </h4>
                    <div className="bg-blue-500/5 rounded-xl p-4 border border-blue-500/20">
                      <ol className="space-y-3">
                        {steps.map((step, i) => (
                          <li key={i} className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold bg-blue-500/20 text-blue-400">
                              {i + 1}
                            </span>
                            <span className="text-sm text-white/80 pt-0.5">{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>

                  {/* GCP Console Link */}
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <ExternalLink className="w-5 h-5 text-white/40" />
                        <div>
                          <p className="text-sm font-medium text-white">Open in GCP Console</p>
                          <p className="text-xs text-white/40">Navigate directly to the affected resource</p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-white/5 border-white/10 text-white/70"
                        onClick={() => window.open("https://console.cloud.google.com", "_blank")}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Open Console
                      </Button>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-4 border-t border-white/10">
                    <Button
                      className="flex-1 bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30"
                      onClick={() => updateFindingStatus(selectedFinding.id, "resolved")}
                      disabled={selectedFinding.status === "resolved"}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Mark as Resolved
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 bg-white/5 border-white/10 text-white/70"
                      onClick={() => updateFindingStatus(selectedFinding.id, "ignored")}
                      disabled={selectedFinding.status === "ignored"}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Ignore Finding
                    </Button>
                  </div>
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}

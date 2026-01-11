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
  ChevronDown,
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
  FileWarning,
  Terminal,
  Globe,
  Server,
  Database,
  Key,
  ShieldAlert,
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
  resourceArn?: string;
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

// Get category icon based on finding ID prefix
const getCategoryIcon = (findingId: string) => {
  const prefix = findingId.split("-")[0];
  const iconMap: Record<string, any> = {
    "IAM": Key,
    "S3": Database,
    "NET": Globe,
    "LOG": FileWarning,
    "EC2": Server,
    "RDS": Database,
    "SEC": ShieldAlert,
    "DNS": Globe,
    "API": Terminal,
  };
  return iconMap[prefix] || Shield;
};

// Get impact description based on severity
const getImpactInfo = (severity: string, findingId: string) => {
  const impacts: Record<string, { title: string; description: string; riskLevel: string }> = {
    CRITICAL: {
      title: "Immediate Action Required",
      description: "This vulnerability poses an immediate threat to your AWS infrastructure. Attackers could exploit this to gain unauthorized access, exfiltrate sensitive data, or compromise your entire cloud environment.",
      riskLevel: "Maximum Risk - Exploitable Now",
    },
    HIGH: {
      title: "High Priority Fix Needed",
      description: "This security gap significantly weakens your defense posture. While not immediately exploitable, it creates opportunities for attackers to escalate privileges or access sensitive resources.",
      riskLevel: "Significant Risk - Action Within 24-48 Hours",
    },
    MEDIUM: {
      title: "Security Enhancement Recommended",
      description: "This configuration doesn't follow AWS security best practices. Addressing this will strengthen your overall security posture and reduce attack surface.",
      riskLevel: "Moderate Risk - Plan Remediation This Week",
    },
    LOW: {
      title: "Best Practice Improvement",
      description: "This finding represents a deviation from security best practices. While the immediate risk is minimal, fixing it contributes to a stronger security baseline.",
      riskLevel: "Low Risk - Address During Maintenance Window",
    },
  };
  return impacts[severity] || impacts.MEDIUM;
};

// Parse recommendation into actionable steps
const parseRecommendationSteps = (recommendation: string | undefined, findingId: string): string[] => {
  if (!recommendation) {
    return ["Review the affected resource configuration", "Apply AWS security best practices", "Verify changes in AWS Console"];
  }

  // Try to split by numbered steps or sentences
  const steps = recommendation
    .split(/(?:\d+\.\s|\n|;\s*(?=[A-Z]))/)
    .map(s => s.trim())
    .filter(s => s.length > 10);

  if (steps.length >= 2) return steps;

  // If no clear steps, create generic steps based on finding type
  const prefix = findingId.split("-")[0];
  const genericSteps: Record<string, string[]> = {
    "IAM": [
      "Navigate to AWS IAM Console",
      "Locate the affected user, role, or policy",
      "Review current permissions and access settings",
      "Apply the principle of least privilege",
      "Test changes to ensure functionality is maintained",
    ],
    "S3": [
      "Open AWS S3 Console",
      "Select the affected bucket",
      "Review bucket policy and ACL settings",
      "Enable recommended security controls",
      "Verify bucket is not publicly accessible",
    ],
    "NET": [
      "Access AWS VPC Console",
      "Review Security Group rules",
      "Remove overly permissive inbound rules",
      "Implement least privilege network access",
      "Verify connectivity after changes",
    ],
    "LOG": [
      "Navigate to CloudTrail or CloudWatch console",
      "Enable logging for the affected service",
      "Configure log retention policies",
      "Set up alerts for suspicious activities",
      "Verify logs are being captured",
    ],
    "EC2": [
      "Open EC2 Console",
      "Select the affected instance",
      "Review security group attachments",
      "Update instance metadata options",
      "Apply security patches if needed",
    ],
  };

  return genericSteps[prefix] || [
    "Review the finding details above",
    recommendation,
    "Verify the fix in AWS Console",
  ];
};

export default function FindingsPage() {
  const searchParams = useSearchParams();
  const initialSeverity = searchParams.get("severity") || "all";
  const initialStatus = searchParams.get("status") || "all";

  const [findings, setFindings] = useState<Finding[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState(initialSeverity);
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [selectedFinding, setSelectedFinding] = useState<Finding | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchFindings = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/findings");
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

  // Update filters when URL params change
  useEffect(() => {
    const severity = searchParams.get("severity");
    const status = searchParams.get("status");
    if (severity) setSeverityFilter(severity);
    if (status) setStatusFilter(status);
  }, [searchParams]);

  const filteredFindings = findings
    .filter((finding) => {
      const matchesSearch =
        finding.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        finding.findingId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        finding.resource.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (finding.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
      const matchesSeverity =
        severityFilter === "all" || finding.severity === severityFilter;
      const matchesStatus =
        statusFilter === "all" || finding.status === statusFilter;
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
      const response = await fetch(`/api/findings/${findingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setFindings(findings.map(f =>
          f.id === findingId ? { ...f, status: newStatus } : f
        ));
        toast.success(`Finding marked as ${newStatus}`);
        setSelectedFinding(null);
      }
    } catch (error) {
      toast.error("Failed to update finding");
    }
  };

  // Stats counts
  const stats = {
    total: findings.length,
    critical: findings.filter(f => f.severity === "CRITICAL").length,
    high: findings.filter(f => f.severity === "HIGH").length,
    medium: findings.filter(f => f.severity === "MEDIUM").length,
    low: findings.filter(f => f.severity === "LOW").length,
    open: findings.filter(f => f.status === "open").length,
    resolved: findings.filter(f => f.status === "resolved").length,
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48 bg-white/10" />
          <Skeleton className="h-10 w-32 bg-white/10" />
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

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" className="hover:bg-white/10">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">Security Findings</h1>
            <p className="text-white/50 mt-1">
              {filteredFindings.length} of {findings.length} findings
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="bg-white/5 border-white/10 gap-2" onClick={fetchFindings}>
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
          <Button className="btn-gradient gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <button
          onClick={() => { setSeverityFilter("all"); setStatusFilter("all"); }}
          className={cn(
            "p-4 rounded-xl border transition-all text-left",
            severityFilter === "all" && statusFilter === "all"
              ? "bg-white/10 border-white/30"
              : "bg-white/5 border-white/10 hover:border-white/20"
          )}
        >
          <p className="text-xs text-white/50 uppercase tracking-wide">Total</p>
          <p className="text-2xl font-bold text-white mt-1">{stats.total}</p>
        </button>

        <button
          onClick={() => { setSeverityFilter("CRITICAL"); setStatusFilter("all"); }}
          className={cn(
            "p-4 rounded-xl border transition-all text-left",
            severityFilter === "CRITICAL"
              ? "bg-red-500/20 border-red-500/50"
              : "bg-red-500/10 border-red-500/20 hover:border-red-500/40"
          )}
        >
          <p className="text-xs text-red-400/70 uppercase tracking-wide">Critical</p>
          <p className="text-2xl font-bold text-red-400 mt-1">{stats.critical}</p>
        </button>

        <button
          onClick={() => { setSeverityFilter("HIGH"); setStatusFilter("all"); }}
          className={cn(
            "p-4 rounded-xl border transition-all text-left",
            severityFilter === "HIGH"
              ? "bg-orange-500/20 border-orange-500/50"
              : "bg-orange-500/10 border-orange-500/20 hover:border-orange-500/40"
          )}
        >
          <p className="text-xs text-orange-400/70 uppercase tracking-wide">High</p>
          <p className="text-2xl font-bold text-orange-400 mt-1">{stats.high}</p>
        </button>

        <button
          onClick={() => { setSeverityFilter("MEDIUM"); setStatusFilter("all"); }}
          className={cn(
            "p-4 rounded-xl border transition-all text-left",
            severityFilter === "MEDIUM"
              ? "bg-yellow-500/20 border-yellow-500/50"
              : "bg-yellow-500/10 border-yellow-500/20 hover:border-yellow-500/40"
          )}
        >
          <p className="text-xs text-yellow-400/70 uppercase tracking-wide">Medium</p>
          <p className="text-2xl font-bold text-yellow-400 mt-1">{stats.medium}</p>
        </button>

        <button
          onClick={() => { setSeverityFilter("LOW"); setStatusFilter("all"); }}
          className={cn(
            "p-4 rounded-xl border transition-all text-left",
            severityFilter === "LOW"
              ? "bg-green-500/20 border-green-500/50"
              : "bg-green-500/10 border-green-500/20 hover:border-green-500/40"
          )}
        >
          <p className="text-xs text-green-400/70 uppercase tracking-wide">Low</p>
          <p className="text-2xl font-bold text-green-400 mt-1">{stats.low}</p>
        </button>

        <button
          onClick={() => { setSeverityFilter("all"); setStatusFilter("open"); }}
          className={cn(
            "p-4 rounded-xl border transition-all text-left",
            statusFilter === "open"
              ? "bg-primary/20 border-primary/50"
              : "bg-primary/10 border-primary/20 hover:border-primary/40"
          )}
        >
          <p className="text-xs text-primary/70 uppercase tracking-wide">Open</p>
          <p className="text-2xl font-bold text-primary mt-1">{stats.open}</p>
        </button>
      </div>

      {/* Filters */}
      <GlassCard className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <Input
              placeholder="Search by title, ID, resource, or description..."
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
            <p className="text-white/50">
              {searchQuery || severityFilter !== "all" || statusFilter !== "all"
                ? "Try adjusting your filters"
                : "Great job! No security findings detected."}
            </p>
          </GlassCard>
        ) : (
          filteredFindings.map((finding) => {
            const config = severityConfig[finding.severity as keyof typeof severityConfig] || severityConfig.MEDIUM;
            const status = statusConfig[finding.status as keyof typeof statusConfig] || statusConfig.open;
            const StatusIcon = status.icon;
            const CategoryIcon = getCategoryIcon(finding.findingId);
            const impact = getImpactInfo(finding.severity, finding.findingId);

            return (
              <GlassCard
                key={finding.id}
                className={cn(
                  "p-0 overflow-hidden cursor-pointer transition-all hover:scale-[1.005] hover:shadow-lg",
                  config.border,
                  "hover:border-opacity-60"
                )}
                onClick={() => setSelectedFinding(finding)}
              >
                {/* Main Content Row */}
                <div className="flex items-start gap-4 p-4">
                  {/* Left: Category Icon & Severity */}
                  <div className="flex flex-col items-center gap-2">
                    <div className={cn("p-2.5 rounded-xl", config.bg)}>
                      <CategoryIcon className={cn("w-5 h-5", config.color)} />
                    </div>
                    <div className={cn("px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider", config.bg, config.color)}>
                      {finding.severity}
                    </div>
                  </div>

                  {/* Center: Main Info */}
                  <div className="flex-1 min-w-0 space-y-2">
                    {/* Title Row */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-white/40 font-mono">{finding.findingId}</span>
                          {finding.region && (
                            <span className="text-xs text-white/30 px-1.5 py-0.5 bg-white/5 rounded">
                              {finding.region}
                            </span>
                          )}
                        </div>
                        <h3 className="text-sm font-semibold text-white leading-tight">
                          {finding.title}
                        </h3>
                      </div>
                      {/* Status Badge */}
                      <div className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs flex-shrink-0", status.bg, status.color)}>
                        <StatusIcon className="w-3 h-3" />
                        {status.label}
                      </div>
                    </div>

                    {/* Resource */}
                    <div className="flex items-center gap-2 text-xs">
                      <Server className="w-3 h-3 text-white/30 flex-shrink-0" />
                      <span className="text-white/50 truncate">{finding.resource}</span>
                    </div>

                    {/* Description Preview */}
                    {finding.description && (
                      <p className="text-xs text-white/40 line-clamp-2 leading-relaxed">
                        {finding.description}
                      </p>
                    )}

                    {/* Impact Preview */}
                    <div className={cn("flex items-center gap-2 text-xs px-2 py-1.5 rounded-lg", config.bg)}>
                      <AlertOctagon className={cn("w-3 h-3 flex-shrink-0", config.color)} />
                      <span className={cn("font-medium", config.color)}>{impact.riskLevel}</span>
                    </div>
                  </div>

                  {/* Right: Arrow */}
                  <div className="flex-shrink-0 self-center">
                    <ChevronRight className="w-5 h-5 text-white/20" />
                  </div>
                </div>

                {/* Recommendation Preview */}
                {finding.recommendation && (
                  <div className="px-4 pb-4 pt-0">
                    <div className="flex items-start gap-2 p-3 bg-primary/5 rounded-lg border border-primary/10">
                      <Lightbulb className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-white/60 line-clamp-2">{finding.recommendation}</p>
                    </div>
                  </div>
                )}
              </GlassCard>
            );
          })
        )}
      </div>

      {/* Finding Detail Modal - Comprehensive View */}
      <Dialog open={!!selectedFinding} onOpenChange={() => setSelectedFinding(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-background border-white/10">
          {selectedFinding && (() => {
            const config = severityConfig[selectedFinding.severity as keyof typeof severityConfig] || severityConfig.MEDIUM;
            const CategoryIcon = getCategoryIcon(selectedFinding.findingId);
            const impact = getImpactInfo(selectedFinding.severity, selectedFinding.findingId);
            const remediationSteps = parseRecommendationSteps(selectedFinding.recommendation, selectedFinding.findingId);
            const status = statusConfig[selectedFinding.status as keyof typeof statusConfig] || statusConfig.open;
            const StatusIcon = status.icon;

            return (
              <>
                {/* Header Section */}
                <DialogHeader className="pb-4 border-b border-white/10">
                  <div className="flex items-start gap-4">
                    {/* Category Icon */}
                    <div className={cn("p-3 rounded-xl", config.bg)}>
                      <CategoryIcon className={cn("w-6 h-6", config.color)} />
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Tags Row */}
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

                      <DialogTitle className="text-xl text-white leading-tight">
                        {selectedFinding.title}
                      </DialogTitle>
                    </div>
                  </div>
                </DialogHeader>

                <div className="space-y-6 mt-6">
                  {/* Impact Assessment Section */}
                  <div className={cn("p-4 rounded-xl border", config.border, config.bg)}>
                    <div className="flex items-start gap-3">
                      <AlertOctagon className={cn("w-5 h-5 flex-shrink-0 mt-0.5", config.color)} />
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h4 className={cn("font-semibold", config.color)}>{impact.title}</h4>
                        </div>
                        <p className="text-sm text-white/70 leading-relaxed">{impact.description}</p>
                        <div className={cn("inline-flex items-center gap-2 text-xs font-medium px-2.5 py-1 rounded-full", config.bg, config.color)}>
                          <Clock className="w-3 h-3" />
                          {impact.riskLevel}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Resource Details */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                      <Server className="w-4 h-4 text-white/40" />
                      Affected Resource
                    </h4>
                    <div className="space-y-2 bg-white/5 rounded-xl p-4">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs text-white/40 uppercase">Resource Name</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs text-white/40 hover:text-white"
                          onClick={() => copyToClipboard(selectedFinding.resource, selectedFinding.id)}
                        >
                          {copiedId === selectedFinding.id ? (
                            <><Check className="w-3 h-3 mr-1 text-green-400" /> Copied</>
                          ) : (
                            <><Copy className="w-3 h-3 mr-1" /> Copy</>
                          )}
                        </Button>
                      </div>
                      <code className="block text-sm text-white/80 font-mono break-all">
                        {selectedFinding.resource}
                      </code>

                      {selectedFinding.resourceArn && (
                        <>
                          <div className="border-t border-white/10 my-3" />
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs text-white/40 uppercase">ARN</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs text-white/40 hover:text-white"
                              onClick={() => copyToClipboard(selectedFinding.resourceArn!, `${selectedFinding.id}-arn`)}
                            >
                              {copiedId === `${selectedFinding.id}-arn` ? (
                                <><Check className="w-3 h-3 mr-1 text-green-400" /> Copied</>
                              ) : (
                                <><Copy className="w-3 h-3 mr-1" /> Copy</>
                              )}
                            </Button>
                          </div>
                          <code className="block text-xs text-white/60 font-mono break-all">
                            {selectedFinding.resourceArn}
                          </code>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Description Section */}
                  {selectedFinding.description && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                        <Info className="w-4 h-4 text-white/40" />
                        Vulnerability Details
                      </h4>
                      <div className="bg-white/5 rounded-xl p-4">
                        <p className="text-sm text-white/70 leading-relaxed">{selectedFinding.description}</p>
                      </div>
                    </div>
                  )}

                  {/* Remediation Steps Section */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                      <Wrench className="w-4 h-4 text-primary" />
                      Remediation Steps
                    </h4>
                    <div className="bg-primary/5 rounded-xl p-4 border border-primary/20">
                      <ol className="space-y-3">
                        {remediationSteps.map((step, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <span className={cn(
                              "flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                              "bg-primary/20 text-primary"
                            )}>
                              {index + 1}
                            </span>
                            <span className="text-sm text-white/80 pt-0.5 leading-relaxed">{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>

                  {/* Quick Recommendation */}
                  {selectedFinding.recommendation && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                        <Lightbulb className="w-4 h-4 text-yellow-400" />
                        Quick Recommendation
                      </h4>
                      <div className="bg-yellow-500/5 rounded-xl p-4 border border-yellow-500/20">
                        <p className="text-sm text-white/80 leading-relaxed">{selectedFinding.recommendation}</p>
                      </div>
                    </div>
                  )}

                  {/* AWS Console Quick Link */}
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <ExternalLink className="w-5 h-5 text-white/40" />
                        <div>
                          <p className="text-sm font-medium text-white">Open in AWS Console</p>
                          <p className="text-xs text-white/40">Navigate directly to the affected resource</p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-white/5 border-white/10 text-white/70 hover:text-white"
                        onClick={() => {
                          const region = selectedFinding.region || "us-east-1";
                          const prefix = selectedFinding.findingId.split("-")[0];
                          const consoleUrls: Record<string, string> = {
                            "IAM": "https://console.aws.amazon.com/iam/home",
                            "S3": `https://s3.console.aws.amazon.com/s3/buckets/${selectedFinding.resource}?region=${region}`,
                            "EC2": `https://${region}.console.aws.amazon.com/ec2/home?region=${region}`,
                            "NET": `https://${region}.console.aws.amazon.com/vpc/home?region=${region}`,
                            "LOG": `https://${region}.console.aws.amazon.com/cloudwatch/home?region=${region}`,
                            "RDS": `https://${region}.console.aws.amazon.com/rds/home?region=${region}`,
                          };
                          const url = consoleUrls[prefix] || `https://console.aws.amazon.com/`;
                          window.open(url, "_blank");
                        }}
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
                    {selectedFinding.status !== "open" && (
                      <Button
                        variant="outline"
                        className="flex-1 bg-white/5 border-white/10 text-white/70"
                        onClick={() => updateFindingStatus(selectedFinding.id, "open")}
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Reopen
                      </Button>
                    )}
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

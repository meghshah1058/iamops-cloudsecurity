"use client";

import { useEffect, useState, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { GlassCard } from "@/components/dashboard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  Search,
  Filter,
  AlertTriangle,
  ShieldAlert,
  AlertCircle,
  CheckCircle,
  ExternalLink,
  Copy,
  Check,
  RefreshCw,
  Shield,
  Key,
  Network,
  Database,
  Server,
  Eye,
  Cloud,
  FileText,
  Lock,
  Zap,
  ChevronRight,
  ArrowUpRight,
  Clock,
  Target,
  Lightbulb,
} from "lucide-react";

// Azure icon component
function AzureIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M13.05 4.24L6.56 18.05a.5.5 0 00.46.7h8.12l-1.54-3.04a.5.5 0 01.44-.74h4.59L13.05 4.24zm5.31 9.36h-3.22l1.04 2.05a.5.5 0 01-.45.74H7.64L12.69 6.2l5.67 7.4z"/>
    </svg>
  );
}

interface Finding {
  id: string;
  findingId: string;
  severity: string;
  title: string;
  description?: string;
  resource: string;
  resourceId?: string;
  region?: string;
  recommendation?: string;
  status: string;
  createdAt: string;
}

const severityConfig = {
  CRITICAL: {
    color: "bg-red-500/20 text-red-400 border-red-500/30",
    icon: AlertTriangle,
    bgColor: "bg-red-500/5",
    borderColor: "border-red-500/20",
    dotColor: "bg-red-400",
  },
  HIGH: {
    color: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    icon: ShieldAlert,
    bgColor: "bg-orange-500/5",
    borderColor: "border-orange-500/20",
    dotColor: "bg-orange-400",
  },
  MEDIUM: {
    color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    icon: AlertCircle,
    bgColor: "bg-yellow-500/5",
    borderColor: "border-yellow-500/20",
    dotColor: "bg-yellow-400",
  },
  LOW: {
    color: "bg-green-500/20 text-green-400 border-green-500/30",
    icon: CheckCircle,
    bgColor: "bg-green-500/5",
    borderColor: "border-green-500/20",
    dotColor: "bg-green-400",
  },
};

const getCategoryIcon = (findingId: string) => {
  const category = findingId.split("-")[0]?.toUpperCase();
  const iconMap: Record<string, typeof Shield> = {
    IAM: Key,
    RBAC: Key,
    AAD: Key,
    STORAGE: Database,
    BLOB: Database,
    SQL: Database,
    COSMOS: Database,
    NETWORK: Network,
    NSG: Network,
    VNET: Network,
    FIREWALL: Shield,
    COMPUTE: Server,
    VM: Server,
    AKS: Server,
    MONITOR: Eye,
    LOG: Eye,
    KEYVAULT: Lock,
    ENCRYPT: Lock,
    APP: Zap,
    FUNC: Zap,
    API: Cloud,
  };
  return iconMap[category] || Shield;
};

const getCategoryName = (findingId: string) => {
  const category = findingId.split("-")[0]?.toUpperCase();
  const nameMap: Record<string, string> = {
    IAM: "Identity & Access",
    RBAC: "Role-Based Access",
    AAD: "Azure AD",
    STORAGE: "Storage",
    BLOB: "Blob Storage",
    SQL: "SQL Database",
    COSMOS: "Cosmos DB",
    NETWORK: "Networking",
    NSG: "Network Security",
    VNET: "Virtual Network",
    FIREWALL: "Firewall",
    COMPUTE: "Compute",
    VM: "Virtual Machines",
    AKS: "Kubernetes",
    MONITOR: "Monitoring",
    LOG: "Logging",
    KEYVAULT: "Key Vault",
    ENCRYPT: "Encryption",
    APP: "App Services",
    FUNC: "Functions",
    API: "API Management",
  };
  return nameMap[category] || "Security";
};

const getImpactInfo = (severity: string) => {
  const impactMap: Record<string, { level: string; description: string; color: string }> = {
    CRITICAL: {
      level: "Severe",
      description: "Immediate action required. This vulnerability could lead to complete system compromise or data breach.",
      color: "text-red-400",
    },
    HIGH: {
      level: "High",
      description: "Significant risk to security posture. Should be addressed within 24-48 hours.",
      color: "text-orange-400",
    },
    MEDIUM: {
      level: "Moderate",
      description: "Notable security concern. Plan remediation within 1-2 weeks.",
      color: "text-yellow-400",
    },
    LOW: {
      level: "Low",
      description: "Minor security improvement opportunity. Address during regular maintenance.",
      color: "text-green-400",
    },
  };
  return impactMap[severity] || impactMap.LOW;
};

const parseRecommendationSteps = (recommendation: string | undefined): string[] => {
  if (!recommendation) return ["Review and update the resource configuration", "Verify changes in Azure Portal"];

  // Check if it already has numbered steps
  const numberedSteps = recommendation.match(/\d+\.\s+[^\d]+/g);
  if (numberedSteps && numberedSteps.length > 1) {
    return numberedSteps.map(step => step.replace(/^\d+\.\s+/, "").trim());
  }

  // Split by common delimiters
  const steps = recommendation.split(/[;.]/).filter(s => s.trim().length > 10);
  if (steps.length > 1) {
    return steps.map(s => s.trim());
  }

  return [recommendation];
};

export default function AzureFindingsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [findings, setFindings] = useState<Finding[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [severityFilter, setSeverityFilter] = useState<string>(
    searchParams.get("severity") || "all"
  );
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedFinding, setSelectedFinding] = useState<Finding | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchFindings = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/azure/findings");
      if (!response.ok) {
        throw new Error("Failed to fetch findings");
      }
      const data = await response.json();
      setFindings(data.findings);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFindings();
  }, []);

  useEffect(() => {
    const severity = searchParams.get("severity");
    if (severity) {
      setSeverityFilter(severity);
    }
  }, [searchParams]);

  const filteredFindings = useMemo(() => {
    return findings.filter((finding) => {
      const matchesSearch =
        finding.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        finding.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
        finding.findingId.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesSeverity =
        severityFilter === "all" || finding.severity === severityFilter;

      const matchesStatus =
        statusFilter === "all" || finding.status === statusFilter;

      return matchesSearch && matchesSeverity && matchesStatus;
    });
  }, [findings, searchTerm, severityFilter, statusFilter]);

  const severityCounts = useMemo(() => {
    return {
      all: findings.length,
      CRITICAL: findings.filter((f) => f.severity === "CRITICAL").length,
      HIGH: findings.filter((f) => f.severity === "HIGH").length,
      MEDIUM: findings.filter((f) => f.severity === "MEDIUM").length,
      LOW: findings.filter((f) => f.severity === "LOW").length,
    };
  }, [findings]);

  const handleCopyId = async (id: string) => {
    await navigator.clipboard.writeText(id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStatusUpdate = async (findingId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/azure/findings/${findingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setFindings((prev) =>
          prev.map((f) =>
            f.id === findingId ? { ...f, status: newStatus } : f
          )
        );
        if (selectedFinding?.id === findingId) {
          setSelectedFinding({ ...selectedFinding, status: newStatus });
        }
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <Skeleton className="h-8 w-48 bg-white/10" />
          <Skeleton className="h-10 w-64 bg-white/10" />
        </div>
        <div className="grid gap-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-24 bg-white/10 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <AlertTriangle className="w-12 h-12 text-red-400 mb-4" />
        <h2 className="text-xl font-semibold text-white mb-2">
          Failed to load findings
        </h2>
        <p className="text-white/50 mb-4">{error}</p>
        <Button onClick={fetchFindings} className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-cyan-500/10">
            <AzureIcon className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Azure Security Findings</h1>
            <p className="text-white/50">
              {filteredFindings.length} findings across your Azure subscription
            </p>
          </div>
        </div>
        <Button onClick={fetchFindings} variant="outline" className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      {/* Severity Filter Pills */}
      <div className="flex flex-wrap gap-2">
        {(["all", "CRITICAL", "HIGH", "MEDIUM", "LOW"] as const).map((severity) => {
          const count = severityCounts[severity];
          const isActive = severityFilter === severity;
          const config = severity !== "all" ? severityConfig[severity] : null;

          return (
            <button
              key={severity}
              onClick={() => setSeverityFilter(severity)}
              className={`
                px-4 py-2 rounded-full text-sm font-medium transition-all
                ${isActive
                  ? config
                    ? `${config.color} border`
                    : "bg-white/20 text-white border border-white/30"
                  : "bg-white/5 text-white/60 border border-white/10 hover:bg-white/10 hover:text-white"
                }
              `}
            >
              {severity === "all" ? "All" : severity}
              <span className="ml-2 text-xs opacity-70">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Search and Filters */}
      <GlassCard className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <Input
              placeholder="Search by title, resource, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/5 border-white/10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px] bg-white/5 border-white/10">
              <Filter className="w-4 h-4 mr-2" />
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
            <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">
              No findings match your criteria
            </h3>
            <p className="text-white/50">
              Try adjusting your filters or search term
            </p>
          </GlassCard>
        ) : (
          filteredFindings.map((finding) => {
            const config = severityConfig[finding.severity as keyof typeof severityConfig] || severityConfig.LOW;
            const SeverityIcon = config.icon;
            const CategoryIcon = getCategoryIcon(finding.findingId);
            const categoryName = getCategoryName(finding.findingId);
            const impactInfo = getImpactInfo(finding.severity);

            return (
              <GlassCard
                key={finding.id}
                className={`p-4 cursor-pointer transition-all hover:scale-[1.01] ${config.bgColor} ${config.borderColor} border`}
                onClick={() => setSelectedFinding(finding)}
              >
                <div className="flex items-start gap-4">
                  {/* Category Icon */}
                  <div className={`p-3 rounded-xl ${config.bgColor} border ${config.borderColor}`}>
                    <CategoryIcon className={`w-5 h-5 ${impactInfo.color}`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        {/* Category & ID */}
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-white/40 font-medium uppercase tracking-wide">
                            {categoryName}
                          </span>
                          <span className="text-white/20">•</span>
                          <code className="text-xs text-cyan-400 font-mono">
                            {finding.findingId}
                          </code>
                        </div>

                        {/* Title */}
                        <h3 className="text-white font-semibold mb-2 group-hover:text-cyan-400 transition-colors">
                          {finding.title}
                        </h3>

                        {/* Resource Info */}
                        <div className="flex flex-wrap items-center gap-3 text-sm text-white/50">
                          <div className="flex items-center gap-1.5">
                            <Cloud className="w-3.5 h-3.5" />
                            <span className="truncate max-w-[200px]">{finding.resource}</span>
                          </div>
                          {finding.region && (
                            <div className="flex items-center gap-1.5">
                              <Target className="w-3.5 h-3.5" />
                              <span>{finding.region}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right Side - Badges */}
                      <div className="flex flex-col items-end gap-2">
                        <Badge className={`${config.color} border flex items-center gap-1.5`}>
                          <SeverityIcon className="w-3.5 h-3.5" />
                          {finding.severity}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={`
                            ${finding.status === "open"
                              ? "border-white/20 text-white/60"
                              : finding.status === "resolved"
                              ? "border-green-500/30 text-green-400"
                              : "border-yellow-500/30 text-yellow-400"
                            }
                          `}
                        >
                          {finding.status}
                        </Badge>
                      </div>
                    </div>

                    {/* Impact & Preview */}
                    <div className="mt-3 flex items-center gap-4">
                      <div className="flex items-center gap-1.5 text-xs">
                        <Zap className={`w-3.5 h-3.5 ${impactInfo.color}`} />
                        <span className={impactInfo.color}>{impactInfo.level} Impact</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-white/40">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Click to view details</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-white/30 ml-auto" />
                    </div>
                  </div>
                </div>
              </GlassCard>
            );
          })
        )}
      </div>

      {/* Finding Detail Modal */}
      <Dialog open={!!selectedFinding} onOpenChange={() => setSelectedFinding(null)}>
        <DialogContent className="max-w-2xl bg-[#0c0118] border-white/10 max-h-[90vh] overflow-y-auto">
          {selectedFinding && (() => {
            const config = severityConfig[selectedFinding.severity as keyof typeof severityConfig] || severityConfig.LOW;
            const SeverityIcon = config.icon;
            const CategoryIcon = getCategoryIcon(selectedFinding.findingId);
            const categoryName = getCategoryName(selectedFinding.findingId);
            const impactInfo = getImpactInfo(selectedFinding.severity);
            const steps = parseRecommendationSteps(selectedFinding.recommendation);

            return (
              <>
                <DialogHeader>
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl ${config.bgColor} border ${config.borderColor}`}>
                      <CategoryIcon className={`w-6 h-6 ${impactInfo.color}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs text-white/40 font-medium uppercase tracking-wide">
                          {categoryName}
                        </span>
                        <span className="text-white/20">•</span>
                        <code className="text-xs text-cyan-400 font-mono">
                          {selectedFinding.findingId}
                        </code>
                        <button
                          onClick={() => handleCopyId(selectedFinding.findingId)}
                          className="p-1 hover:bg-white/10 rounded transition-colors"
                        >
                          {copied ? (
                            <Check className="w-3 h-3 text-green-400" />
                          ) : (
                            <Copy className="w-3 h-3 text-white/40" />
                          )}
                        </button>
                      </div>
                      <DialogTitle className="text-xl text-white">
                        {selectedFinding.title}
                      </DialogTitle>
                    </div>
                  </div>
                </DialogHeader>

                <div className="space-y-6 mt-4">
                  {/* Severity & Status Badges */}
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge className={`${config.color} border flex items-center gap-1.5 px-3 py-1`}>
                      <SeverityIcon className="w-4 h-4" />
                      {selectedFinding.severity}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={`
                        px-3 py-1
                        ${selectedFinding.status === "open"
                          ? "border-white/20 text-white/60"
                          : selectedFinding.status === "resolved"
                          ? "border-green-500/30 text-green-400"
                          : "border-yellow-500/30 text-yellow-400"
                        }
                      `}
                    >
                      {selectedFinding.status}
                    </Badge>
                  </div>

                  {/* Impact Assessment */}
                  <div className={`p-4 rounded-xl ${config.bgColor} border ${config.borderColor}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className={`w-4 h-4 ${impactInfo.color}`} />
                      <span className={`font-semibold ${impactInfo.color}`}>
                        {impactInfo.level} Impact
                      </span>
                    </div>
                    <p className="text-sm text-white/70">{impactInfo.description}</p>
                  </div>

                  {/* Description */}
                  {selectedFinding.description && (
                    <div>
                      <h4 className="text-sm font-medium text-white/40 uppercase tracking-wide mb-2 flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Description
                      </h4>
                      <p className="text-white/70">{selectedFinding.description}</p>
                    </div>
                  )}

                  {/* Resource Details */}
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <h4 className="text-sm font-medium text-white/40 uppercase tracking-wide mb-3 flex items-center gap-2">
                      <Cloud className="w-4 h-4" />
                      Affected Resource
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-white/50">Resource</span>
                        <span className="text-white font-mono text-sm">{selectedFinding.resource}</span>
                      </div>
                      {selectedFinding.resourceId && (
                        <div className="flex items-center justify-between">
                          <span className="text-white/50">Resource ID</span>
                          <span className="text-cyan-400 font-mono text-sm truncate max-w-[300px]">
                            {selectedFinding.resourceId}
                          </span>
                        </div>
                      )}
                      {selectedFinding.region && (
                        <div className="flex items-center justify-between">
                          <span className="text-white/50">Region</span>
                          <span className="text-white">{selectedFinding.region}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Remediation Steps */}
                  <div>
                    <h4 className="text-sm font-medium text-white/40 uppercase tracking-wide mb-3 flex items-center gap-2">
                      <Lightbulb className="w-4 h-4" />
                      Remediation Steps
                    </h4>
                    <div className="space-y-3">
                      {steps.map((step, index) => (
                        <div key={index} className="flex gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
                          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-sm font-semibold">
                            {index + 1}
                          </div>
                          <p className="text-white/70 text-sm flex-1">{step}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3 pt-4 border-t border-white/10">
                    <Button
                      variant="outline"
                      className="gap-2 flex-1 sm:flex-none"
                      onClick={() =>
                        window.open(
                          `https://portal.azure.com/#blade/Microsoft_Azure_Security/SecurityMenuBlade/overview`,
                          "_blank"
                        )
                      }
                    >
                      <ExternalLink className="w-4 h-4" />
                      Open Azure Portal
                      <ArrowUpRight className="w-3 h-3" />
                    </Button>
                    {selectedFinding.status === "open" && (
                      <>
                        <Button
                          className="gap-2 flex-1 sm:flex-none bg-green-600 hover:bg-green-700"
                          onClick={() => handleStatusUpdate(selectedFinding.id, "resolved")}
                        >
                          <CheckCircle className="w-4 h-4" />
                          Mark Resolved
                        </Button>
                        <Button
                          variant="outline"
                          className="gap-2 flex-1 sm:flex-none border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
                          onClick={() => handleStatusUpdate(selectedFinding.id, "ignored")}
                        >
                          Ignore
                        </Button>
                      </>
                    )}
                    {selectedFinding.status !== "open" && (
                      <Button
                        variant="outline"
                        className="gap-2 flex-1 sm:flex-none"
                        onClick={() => handleStatusUpdate(selectedFinding.id, "open")}
                      >
                        Reopen Finding
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

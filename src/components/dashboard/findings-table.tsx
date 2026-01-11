"use client";

import { useState } from "react";
import { GlassCard } from "./glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertTriangle,
  Search,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Copy,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

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

interface FindingsTableProps {
  findings?: Finding[];
}

const severityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };

const severityConfig = {
  CRITICAL: { color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20" },
  HIGH: { color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20" },
  MEDIUM: { color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20" },
  LOW: { color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/20" },
};

export function FindingsTable({ findings = [] }: FindingsTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [expandedFinding, setExpandedFinding] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredFindings = findings
    .filter((finding) => {
      const matchesSearch =
        finding.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        finding.findingId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        finding.resource.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSeverity =
        severityFilter === "all" || finding.severity === severityFilter;
      return matchesSearch && matchesSeverity;
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

  return (
    <GlassCard className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white">Security Findings</h3>
          <p className="text-sm text-white/40 mt-1">
            {filteredFindings.length} findings found
          </p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <Input
              placeholder="Search findings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-[200px] bg-white/5 border-white/10 text-white"
            />
          </div>
          <Select value={severityFilter} onValueChange={setSeverityFilter}>
            <SelectTrigger className="w-[140px] bg-white/5 border-white/10 text-white">
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
        </div>
      </div>

      {/* Findings List */}
      <div className="space-y-3">
        {filteredFindings.length === 0 ? (
          <div className="text-center py-8">
            <AlertTriangle className="w-10 h-10 text-white/20 mx-auto mb-3" />
            <p className="text-white/40">No findings match your filters</p>
          </div>
        ) : (
          filteredFindings.map((finding) => {
            const config = severityConfig[finding.severity as keyof typeof severityConfig] || severityConfig.MEDIUM;
            const isExpanded = expandedFinding === finding.id;

            return (
              <div
                key={finding.id}
                className={cn(
                  "rounded-lg border transition-all",
                  config.border,
                  config.bg,
                  "hover:border-opacity-50"
                )}
              >
                {/* Header Row */}
                <button
                  onClick={() => setExpandedFinding(isExpanded ? null : finding.id)}
                  className="w-full flex items-center gap-4 p-4 text-left"
                >
                  <div className="flex-shrink-0">
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-white/40" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-white/40" />
                    )}
                  </div>

                  {/* Severity Badge */}
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded text-xs font-bold uppercase",
                      config.bg,
                      config.color
                    )}
                  >
                    {finding.severity}
                  </span>

                  {/* Finding ID */}
                  <span className="text-xs text-white/50 font-mono w-20">
                    {finding.findingId}
                  </span>

                  {/* Title */}
                  <span className="flex-1 text-sm text-white font-medium truncate">
                    {finding.title}
                  </span>

                  {/* Resource */}
                  <span className="text-xs text-white/40 font-mono truncate max-w-[200px] hidden lg:block">
                    {finding.resource}
                  </span>
                </button>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-0 border-t border-white/10 animate-fade-in">
                    <div className="mt-4 space-y-4">
                      {/* Resource Info */}
                      <div>
                        <label className="text-xs text-white/40 uppercase tracking-wide">Resource</label>
                        <div className="flex items-center gap-2 mt-1">
                          <code className="text-sm text-white/80 bg-white/5 px-2 py-1 rounded font-mono break-all">
                            {finding.resource}
                          </code>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => copyToClipboard(finding.resource, finding.id)}
                          >
                            {copiedId === finding.id ? (
                              <Check className="w-3 h-3 text-green-400" />
                            ) : (
                              <Copy className="w-3 h-3 text-white/40" />
                            )}
                          </Button>
                        </div>
                      </div>

                      {/* Region */}
                      {finding.region && (
                        <div>
                          <label className="text-xs text-white/40 uppercase tracking-wide">Region</label>
                          <p className="text-sm text-white/70 mt-1">{finding.region}</p>
                        </div>
                      )}

                      {/* Description */}
                      {finding.description && (
                        <div>
                          <label className="text-xs text-white/40 uppercase tracking-wide">Description</label>
                          <p className="text-sm text-white/70 mt-1">{finding.description}</p>
                        </div>
                      )}

                      {/* Recommendation */}
                      {finding.recommendation && (
                        <div>
                          <label className="text-xs text-white/40 uppercase tracking-wide">Recommendation</label>
                          <p className="text-sm text-white/70 mt-1 p-3 bg-primary/10 rounded-lg border border-primary/20">
                            {finding.recommendation}
                          </p>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2 pt-2">
                        <Button variant="outline" size="sm" className="bg-white/5 border-white/10 text-white/70">
                          Mark as Resolved
                        </Button>
                        <Button variant="outline" size="sm" className="bg-white/5 border-white/10 text-white/70">
                          Ignore
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </GlassCard>
  );
}

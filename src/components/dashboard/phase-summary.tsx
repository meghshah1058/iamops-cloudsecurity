"use client";

import { useState } from "react";
import { GlassCard } from "./glass-card";
import { cn } from "@/lib/utils";
import {
  ChevronDown,
  ChevronRight,
  CheckCircle,
  AlertTriangle,
  Clock,
  Shield,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface PhaseFromAPI {
  id: string;
  phaseNumber: number;
  name: string;
  status: string;
  findings: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
}

interface PhaseSummaryProps {
  phases?: PhaseFromAPI[];
}

interface PhaseData {
  id: number;
  name: string;
  status: "completed" | "in_progress" | "pending";
  critical: number;
  high: number;
  medium: number;
  low: number;
  checksRun: number;
  totalChecks: number;
}

// Sample data fallback
const samplePhases: PhaseData[] = [
  { id: 1, name: "Identity & Access Management (IAM)", status: "completed", critical: 2, high: 5, medium: 8, low: 3, checksRun: 15, totalChecks: 15 },
  { id: 2, name: "S3 Security", status: "completed", critical: 3, high: 4, medium: 5, low: 2, checksRun: 12, totalChecks: 12 },
  { id: 3, name: "Network Security", status: "completed", critical: 1, high: 6, medium: 7, low: 4, checksRun: 15, totalChecks: 15 },
  { id: 4, name: "Logging & Monitoring", status: "completed", critical: 0, high: 3, medium: 6, low: 5, checksRun: 12, totalChecks: 12 },
  { id: 5, name: "Compute & Container Security", status: "completed", critical: 2, high: 4, medium: 5, low: 6, checksRun: 15, totalChecks: 15 },
  { id: 6, name: "Data Services", status: "completed", critical: 1, high: 3, medium: 4, low: 3, checksRun: 12, totalChecks: 12 },
];

const statusConfig = {
  completed: {
    icon: CheckCircle,
    color: "text-green-400",
    bg: "bg-green-500/10",
    label: "Completed",
  },
  in_progress: {
    icon: Clock,
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
    label: "In Progress",
  },
  pending: {
    icon: Clock,
    color: "text-white/30",
    bg: "bg-white/5",
    label: "Pending",
  },
};

export function PhaseSummary({ phases: apiPhases }: PhaseSummaryProps) {
  const [expandedPhases, setExpandedPhases] = useState<number[]>([]);
  const [showAll, setShowAll] = useState(false);

  // Transform API phases to component format
  const phases: PhaseData[] = apiPhases && apiPhases.length > 0
    ? apiPhases.map((p) => ({
        id: p.phaseNumber,
        name: p.name,
        status: (p.status === "completed" ? "completed" : p.status === "running" ? "in_progress" : "pending") as "completed" | "in_progress" | "pending",
        critical: p.critical,
        high: p.high,
        medium: p.medium,
        low: p.low,
        checksRun: p.findings,
        totalChecks: p.findings || 10,
      }))
    : samplePhases;

  const togglePhase = (id: number) => {
    setExpandedPhases((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const displayedPhases = showAll ? phases : phases.slice(0, 8);
  const completedPhases = phases.filter((p) => p.status === "completed").length;

  return (
    <GlassCard className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white">Audit Phases</h3>
          <p className="text-sm text-white/40 mt-1">
            {completedPhases} of {phases.length} phases completed
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-primary">{completedPhases}</span>
          <span className="text-white/40">/</span>
          <span className="text-lg text-white/40">{phases.length}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <Progress
          value={(completedPhases / phases.length) * 100}
          className="h-2 bg-white/10"
        />
      </div>

      {/* Phases List */}
      <div className="space-y-2">
        {displayedPhases.map((phase) => {
          const config = statusConfig[phase.status];
          const StatusIcon = config.icon;
          const isExpanded = expandedPhases.includes(phase.id);
          const totalFindings = phase.critical + phase.high + phase.medium + phase.low;
          const progress = (phase.checksRun / phase.totalChecks) * 100;

          return (
            <div
              key={phase.id}
              className={cn(
                "rounded-lg border transition-all",
                phase.status === "pending"
                  ? "border-white/5 bg-white/[0.02]"
                  : "border-white/10 bg-white/5 hover:border-white/20"
              )}
            >
              {/* Header */}
              <button
                onClick={() => togglePhase(phase.id)}
                disabled={phase.status === "pending"}
                className={cn(
                  "w-full flex items-center gap-4 p-4",
                  phase.status === "pending" && "cursor-not-allowed opacity-50"
                )}
              >
                {/* Expand Icon */}
                <div className="flex-shrink-0">
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-white/40" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-white/40" />
                  )}
                </div>

                {/* Phase Info */}
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-white/40 font-mono">
                      #{phase.id.toString().padStart(2, "0")}
                    </span>
                    <span className="text-sm font-medium text-white">
                      {phase.name}
                    </span>
                  </div>
                  {phase.status !== "pending" && (
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-xs text-white/40">
                        {phase.checksRun}/{phase.totalChecks} checks
                      </span>
                      {totalFindings > 0 && (
                        <span className="text-xs text-white/40">
                          {totalFindings} findings
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Severity Badges */}
                {phase.status !== "pending" && totalFindings > 0 && (
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
                )}

                {/* Status Badge */}
                <div
                  className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
                    config.bg,
                    config.color
                  )}
                >
                  <StatusIcon className="w-3 h-3" />
                  {config.label}
                </div>
              </button>

              {/* Expanded Content */}
              {isExpanded && phase.status !== "pending" && (
                <div className="px-4 pb-4 pt-0 border-t border-white/5 animate-fade-in">
                  <div className="mt-4">
                    {/* Progress */}
                    <div className="flex items-center justify-between text-xs text-white/40 mb-2">
                      <span>Progress</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-1.5 bg-white/10" />

                    {/* Findings Breakdown */}
                    {totalFindings > 0 && (
                      <div className="mt-4 grid grid-cols-4 gap-2">
                        <div className="p-2 rounded bg-red-500/10 text-center">
                          <p className="text-lg font-bold text-red-400">{phase.critical}</p>
                          <p className="text-xs text-red-400/60">Critical</p>
                        </div>
                        <div className="p-2 rounded bg-orange-500/10 text-center">
                          <p className="text-lg font-bold text-orange-400">{phase.high}</p>
                          <p className="text-xs text-orange-400/60">High</p>
                        </div>
                        <div className="p-2 rounded bg-yellow-500/10 text-center">
                          <p className="text-lg font-bold text-yellow-400">{phase.medium}</p>
                          <p className="text-xs text-yellow-400/60">Medium</p>
                        </div>
                        <div className="p-2 rounded bg-green-500/10 text-center">
                          <p className="text-lg font-bold text-green-400">{phase.low}</p>
                          <p className="text-xs text-green-400/60">Low</p>
                        </div>
                      </div>
                    )}

                    {/* View Details Button */}
                    <Link href="/dashboard/findings" className="block">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full mt-4 text-primary hover:text-primary/80 hover:bg-primary/10 gap-2"
                      >
                        View Phase Findings
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Show More/Less */}
      {phases.length > 8 && (
        <Button
          variant="ghost"
          className="w-full mt-4 text-white/40 hover:text-white"
          onClick={() => setShowAll(!showAll)}
        >
          {showAll ? "Show Less" : `Show All ${phases.length} Phases`}
          <ChevronDown
            className={cn(
              "w-4 h-4 ml-2 transition-transform",
              showAll && "rotate-180"
            )}
          />
        </Button>
      )}
    </GlassCard>
  );
}

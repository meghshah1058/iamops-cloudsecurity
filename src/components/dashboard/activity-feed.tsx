"use client";

import { GlassCard } from "./glass-card";
import {
  CheckCircle,
  AlertTriangle,
  Shield,
  Cloud,
  XCircle,
  Clock,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface Finding {
  id: string;
  findingId: string;
  severity: string;
  title: string;
  resource: string;
}

interface ActivityFeedProps {
  findings?: Finding[];
}

interface Activity {
  id: string;
  type: "audit_complete" | "finding_new" | "finding_resolved" | "account_added" | "audit_failed";
  title: string;
  description: string;
  timestamp: string;
  severity?: "critical" | "high" | "medium" | "low";
}

const activityConfig = {
  audit_complete: {
    icon: CheckCircle,
    iconBg: "bg-green-500/10",
    iconColor: "text-green-400",
    dotColor: "bg-green-400",
  },
  finding_new: {
    icon: AlertTriangle,
    iconBg: "bg-red-500/10",
    iconColor: "text-red-400",
    dotColor: "bg-red-400",
  },
  finding_resolved: {
    icon: Shield,
    iconBg: "bg-blue-500/10",
    iconColor: "text-blue-400",
    dotColor: "bg-blue-400",
  },
  account_added: {
    icon: Cloud,
    iconBg: "bg-purple-500/10",
    iconColor: "text-purple-400",
    dotColor: "bg-purple-400",
  },
  audit_failed: {
    icon: XCircle,
    iconBg: "bg-red-500/10",
    iconColor: "text-red-400",
    dotColor: "bg-red-400",
  },
};

export function ActivityFeed({ findings }: ActivityFeedProps) {
  // Transform findings to activities
  const activities: Activity[] = findings && findings.length > 0
    ? findings.slice(0, 6).map((finding) => ({
        id: finding.id,
        type: "finding_new" as const,
        title: `New ${finding.severity} Finding`,
        description: finding.title,
        timestamp: "Recent",
        severity: finding.severity.toLowerCase() as "critical" | "high" | "medium" | "low",
      }))
    : [
        { id: "1", type: "audit_complete" as const, title: "Audit Completed", description: "Security scan completed successfully", timestamp: "2 min ago" },
        { id: "2", type: "finding_new" as const, title: "New Finding", description: "No recent findings", timestamp: "15 min ago", severity: "medium" as const },
      ];

  return (
    <GlassCard className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
          <p className="text-sm text-white/40 mt-1">Latest security events</p>
        </div>
        <Link href="/dashboard/findings">
          <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 gap-1">
            View All
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>

      <div className="space-y-4">
        {activities.map((activity, index) => {
          const config = activityConfig[activity.type];
          const Icon = config.icon;
          const severityParam = activity.severity ? `?severity=${activity.severity.toUpperCase()}` : "";

          return (
            <Link
              key={activity.id}
              href={`/dashboard/findings${severityParam}`}
              className="block"
            >
              <div
                className={cn(
                  "flex gap-4 p-3 rounded-lg transition-all hover:bg-white/5 hover:scale-[1.01] cursor-pointer group",
                  index === 0 && "animate-fade-in"
                )}
              >
                {/* Icon */}
                <div className={cn("p-2 rounded-lg flex-shrink-0", config.iconBg)}>
                  <Icon className={cn("w-4 h-4", config.iconColor)} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={cn("w-2 h-2 rounded-full", config.dotColor)} />
                    <h4 className="text-sm font-medium text-white truncate group-hover:text-primary transition-colors">
                      {activity.title}
                    </h4>
                    {activity.severity && (
                      <span
                        className={cn(
                          "text-xs px-2 py-0.5 rounded-full font-medium",
                          activity.severity === "critical" &&
                            "bg-red-500/10 text-red-400",
                          activity.severity === "high" &&
                            "bg-orange-500/10 text-orange-400",
                          activity.severity === "medium" &&
                            "bg-yellow-500/10 text-yellow-400",
                          activity.severity === "low" &&
                            "bg-green-500/10 text-green-400"
                        )}
                      >
                        {activity.severity}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-white/50 mt-0.5 truncate">
                    {activity.description}
                  </p>
                  <div className="flex items-center gap-1 mt-1 text-xs text-white/30">
                    <Clock className="w-3 h-3" />
                    {activity.timestamp}
                  </div>
                </div>

                {/* Arrow on hover */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
                  <ArrowRight className="w-4 h-4 text-primary" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </GlassCard>
  );
}

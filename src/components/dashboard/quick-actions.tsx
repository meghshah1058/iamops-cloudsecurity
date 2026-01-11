"use client";

import Link from "next/link";
import { GlassCard } from "./glass-card";
import { Button } from "@/components/ui/button";
import {
  Play,
  Cloud,
  FileText,
  Settings,
  Download,
  Shield,
} from "lucide-react";

const actions = [
  {
    icon: Play,
    label: "Run Full Audit",
    description: "Start a comprehensive security scan",
    href: "/dashboard/audits",
    primary: true,
  },
  {
    icon: Shield,
    label: "View Findings",
    description: "See all security vulnerabilities",
    href: "/dashboard/findings",
  },
  {
    icon: Cloud,
    label: "Manage Accounts",
    description: "Add or configure AWS accounts",
    href: "/dashboard/accounts",
  },
  {
    icon: FileText,
    label: "View Reports",
    description: "Access generated reports",
    href: "/dashboard/reports",
  },
];

export function QuickActions() {
  return (
    <GlassCard className="p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white">Quick Actions</h3>
        <p className="text-sm text-white/40 mt-1">Common tasks</p>
      </div>

      <div className="space-y-2">
        {actions.map((action, index) => (
          <Link key={index} href={action.href}>
            <Button
              variant={action.primary ? "default" : "outline"}
              className={
                action.primary
                  ? "w-full justify-start gap-3 h-auto py-3 btn-gradient"
                  : "w-full justify-start gap-3 h-auto py-3 bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
              }
            >
              <div
                className={
                  action.primary
                    ? "p-2 rounded-lg bg-white/20"
                    : "p-2 rounded-lg bg-primary/10"
                }
              >
                <action.icon
                  className={
                    action.primary
                      ? "w-4 h-4 text-white"
                      : "w-4 h-4 text-primary"
                  }
                />
              </div>
              <div className="text-left">
                <p className="font-medium">{action.label}</p>
                <p
                  className={
                    action.primary
                      ? "text-xs text-white/70"
                      : "text-xs text-white/40"
                  }
                >
                  {action.description}
                </p>
              </div>
            </Button>
          </Link>
        ))}
      </div>
    </GlassCard>
  );
}

"use client";

import { useState, useEffect } from "react";
import { GlassCard } from "@/components/dashboard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Search,
  MoreVertical,
  Play,
  Trash2,
  Edit,
  CheckCircle,
  AlertTriangle,
  Clock,
  ExternalLink,
  Key,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { format } from "date-fns";

// Azure Icon
function AzureIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M5.483 21.3H24L14.025 4.013l-3.038 8.347 5.836 6.938L5.483 21.3zM13.23 2.7L6.105 8.677 0 19.253h5.505l7.725-16.553z"/>
    </svg>
  );
}

interface AzureSubscription {
  id: string;
  name: string;
  subscriptionId: string;
  tenantId: string | null;
  region: string;
  isActive: boolean;
  lastScanAt: string | null;
  healthScore: number | null;
  audits: Array<{
    id: string;
    status: string;
    riskScore: number | null;
    totalFindings: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
    completedAt: string | null;
  }>;
  _count: {
    audits: number;
  };
}

const azureRegions = [
  { value: "eastus", label: "East US" },
  { value: "eastus2", label: "East US 2" },
  { value: "westus", label: "West US" },
  { value: "westus2", label: "West US 2" },
  { value: "centralus", label: "Central US" },
  { value: "northeurope", label: "North Europe" },
  { value: "westeurope", label: "West Europe" },
  { value: "uksouth", label: "UK South" },
  { value: "southeastasia", label: "Southeast Asia" },
  { value: "eastasia", label: "East Asia" },
  { value: "japaneast", label: "Japan East" },
  { value: "australiaeast", label: "Australia East" },
];

const getStatusFromScore = (score: number | null) => {
  if (score === null) return "pending";
  if (score >= 80) return "healthy";
  if (score >= 60) return "warning";
  return "error";
};

const statusConfig = {
  healthy: { icon: CheckCircle, color: "text-green-400", bg: "bg-green-500/10" },
  warning: { icon: AlertTriangle, color: "text-yellow-400", bg: "bg-yellow-500/10" },
  error: { icon: AlertTriangle, color: "text-red-400", bg: "bg-red-500/10" },
  pending: { icon: Clock, color: "text-white/40", bg: "bg-white/5" },
};

export default function AzureSubscriptionsPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [subscriptions, setSubscriptions] = useState<AzureSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    subscriptionId: "",
    tenantId: "",
    clientId: "",
    clientSecret: "",
    region: "eastus",
  });

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/azure/subscriptions");
      if (response.ok) {
        const data = await response.json();
        setSubscriptions(data.subscriptions || []);
      }
    } catch (error) {
      console.error("Failed to fetch subscriptions:", error);
      toast.error("Failed to load subscriptions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const filteredSubscriptions = subscriptions.filter(
    (sub) =>
      sub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.subscriptionId.includes(searchQuery)
  );

  const handleAddSubscription = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/azure/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          subscriptionId: formData.subscriptionId,
          tenantId: formData.tenantId || undefined,
          clientId: formData.clientId || undefined,
          clientSecret: formData.clientSecret || undefined,
          region: formData.region,
        }),
      });

      if (response.ok) {
        toast.success("Subscription added successfully!", {
          description: "Ready for security scanning.",
        });
        setIsAddDialogOpen(false);
        setFormData({
          name: "",
          subscriptionId: "",
          tenantId: "",
          clientId: "",
          clientSecret: "",
          region: "eastus",
        });
        fetchSubscriptions();
      } else {
        const error = await response.json();
        toast.error("Failed to add subscription", { description: error.error });
      }
    } catch (error) {
      toast.error("Failed to add subscription");
    }
  };

  const handleDeleteSubscription = async (subscriptionId: string) => {
    try {
      const response = await fetch(`/api/azure/subscriptions/${subscriptionId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Subscription removed successfully");
        fetchSubscriptions();
      } else {
        toast.error("Failed to remove subscription");
      }
    } catch (error) {
      toast.error("Failed to remove subscription");
    }
  };

  const formatLastScan = (lastScanAt: string | null) => {
    if (!lastScanAt) return "Never";
    return format(new Date(lastScanAt), "MMM d, h:mm a");
  };

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
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-64 bg-white/10 rounded-2xl" />
          ))}
        </div>
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
            <h1 className="text-2xl font-bold text-white">Azure Subscriptions</h1>
            <p className="text-white/50 mt-1">
              Manage your connected Azure subscriptions
            </p>
          </div>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="btn-gradient gap-2">
              <Plus className="w-4 h-4" />
              Add Subscription
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] bg-[#1a0a2e] border-white/10">
            <DialogHeader>
              <DialogTitle className="text-white">Add Azure Subscription</DialogTitle>
              <DialogDescription className="text-white/50">
                Connect a new Azure subscription for security auditing
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleAddSubscription} className="space-y-6 mt-4">
              {/* Subscription Name */}
              <div className="space-y-2">
                <Label className="text-white/70">Display Name</Label>
                <Input
                  placeholder="e.g., Production, Staging"
                  className="bg-white/5 border-white/10 text-white"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              {/* Subscription ID */}
              <div className="space-y-2">
                <Label className="text-white/70">Subscription ID</Label>
                <Input
                  placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                  className="bg-white/5 border-white/10 text-white font-mono"
                  value={formData.subscriptionId}
                  onChange={(e) => setFormData({ ...formData, subscriptionId: e.target.value })}
                  required
                />
                <p className="text-xs text-white/40">
                  Found in Azure Portal under Subscriptions
                </p>
              </div>

              {/* Tenant ID */}
              <div className="space-y-2">
                <Label className="text-white/70">Tenant ID (Directory ID)</Label>
                <Input
                  placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                  className="bg-white/5 border-white/10 text-white font-mono"
                  value={formData.tenantId}
                  onChange={(e) => setFormData({ ...formData, tenantId: e.target.value })}
                />
              </div>

              {/* Region */}
              <div className="space-y-2">
                <Label className="text-white/70">Default Region</Label>
                <Select value={formData.region} onValueChange={(v) => setFormData({ ...formData, region: v })}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {azureRegions.map((region) => (
                      <SelectItem key={region.value} value={region.value}>
                        {region.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Service Principal Credentials */}
              <div className="space-y-4">
                <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-sm text-cyan-400">
                  <Key className="w-4 h-4 inline mr-2" />
                  Service Principal credentials for authentication
                </div>

                <div className="space-y-2">
                  <Label className="text-white/70">Client ID (Application ID)</Label>
                  <Input
                    placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                    className="bg-white/5 border-white/10 text-white font-mono"
                    value={formData.clientId}
                    onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-white/70">Client Secret</Label>
                  <Input
                    type="password"
                    placeholder="Enter your client secret"
                    className="bg-white/5 border-white/10 text-white font-mono"
                    value={formData.clientSecret}
                    onChange={(e) => setFormData({ ...formData, clientSecret: e.target.value })}
                  />
                </div>

                <p className="text-xs text-white/40">
                  Create a Service Principal with Reader role in Azure AD
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 bg-white/5 border-white/10"
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 btn-gradient">
                  Add Subscription
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <Input
            placeholder="Search subscriptions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white/5 border-white/10 text-white"
          />
        </div>
      </div>

      {/* Subscriptions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredSubscriptions.map((subscription) => {
          const latestAudit = subscription.audits?.[0];
          const score = subscription.healthScore ?? latestAudit?.riskScore ?? null;
          const statusKey = getStatusFromScore(score);
          const status = statusConfig[statusKey];
          const StatusIcon = status.icon;
          const findings = latestAudit || { critical: 0, high: 0, medium: 0, low: 0 };

          return (
            <GlassCard key={subscription.id} className="p-5">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-cyan-500/10">
                    <AzureIcon className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{subscription.name}</h3>
                    <p className="text-xs text-white/40 font-mono truncate max-w-[150px]">
                      {subscription.subscriptionId}
                    </p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Play className="w-4 h-4 mr-2" />
                      Run Audit
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View in Azure Portal
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-red-400"
                      onClick={() => handleDeleteSubscription(subscription.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Remove
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Status & Region */}
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={cn(
                    "flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium",
                    status.bg,
                    status.color
                  )}
                >
                  <StatusIcon className="w-3 h-3" />
                  {statusKey}
                </div>
                <span className="text-xs text-white/40">{subscription.region}</span>
              </div>

              {/* Findings Summary */}
              <div className="grid grid-cols-4 gap-2 mb-4">
                <div className="text-center p-2 rounded bg-red-500/10">
                  <p className="text-lg font-bold text-red-400">
                    {findings.critical}
                  </p>
                  <p className="text-[10px] text-red-400/60">Critical</p>
                </div>
                <div className="text-center p-2 rounded bg-orange-500/10">
                  <p className="text-lg font-bold text-orange-400">
                    {findings.high}
                  </p>
                  <p className="text-[10px] text-orange-400/60">High</p>
                </div>
                <div className="text-center p-2 rounded bg-yellow-500/10">
                  <p className="text-lg font-bold text-yellow-400">
                    {findings.medium}
                  </p>
                  <p className="text-[10px] text-yellow-400/60">Medium</p>
                </div>
                <div className="text-center p-2 rounded bg-green-500/10">
                  <p className="text-lg font-bold text-green-400">
                    {findings.low}
                  </p>
                  <p className="text-[10px] text-green-400/60">Low</p>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-white/40">Score:</span>
                  <span
                    className={cn(
                      "text-sm font-bold",
                      score !== null && score >= 80
                        ? "text-green-400"
                        : score !== null && score >= 60
                        ? "text-yellow-400"
                        : score !== null
                        ? "text-red-400"
                        : "text-white/40"
                    )}
                  >
                    {score !== null ? `${score}%` : "N/A"}
                  </span>
                </div>
                <span className="text-xs text-white/30">
                  Last scan: {formatLastScan(subscription.lastScanAt)}
                </span>
              </div>
            </GlassCard>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredSubscriptions.length === 0 && !loading && (
        <div className="text-center py-12">
          <AzureIcon className="w-12 h-12 text-white/20 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No subscriptions found</h3>
          <p className="text-white/50 mb-4">
            {searchQuery
              ? "Try adjusting your search query"
              : "Get started by adding your first Azure subscription"}
          </p>
          {!searchQuery && (
            <Button className="btn-gradient gap-2" onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="w-4 h-4" />
              Add Subscription
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

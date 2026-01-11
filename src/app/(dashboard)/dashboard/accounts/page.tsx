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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Cloud,
  Plus,
  Search,
  MoreVertical,
  Play,
  Trash2,
  Edit,
  CheckCircle,
  AlertTriangle,
  Clock,
  Shield,
  Key,
  ExternalLink,
  RefreshCw,
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

interface Account {
  id: string;
  name: string;
  accountId: string;
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

const awsRegions = [
  { value: "us-east-1", label: "US East (N. Virginia)" },
  { value: "us-east-2", label: "US East (Ohio)" },
  { value: "us-west-1", label: "US West (N. California)" },
  { value: "us-west-2", label: "US West (Oregon)" },
  { value: "eu-west-1", label: "Europe (Ireland)" },
  { value: "eu-central-1", label: "Europe (Frankfurt)" },
  { value: "ap-southeast-1", label: "Asia Pacific (Singapore)" },
  { value: "ap-northeast-1", label: "Asia Pacific (Tokyo)" },
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

export default function AccountsPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [authMethod, setAuthMethod] = useState<"keys" | "role">("role");
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    accountId: "",
    region: "us-east-1",
    roleArn: "",
    accessKeyId: "",
    secretAccessKey: "",
  });

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/accounts");
      if (response.ok) {
        const data = await response.json();
        setAccounts(data.accounts || []);
      }
    } catch (error) {
      console.error("Failed to fetch accounts:", error);
      toast.error("Failed to load accounts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const filteredAccounts = accounts.filter(
    (account) =>
      account.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      account.accountId.includes(searchQuery)
  );

  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          accountId: formData.accountId,
          region: formData.region,
          roleArn: authMethod === "role" ? formData.roleArn : undefined,
          accessKeyId: authMethod === "keys" ? formData.accessKeyId : undefined,
          secretAccessKey: authMethod === "keys" ? formData.secretAccessKey : undefined,
        }),
      });

      if (response.ok) {
        toast.success("Account added successfully!", {
          description: "Ready for security scanning.",
        });
        setIsAddDialogOpen(false);
        setFormData({ name: "", accountId: "", region: "us-east-1", roleArn: "", accessKeyId: "", secretAccessKey: "" });
        fetchAccounts();
      } else {
        const error = await response.json();
        toast.error("Failed to add account", { description: error.error });
      }
    } catch (error) {
      toast.error("Failed to add account");
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
        <div>
          <h1 className="text-2xl font-bold text-white">AWS Accounts</h1>
          <p className="text-white/50 mt-1">
            Manage your connected AWS accounts
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="btn-gradient gap-2">
              <Plus className="w-4 h-4" />
              Add Account
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] bg-[#1a0a2e] border-white/10">
            <DialogHeader>
              <DialogTitle className="text-white">Add AWS Account</DialogTitle>
              <DialogDescription className="text-white/50">
                Connect a new AWS account for security auditing
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleAddAccount} className="space-y-6 mt-4">
              {/* Account Name */}
              <div className="space-y-2">
                <Label className="text-white/70">Account Name</Label>
                <Input
                  placeholder="e.g., Production, Staging"
                  className="bg-white/5 border-white/10 text-white"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              {/* AWS Account ID */}
              <div className="space-y-2">
                <Label className="text-white/70">AWS Account ID</Label>
                <Input
                  placeholder="123456789012"
                  className="bg-white/5 border-white/10 text-white"
                  value={formData.accountId}
                  onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
                  required
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
                    {awsRegions.map((region) => (
                      <SelectItem key={region.value} value={region.value}>
                        {region.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Authentication Method */}
              <div className="space-y-3">
                <Label className="text-white/70">Authentication Method</Label>
                <Tabs value={authMethod} onValueChange={(v) => setAuthMethod(v as any)}>
                  <TabsList className="grid grid-cols-2 bg-white/5">
                    <TabsTrigger value="role" className="data-[state=active]:bg-primary/20">
                      <Shield className="w-4 h-4 mr-2" />
                      IAM Role
                    </TabsTrigger>
                    <TabsTrigger value="keys" className="data-[state=active]:bg-primary/20">
                      <Key className="w-4 h-4 mr-2" />
                      Access Keys
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="role" className="space-y-4 mt-4">
                    <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-sm text-blue-400">
                      IAM Role is the recommended method. It's more secure.
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white/70">Role ARN</Label>
                      <Input
                        placeholder="arn:aws:iam::123456789012:role/SecurityAuditRole"
                        className="bg-white/5 border-white/10 text-white font-mono text-sm"
                        value={formData.roleArn}
                        onChange={(e) => setFormData({ ...formData, roleArn: e.target.value })}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="keys" className="space-y-4 mt-4">
                    <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-sm text-yellow-400">
                      Access keys will be encrypted. We recommend IAM Role instead.
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white/70">Access Key ID</Label>
                      <Input
                        placeholder="AKIAIOSFODNN7EXAMPLE"
                        className="bg-white/5 border-white/10 text-white font-mono"
                        value={formData.accessKeyId}
                        onChange={(e) => setFormData({ ...formData, accessKeyId: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white/70">Secret Access Key</Label>
                      <Input
                        type="password"
                        placeholder="Enter your secret access key"
                        className="bg-white/5 border-white/10 text-white font-mono"
                        value={formData.secretAccessKey}
                        onChange={(e) => setFormData({ ...formData, secretAccessKey: e.target.value })}
                      />
                    </div>
                  </TabsContent>
                </Tabs>
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
                  Add Account
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
            placeholder="Search accounts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white/5 border-white/10 text-white"
          />
        </div>
      </div>

      {/* Accounts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredAccounts.map((account) => {
          const latestAudit = account.audits?.[0];
          const score = account.healthScore ?? latestAudit?.riskScore ?? null;
          const statusKey = getStatusFromScore(score);
          const status = statusConfig[statusKey];
          const StatusIcon = status.icon;
          const findings = latestAudit || { critical: 0, high: 0, medium: 0, low: 0 };

          return (
            <GlassCard key={account.id} className="p-5">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Cloud className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{account.name}</h3>
                    <p className="text-xs text-white/40 font-mono">
                      {account.accountId}
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
                      View in AWS
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-400">
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
                <span className="text-xs text-white/40">{account.region}</span>
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
                  Last scan: {formatLastScan(account.lastScanAt)}
                </span>
              </div>
            </GlassCard>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredAccounts.length === 0 && !loading && (
        <div className="text-center py-12">
          <Cloud className="w-12 h-12 text-white/20 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No accounts found</h3>
          <p className="text-white/50 mb-4">
            {searchQuery
              ? "Try adjusting your search query"
              : "Get started by adding your first AWS account"}
          </p>
          {!searchQuery && (
            <Button className="btn-gradient gap-2" onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="w-4 h-4" />
              Add Account
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

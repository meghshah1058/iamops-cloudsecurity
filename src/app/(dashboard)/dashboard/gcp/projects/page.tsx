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
  FileKey,
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

// GCP Icon
function GcpIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12.19 2.38a9.344 9.344 0 0 0-9.234 6.893c.053-.02-.055.013 0 0-3.875 2.551-3.922 8.11-.247 10.941l.006-.007-.007.03a6.717 6.717 0 0 0 4.077 1.356h5.173l.03.03h5.192c6.687.053 9.376-8.605 3.835-12.35a9.365 9.365 0 0 0-8.825-6.893zM8.073 19.831a4.966 4.966 0 0 1-2.9-1.088l.006-.003a5.002 5.002 0 0 1 .004-7.47l.003.003.003-.003.006.007a5.006 5.006 0 0 1 7.471.003l-1.768 1.768a2.501 2.501 0 1 0 0 3.536l1.77 1.77a5.013 5.013 0 0 1-4.595 1.477zm11.034-5.012l-2.004-.001v2.004h-1.5v-2.004l-2.004-.001v-1.501h2.004V11.31h1.5v2.006l2.004-.001z"/>
    </svg>
  );
}

interface GcpProject {
  id: string;
  name: string;
  projectId: string;
  projectNumber: string | null;
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

const gcpRegions = [
  { value: "us-central1", label: "US Central (Iowa)" },
  { value: "us-east1", label: "US East (South Carolina)" },
  { value: "us-east4", label: "US East (N. Virginia)" },
  { value: "us-west1", label: "US West (Oregon)" },
  { value: "us-west2", label: "US West (Los Angeles)" },
  { value: "europe-west1", label: "Europe West (Belgium)" },
  { value: "europe-west2", label: "Europe West (London)" },
  { value: "asia-east1", label: "Asia East (Taiwan)" },
  { value: "asia-northeast1", label: "Asia Northeast (Tokyo)" },
  { value: "asia-southeast1", label: "Asia Southeast (Singapore)" },
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

export default function GcpProjectsPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [projects, setProjects] = useState<GcpProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    projectId: "",
    projectNumber: "",
    region: "us-central1",
    serviceAccountKey: "",
  });

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/gcp/projects");
      if (response.ok) {
        const data = await response.json();
        setProjects(data.projects || []);
      }
    } catch (error) {
      console.error("Failed to fetch projects:", error);
      toast.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const filteredProjects = projects.filter(
    (project) =>
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.projectId.includes(searchQuery)
  );

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/gcp/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          projectId: formData.projectId,
          projectNumber: formData.projectNumber || undefined,
          region: formData.region,
          serviceAccountKey: formData.serviceAccountKey || undefined,
        }),
      });

      if (response.ok) {
        toast.success("Project added successfully!", {
          description: "Ready for security scanning.",
        });
        setIsAddDialogOpen(false);
        setFormData({ name: "", projectId: "", projectNumber: "", region: "us-central1", serviceAccountKey: "" });
        fetchProjects();
      } else {
        const error = await response.json();
        toast.error("Failed to add project", { description: error.error });
      }
    } catch (error) {
      toast.error("Failed to add project");
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      const response = await fetch(`/api/gcp/projects/${projectId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Project removed successfully");
        fetchProjects();
      } else {
        toast.error("Failed to remove project");
      }
    } catch (error) {
      toast.error("Failed to remove project");
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
          <div className="p-2 rounded-xl bg-blue-500/10">
            <GcpIcon className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">GCP Projects</h1>
            <p className="text-white/50 mt-1">
              Manage your connected Google Cloud projects
            </p>
          </div>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="btn-gradient gap-2">
              <Plus className="w-4 h-4" />
              Add Project
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] bg-[#1a0a2e] border-white/10">
            <DialogHeader>
              <DialogTitle className="text-white">Add GCP Project</DialogTitle>
              <DialogDescription className="text-white/50">
                Connect a new Google Cloud project for security auditing
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleAddProject} className="space-y-6 mt-4">
              {/* Project Name */}
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

              {/* GCP Project ID */}
              <div className="space-y-2">
                <Label className="text-white/70">GCP Project ID</Label>
                <Input
                  placeholder="my-project-123456"
                  className="bg-white/5 border-white/10 text-white font-mono"
                  value={formData.projectId}
                  onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                  required
                />
                <p className="text-xs text-white/40">
                  Found in your GCP Console project settings
                </p>
              </div>

              {/* Project Number (Optional) */}
              <div className="space-y-2">
                <Label className="text-white/70">Project Number (Optional)</Label>
                <Input
                  placeholder="123456789012"
                  className="bg-white/5 border-white/10 text-white font-mono"
                  value={formData.projectNumber}
                  onChange={(e) => setFormData({ ...formData, projectNumber: e.target.value })}
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
                    {gcpRegions.map((region) => (
                      <SelectItem key={region.value} value={region.value}>
                        {region.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Service Account Key */}
              <div className="space-y-2">
                <Label className="text-white/70">Service Account Key (JSON)</Label>
                <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-sm text-blue-400 mb-2">
                  <FileKey className="w-4 h-4 inline mr-2" />
                  Paste your service account JSON key for authentication
                </div>
                <textarea
                  placeholder='{"type": "service_account", "project_id": "...", ...}'
                  className="w-full h-32 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                  value={formData.serviceAccountKey}
                  onChange={(e) => setFormData({ ...formData, serviceAccountKey: e.target.value })}
                />
                <p className="text-xs text-white/40">
                  Create a service account with Security Reviewer role in GCP IAM
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
                  Add Project
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
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white/5 border-white/10 text-white"
          />
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredProjects.map((project) => {
          const latestAudit = project.audits?.[0];
          const score = project.healthScore ?? latestAudit?.riskScore ?? null;
          const statusKey = getStatusFromScore(score);
          const status = statusConfig[statusKey];
          const StatusIcon = status.icon;
          const findings = latestAudit || { critical: 0, high: 0, medium: 0, low: 0 };

          return (
            <GlassCard key={project.id} className="p-5">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <GcpIcon className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{project.name}</h3>
                    <p className="text-xs text-white/40 font-mono">
                      {project.projectId}
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
                      View in GCP Console
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-red-400"
                      onClick={() => handleDeleteProject(project.id)}
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
                <span className="text-xs text-white/40">{project.region}</span>
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
                  Last scan: {formatLastScan(project.lastScanAt)}
                </span>
              </div>
            </GlassCard>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredProjects.length === 0 && !loading && (
        <div className="text-center py-12">
          <GcpIcon className="w-12 h-12 text-white/20 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No projects found</h3>
          <p className="text-white/50 mb-4">
            {searchQuery
              ? "Try adjusting your search query"
              : "Get started by adding your first GCP project"}
          </p>
          {!searchQuery && (
            <Button className="btn-gradient gap-2" onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="w-4 h-4" />
              Add Project
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

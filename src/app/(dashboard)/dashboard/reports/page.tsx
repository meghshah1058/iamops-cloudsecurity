"use client";

import { useState } from "react";
import { GlassCard } from "@/components/dashboard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  FileText,
  Plus,
  Search,
  Download,
  Calendar,
  Cloud,
  FileType,
  Trash2,
  Share,
  MoreVertical,
  Eye,
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

// Sample data
const reports = [
  {
    id: "1",
    name: "Production Security Report - January 2024",
    accountName: "Production",
    auditDate: "Jan 11, 2024",
    generatedAt: "Jan 11, 2024 at 11:30 AM",
    format: "pdf",
    size: "2.4 MB",
    findings: { critical: 3, high: 12, medium: 25, low: 18 },
  },
  {
    id: "2",
    name: "Q4 2023 Compliance Report",
    accountName: "All Accounts",
    auditDate: "Dec 31, 2023",
    generatedAt: "Jan 2, 2024 at 09:15 AM",
    format: "pdf",
    size: "5.1 MB",
    findings: { critical: 8, high: 34, medium: 67, low: 45 },
  },
  {
    id: "3",
    name: "Development Environment Scan",
    accountName: "Development",
    auditDate: "Jan 10, 2024",
    generatedAt: "Jan 10, 2024 at 10:00 AM",
    format: "docx",
    size: "1.8 MB",
    findings: { critical: 0, high: 4, medium: 12, low: 30 },
  },
  {
    id: "4",
    name: "Staging Security Assessment",
    accountName: "Staging",
    auditDate: "Jan 9, 2024",
    generatedAt: "Jan 9, 2024 at 03:45 PM",
    format: "md",
    size: "856 KB",
    findings: { critical: 1, high: 8, medium: 15, low: 22 },
  },
];

const formatConfig = {
  pdf: { icon: FileText, color: "text-red-400", bg: "bg-red-500/10", label: "PDF" },
  docx: { icon: FileType, color: "text-blue-400", bg: "bg-blue-500/10", label: "Word" },
  md: { icon: FileText, color: "text-green-400", bg: "bg-green-500/10", label: "Markdown" },
};

const accounts = [
  { value: "all", label: "All Accounts" },
  { value: "1", label: "Production (123456789012)" },
  { value: "2", label: "Staging (234567890123)" },
  { value: "3", label: "Development (345678901234)" },
];

export default function ReportsPage() {
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFormat, setSelectedFormat] = useState("pdf");
  const [selectedAccount, setSelectedAccount] = useState("all");
  const [includeSections, setIncludeSections] = useState({
    executive: true,
    findings: true,
    remediation: true,
    compliance: true,
    appendix: false,
  });

  const filteredReports = reports.filter((report) =>
    report.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    report.accountName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleGenerateReport = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Report generation started!", {
      description: "Your report will be ready in a few minutes.",
    });
    setIsGenerateDialogOpen(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Reports</h1>
          <p className="text-white/50 mt-1">
            Generate and download security audit reports
          </p>
        </div>
        <Dialog open={isGenerateDialogOpen} onOpenChange={setIsGenerateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="btn-gradient gap-2">
              <Plus className="w-4 h-4" />
              Generate Report
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] bg-[#1a0a2e] border-white/10">
            <DialogHeader>
              <DialogTitle className="text-white">Generate Report</DialogTitle>
              <DialogDescription className="text-white/50">
                Create a new security audit report
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleGenerateReport} className="space-y-6 mt-4">
              {/* Account Selection */}
              <div className="space-y-2">
                <Label className="text-white/70">AWS Account</Label>
                <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((account) => (
                      <SelectItem key={account.value} value={account.value}>
                        {account.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Format Selection */}
              <div className="space-y-2">
                <Label className="text-white/70">Report Format</Label>
                <div className="grid grid-cols-3 gap-3">
                  {Object.entries(formatConfig).map(([key, config]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setSelectedFormat(key)}
                      className={cn(
                        "p-3 rounded-lg border text-center transition-all",
                        selectedFormat === key
                          ? "bg-primary/10 border-primary/30"
                          : "bg-white/5 border-white/10 hover:border-white/20"
                      )}
                    >
                      <config.icon
                        className={cn("w-6 h-6 mx-auto mb-1", config.color)}
                      />
                      <span className="text-sm text-white">{config.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Include Sections */}
              <div className="space-y-3">
                <Label className="text-white/70">Include Sections</Label>
                <div className="space-y-2">
                  {[
                    { key: "executive", label: "Executive Summary" },
                    { key: "findings", label: "Detailed Findings" },
                    { key: "remediation", label: "Remediation Recommendations" },
                    { key: "compliance", label: "Compliance Mapping" },
                    { key: "appendix", label: "Technical Appendix" },
                  ].map((section) => (
                    <div key={section.key} className="flex items-center gap-2">
                      <Checkbox
                        id={section.key}
                        checked={includeSections[section.key as keyof typeof includeSections]}
                        onCheckedChange={(checked) =>
                          setIncludeSections({
                            ...includeSections,
                            [section.key]: checked,
                          })
                        }
                        className="border-white/20 data-[state=checked]:bg-primary"
                      />
                      <Label
                        htmlFor={section.key}
                        className="text-sm text-white/70 cursor-pointer"
                      >
                        {section.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 bg-white/5 border-white/10"
                  onClick={() => setIsGenerateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 btn-gradient">
                  Generate Report
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
        <Input
          placeholder="Search reports..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-white/5 border-white/10 text-white"
        />
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredReports.map((report) => {
          const format = formatConfig[report.format as keyof typeof formatConfig];
          const FormatIcon = format.icon;
          const totalFindings =
            report.findings.critical +
            report.findings.high +
            report.findings.medium +
            report.findings.low;

          return (
            <GlassCard key={report.id} className="p-5">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className={cn("p-3 rounded-xl", format.bg)}>
                  <FormatIcon className={cn("w-6 h-6", format.color)} />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Eye className="w-4 h-4 mr-2" />
                      Preview
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Share className="w-4 h-4 mr-2" />
                      Share Link
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-400">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Title */}
              <h3 className="font-semibold text-white mb-1 line-clamp-2">
                {report.name}
              </h3>

              {/* Meta */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center gap-1 text-xs text-white/40">
                  <Cloud className="w-3 h-3" />
                  {report.accountName}
                </div>
                <span className={cn("text-xs px-2 py-0.5 rounded-full", format.bg, format.color)}>
                  {format.label}
                </span>
              </div>

              {/* Findings Summary */}
              <div className="flex items-center gap-2 mb-4">
                {report.findings.critical > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded bg-red-500/10 text-red-400">
                    {report.findings.critical} critical
                  </span>
                )}
                {report.findings.high > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded bg-orange-500/10 text-orange-400">
                    {report.findings.high} high
                  </span>
                )}
                <span className="text-xs text-white/30">{totalFindings} total</span>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <div className="flex items-center gap-1 text-xs text-white/40">
                  <Calendar className="w-3 h-3" />
                  {report.generatedAt}
                </div>
                <span className="text-xs text-white/30">{report.size}</span>
              </div>

              {/* Download Button */}
              <Button
                variant="outline"
                className="w-full mt-4 bg-white/5 border-white/10 hover:bg-white/10 gap-2"
              >
                <Download className="w-4 h-4" />
                Download
              </Button>
            </GlassCard>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredReports.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-white/20 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No reports found</h3>
          <p className="text-white/50 mb-4">
            {searchQuery
              ? "Try adjusting your search query"
              : "Generate your first security report"}
          </p>
          {!searchQuery && (
            <Button
              className="btn-gradient gap-2"
              onClick={() => setIsGenerateDialogOpen(true)}
            >
              <Plus className="w-4 h-4" />
              Generate Report
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

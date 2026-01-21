"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Clock, Calendar, Play } from "lucide-react";
import { toast } from "sonner";

type CloudProvider = "AWS" | "GCP" | "AZURE";

interface ScheduleConfigProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cloudProvider: CloudProvider;
  accountId: string;
  accountName: string;
  initialSchedule?: {
    scheduleEnabled: boolean;
    scheduleFrequency: string | null;
    scheduleHour: number | null;
    scheduleDayOfWeek: number | null;
    scheduleDayOfMonth: number | null;
    nextScheduledScan: Date | null;
  };
  onScheduleUpdated?: () => void;
}

const FREQUENCIES = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
];

const DAYS_OF_WEEK = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

const HOURS = Array.from({ length: 24 }, (_, i) => ({
  value: i,
  label: `${i.toString().padStart(2, "0")}:00`,
}));

const DAYS_OF_MONTH = Array.from({ length: 31 }, (_, i) => ({
  value: i + 1,
  label: `${i + 1}${getOrdinalSuffix(i + 1)}`,
}));

function getOrdinalSuffix(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}

export function ScheduleConfig({
  open,
  onOpenChange,
  cloudProvider,
  accountId,
  accountName,
  initialSchedule,
  onScheduleUpdated,
}: ScheduleConfigProps) {
  const [saving, setSaving] = useState(false);
  const [triggering, setTriggering] = useState(false);
  const [enabled, setEnabled] = useState(initialSchedule?.scheduleEnabled || false);
  const [frequency, setFrequency] = useState(initialSchedule?.scheduleFrequency || "daily");
  const [hour, setHour] = useState(initialSchedule?.scheduleHour ?? 0);
  const [dayOfWeek, setDayOfWeek] = useState(initialSchedule?.scheduleDayOfWeek ?? 0);
  const [dayOfMonth, setDayOfMonth] = useState(initialSchedule?.scheduleDayOfMonth ?? 1);

  // Reset form when initialSchedule changes
  useEffect(() => {
    if (initialSchedule) {
      setEnabled(initialSchedule.scheduleEnabled);
      setFrequency(initialSchedule.scheduleFrequency || "daily");
      setHour(initialSchedule.scheduleHour ?? 0);
      setDayOfWeek(initialSchedule.scheduleDayOfWeek ?? 0);
      setDayOfMonth(initialSchedule.scheduleDayOfMonth ?? 1);
    }
  }, [initialSchedule]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cloudProvider,
          accountId,
          scheduleEnabled: enabled,
          scheduleFrequency: frequency,
          scheduleHour: hour,
          scheduleDayOfWeek: frequency === "weekly" ? dayOfWeek : null,
          scheduleDayOfMonth: frequency === "monthly" ? dayOfMonth : null,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(data.message);
        onScheduleUpdated?.();
        onOpenChange(false);
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to save schedule");
      }
    } catch (error) {
      console.error("Failed to save schedule:", error);
      toast.error("Failed to save schedule");
    } finally {
      setSaving(false);
    }
  };

  const handleTriggerNow = async () => {
    setTriggering(true);
    try {
      const response = await fetch(`/api/schedules/${accountId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cloudProvider }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(data.message);
        onScheduleUpdated?.();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to trigger scan");
      }
    } catch (error) {
      console.error("Failed to trigger scan:", error);
      toast.error("Failed to trigger scan");
    } finally {
      setTriggering(false);
    }
  };

  const getScheduleDescription = (): string => {
    if (!enabled) return "Scheduling is disabled";

    const hourStr = HOURS[hour]?.label || `${hour}:00`;

    switch (frequency) {
      case "daily":
        return `Every day at ${hourStr}`;
      case "weekly":
        const dayName = DAYS_OF_WEEK[dayOfWeek]?.label || "Sunday";
        return `Every ${dayName} at ${hourStr}`;
      case "monthly":
        const dayStr = DAYS_OF_MONTH[dayOfMonth - 1]?.label || `${dayOfMonth}th`;
        return `On the ${dayStr} of each month at ${hourStr}`;
      default:
        return "";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#1a1a2e] border-white/10 text-white sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Schedule Configuration
          </DialogTitle>
          <DialogDescription className="text-white/60">
            Configure automated scans for{" "}
            <span className="text-white font-medium">{accountName}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Enable Toggle */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
            <div>
              <p className="text-white font-medium">Enable Scheduled Scans</p>
              <p className="text-sm text-white/40">
                Automatically run security scans on a schedule
              </p>
            </div>
            <Switch checked={enabled} onCheckedChange={setEnabled} />
          </div>

          {enabled && (
            <>
              {/* Frequency */}
              <div className="space-y-2">
                <Label className="text-white/70">Frequency</Label>
                <Select value={frequency} onValueChange={setFrequency}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a2e] border-white/10">
                    {FREQUENCIES.map((f) => (
                      <SelectItem
                        key={f.value}
                        value={f.value}
                        className="text-white hover:bg-white/10"
                      >
                        {f.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Day of Week (for weekly) */}
              {frequency === "weekly" && (
                <div className="space-y-2">
                  <Label className="text-white/70">Day of Week</Label>
                  <Select
                    value={dayOfWeek.toString()}
                    onValueChange={(v) => setDayOfWeek(parseInt(v))}
                  >
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue placeholder="Select day" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a1a2e] border-white/10">
                      {DAYS_OF_WEEK.map((d) => (
                        <SelectItem
                          key={d.value}
                          value={d.value.toString()}
                          className="text-white hover:bg-white/10"
                        >
                          {d.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Day of Month (for monthly) */}
              {frequency === "monthly" && (
                <div className="space-y-2">
                  <Label className="text-white/70">Day of Month</Label>
                  <Select
                    value={dayOfMonth.toString()}
                    onValueChange={(v) => setDayOfMonth(parseInt(v))}
                  >
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue placeholder="Select day" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a1a2e] border-white/10 max-h-60">
                      {DAYS_OF_MONTH.map((d) => (
                        <SelectItem
                          key={d.value}
                          value={d.value.toString()}
                          className="text-white hover:bg-white/10"
                        >
                          {d.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Hour */}
              <div className="space-y-2">
                <Label className="text-white/70">Time (UTC)</Label>
                <Select
                  value={hour.toString()}
                  onValueChange={(v) => setHour(parseInt(v))}
                >
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a2e] border-white/10 max-h-60">
                    {HOURS.map((h) => (
                      <SelectItem
                        key={h.value}
                        value={h.value.toString()}
                        className="text-white hover:bg-white/10"
                      >
                        {h.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Schedule Summary */}
              <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                <div className="flex items-center gap-2 text-primary mb-1">
                  <Calendar className="w-4 h-4" />
                  <span className="font-medium">Schedule Summary</span>
                </div>
                <p className="text-white/80 text-sm">{getScheduleDescription()}</p>
                {initialSchedule?.nextScheduledScan && (
                  <p className="text-white/50 text-xs mt-2">
                    Next scan:{" "}
                    {new Date(initialSchedule.nextScheduledScan).toLocaleString()}
                  </p>
                )}
              </div>
            </>
          )}

          {/* Manual Trigger */}
          <div className="pt-4 border-t border-white/10">
            <Button
              variant="outline"
              className="w-full bg-white/5 border-white/10 gap-2"
              onClick={handleTriggerNow}
              disabled={triggering}
            >
              {triggering ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              Run Scan Now
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="bg-white/5 border-white/10"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="btn-gradient gap-2"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            Save Schedule
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ScheduleConfig;

"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { GlassCard } from "@/components/dashboard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  User,
  Bell,
  Shield,
  Key,
  Palette,
  Save,
  Camera,
  Mail,
  Lock,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const settingsSections = [
  { id: "profile", label: "Profile", icon: User },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security", icon: Shield },
  { id: "api", label: "API Keys", icon: Key },
  { id: "appearance", label: "Appearance", icon: Palette },
];

export default function SettingsPage() {
  const { data: session } = useSession();
  const [activeSection, setActiveSection] = useState("profile");
  const [notifications, setNotifications] = useState({
    auditComplete: true,
    criticalFindings: true,
    weeklyDigest: false,
    newFeatures: true,
  });

  const handleSave = () => {
    toast.success("Settings saved successfully!");
  };

  const userInitials =
    session?.user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "U";

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-white/50 mt-1">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <GlassCard className="p-4 lg:col-span-1 h-fit">
          <nav className="space-y-1">
            {settingsSections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left",
                  activeSection === section.id
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                )}
              >
                <section.icon className="w-4 h-4" />
                <span className="text-sm font-medium">{section.label}</span>
              </button>
            ))}
          </nav>
        </GlassCard>

        {/* Settings Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Profile Section */}
          {activeSection === "profile" && (
            <GlassCard className="p-6">
              <h2 className="text-lg font-semibold text-white mb-6">Profile Settings</h2>

              {/* Avatar */}
              <div className="flex items-center gap-6 mb-8">
                <div className="relative">
                  <Avatar className="w-20 h-20">
                    <AvatarImage src={session?.user?.image || undefined} />
                    <AvatarFallback className="bg-primary/20 text-primary text-xl">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <button className="absolute bottom-0 right-0 p-1.5 rounded-full bg-primary text-white hover:bg-primary/80 transition-colors">
                    <Camera className="w-4 h-4" />
                  </button>
                </div>
                <div>
                  <p className="text-white font-medium">{session?.user?.name || "User"}</p>
                  <p className="text-white/40 text-sm">{session?.user?.email}</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-white/70">Full Name</Label>
                    <Input
                      defaultValue={session?.user?.name || ""}
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white/70">Email Address</Label>
                    <Input
                      type="email"
                      defaultValue={session?.user?.email || ""}
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-white/70">Job Title</Label>
                  <Input
                    placeholder="e.g., Security Engineer"
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-white/70">Company</Label>
                  <Input
                    placeholder="e.g., Acme Inc."
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>

                <Button className="btn-gradient gap-2" onClick={handleSave}>
                  <Save className="w-4 h-4" />
                  Save Changes
                </Button>
              </div>
            </GlassCard>
          )}

          {/* Notifications Section */}
          {activeSection === "notifications" && (
            <GlassCard className="p-6">
              <h2 className="text-lg font-semibold text-white mb-6">Notification Preferences</h2>

              <div className="space-y-6">
                {[
                  {
                    key: "auditComplete",
                    title: "Audit Completed",
                    description: "Get notified when a security audit finishes",
                  },
                  {
                    key: "criticalFindings",
                    title: "Critical Findings",
                    description: "Immediate alerts for critical security issues",
                  },
                  {
                    key: "weeklyDigest",
                    title: "Weekly Digest",
                    description: "Summary of your security posture every week",
                  },
                  {
                    key: "newFeatures",
                    title: "New Features",
                    description: "Updates about new features and improvements",
                  },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">{item.title}</p>
                      <p className="text-sm text-white/40">{item.description}</p>
                    </div>
                    <Switch
                      checked={notifications[item.key as keyof typeof notifications]}
                      onCheckedChange={(checked) =>
                        setNotifications({ ...notifications, [item.key]: checked })
                      }
                    />
                  </div>
                ))}

                <Separator className="bg-white/10" />

                <div className="space-y-2">
                  <Label className="text-white/70">Email for Notifications</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                      <Input
                        type="email"
                        defaultValue={session?.user?.email || ""}
                        className="pl-10 bg-white/5 border-white/10 text-white"
                      />
                    </div>
                    <Button variant="outline" className="bg-white/5 border-white/10">
                      Verify
                    </Button>
                  </div>
                </div>

                <Button className="btn-gradient gap-2" onClick={handleSave}>
                  <Save className="w-4 h-4" />
                  Save Preferences
                </Button>
              </div>
            </GlassCard>
          )}

          {/* Security Section */}
          {activeSection === "security" && (
            <GlassCard className="p-6">
              <h2 className="text-lg font-semibold text-white mb-6">Security Settings</h2>

              <div className="space-y-6">
                {/* Change Password */}
                <div className="space-y-4">
                  <h3 className="text-white font-medium">Change Password</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-white/70">Current Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                        <Input
                          type="password"
                          className="pl-10 bg-white/5 border-white/10 text-white"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white/70">New Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                        <Input
                          type="password"
                          className="pl-10 bg-white/5 border-white/10 text-white"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white/70">Confirm New Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                        <Input
                          type="password"
                          className="pl-10 bg-white/5 border-white/10 text-white"
                        />
                      </div>
                    </div>
                    <Button className="btn-gradient">Update Password</Button>
                  </div>
                </div>

                <Separator className="bg-white/10" />

                {/* Two-Factor Authentication */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Two-Factor Authentication</p>
                    <p className="text-sm text-white/40">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <Button variant="outline" className="bg-white/5 border-white/10">
                    Enable 2FA
                  </Button>
                </div>

                <Separator className="bg-white/10" />

                {/* Active Sessions */}
                <div>
                  <h3 className="text-white font-medium mb-4">Active Sessions</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                      <div>
                        <p className="text-white text-sm">Chrome on macOS</p>
                        <p className="text-xs text-white/40">Current session</p>
                      </div>
                      <span className="text-xs px-2 py-1 rounded-full bg-green-500/10 text-green-400">
                        Active
                      </span>
                    </div>
                  </div>
                </div>

                <Separator className="bg-white/10" />

                {/* Danger Zone */}
                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-red-400 font-medium">Delete Account</h3>
                      <p className="text-sm text-red-400/70 mt-1">
                        Permanently delete your account and all associated data. This action cannot be undone.
                      </p>
                      <Button
                        variant="outline"
                        className="mt-4 border-red-500/30 text-red-400 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Account
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </GlassCard>
          )}

          {/* API Keys Section */}
          {activeSection === "api" && (
            <GlassCard className="p-6">
              <h2 className="text-lg font-semibold text-white mb-6">API Keys</h2>

              <div className="space-y-6">
                <p className="text-white/50 text-sm">
                  API keys allow you to integrate with the AWS Security Audit Dashboard programmatically.
                </p>

                <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-medium">Production API Key</span>
                    <span className="text-xs px-2 py-1 rounded-full bg-green-500/10 text-green-400">
                      Active
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value="sk-xxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                      readOnly
                      className="bg-white/5 border-white/10 text-white font-mono text-sm"
                    />
                    <Button variant="outline" className="bg-white/5 border-white/10">
                      Copy
                    </Button>
                  </div>
                  <p className="text-xs text-white/30 mt-2">Created on Jan 1, 2024</p>
                </div>

                <Button variant="outline" className="bg-white/5 border-white/10 gap-2">
                  <Key className="w-4 h-4" />
                  Generate New API Key
                </Button>
              </div>
            </GlassCard>
          )}

          {/* Appearance Section */}
          {activeSection === "appearance" && (
            <GlassCard className="p-6">
              <h2 className="text-lg font-semibold text-white mb-6">Appearance</h2>

              <div className="space-y-6">
                <div>
                  <h3 className="text-white font-medium mb-4">Theme</h3>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { id: "dark", label: "Dark", active: true },
                      { id: "light", label: "Light", active: false },
                      { id: "system", label: "System", active: false },
                    ].map((theme) => (
                      <button
                        key={theme.id}
                        className={cn(
                          "p-4 rounded-lg border text-center transition-all",
                          theme.active
                            ? "bg-primary/10 border-primary/30"
                            : "bg-white/5 border-white/10 hover:border-white/20"
                        )}
                      >
                        <div
                          className={cn(
                            "w-12 h-8 rounded mx-auto mb-2",
                            theme.id === "dark"
                              ? "bg-[#0c0118]"
                              : theme.id === "light"
                              ? "bg-white"
                              : "bg-gradient-to-r from-[#0c0118] to-white"
                          )}
                        />
                        <span className="text-sm text-white">{theme.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <Separator className="bg-white/10" />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Compact Mode</p>
                    <p className="text-sm text-white/40">Reduce spacing for more content</p>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Animations</p>
                    <p className="text-sm text-white/40">Enable UI animations and transitions</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
}

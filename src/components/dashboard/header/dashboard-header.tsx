"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Bell,
  ChevronDown,
  Cloud,
  Plus,
  Settings,
  User,
  LogOut,
  Menu,
  Loader2,
} from "lucide-react";
import { LiveIndicator } from "@/components/dashboard/live-indicator";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface DashboardHeaderProps {
  onMenuClick: () => void;
  isSidebarCollapsed: boolean;
}

interface AwsAccount {
  id: string;
  name: string;
  accountId: string;
  lastScanAt: string | null;
}

export function DashboardHeader({ onMenuClick, isSidebarCollapsed }: DashboardHeaderProps) {
  const { data: session } = useSession();
  const [accounts, setAccounts] = useState<AwsAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<AwsAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [notifications] = useState(3);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const response = await fetch("/api/accounts");
        if (response.ok) {
          const data = await response.json();
          setAccounts(data.accounts || []);
          if (data.accounts && data.accounts.length > 0) {
            setSelectedAccount(data.accounts[0]);
          }
        }
      } catch (error) {
        console.error("Failed to fetch accounts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAccounts();
  }, []);

  const userInitials = session?.user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() || "U";

  const formatLastScan = (lastScanAt: string | null) => {
    if (!lastScanAt) return "Never";
    const date = new Date(lastScanAt);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 60) return `${diffMins} min ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${Math.floor(diffHours / 24)} days ago`;
  };

  return (
    <header
      className={cn(
        "fixed top-0 right-0 z-30 h-16 bg-background/80 backdrop-blur-md border-b border-border transition-all duration-300",
        isSidebarCollapsed ? "left-[70px]" : "left-[240px]"
      )}
    >
      <div className="h-full px-6 flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onMenuClick}
          >
            <Menu className="w-5 h-5" />
          </Button>

          {/* Account Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="h-10 px-4 bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 gap-2"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Cloud className="w-4 h-4 text-primary" />
                )}
                <span className="font-medium">
                  {selectedAccount?.name || "No accounts"}
                </span>
                {selectedAccount && (
                  <span className="text-xs text-white/40 hidden sm:inline">
                    ({selectedAccount.accountId})
                  </span>
                )}
                <ChevronDown className="w-4 h-4 text-white/40" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64">
              <DropdownMenuLabel>AWS Accounts</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {accounts.length === 0 ? (
                <DropdownMenuItem disabled className="text-white/40">
                  No accounts connected
                </DropdownMenuItem>
              ) : (
                accounts.map((account) => (
                  <DropdownMenuItem
                    key={account.id}
                    onClick={() => setSelectedAccount(account)}
                    className={cn(
                      "cursor-pointer",
                      selectedAccount?.id === account.id && "bg-primary/10"
                    )}
                  >
                    <Cloud className="w-4 h-4 mr-2 text-primary" />
                    <div className="flex flex-col">
                      <span className="font-medium">{account.name}</span>
                      <span className="text-xs text-white/40">{account.accountId}</span>
                    </div>
                  </DropdownMenuItem>
                ))
              )}
              <DropdownMenuSeparator />
              <Link href="/dashboard/accounts">
                <DropdownMenuItem className="cursor-pointer text-primary">
                  <Plus className="w-4 h-4 mr-2" />
                  Add AWS Account
                </DropdownMenuItem>
              </Link>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Live Status */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
            <LiveIndicator />
            <span className="text-xs text-white/50">
              Last scan: {selectedAccount ? formatLastScan(selectedAccount.lastScanAt) : "Never"}
            </span>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative hover:bg-white/10"
              >
                <Bell className="w-5 h-5" />
                {notifications > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                    {notifications}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel className="flex items-center justify-between">
                Notifications
                <Button variant="ghost" size="sm" className="text-xs text-primary">
                  Mark all read
                </Button>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-64 overflow-y-auto">
                <DropdownMenuItem className="flex flex-col items-start gap-1 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full" />
                    <span className="font-medium text-sm">Critical Finding</span>
                  </div>
                  <span className="text-xs text-white/50 pl-4">
                    Root account MFA not enabled
                  </span>
                  <span className="text-xs text-white/30 pl-4">5 min ago</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex flex-col items-start gap-1 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-orange-500 rounded-full" />
                    <span className="font-medium text-sm">Audit Completed</span>
                  </div>
                  <span className="text-xs text-white/50 pl-4">
                    the5ers-staging scan finished
                  </span>
                  <span className="text-xs text-white/30 pl-4">1 hour ago</span>
                </DropdownMenuItem>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="justify-center text-primary cursor-pointer">
                View all notifications
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-10 px-2 hover:bg-white/10 gap-2"
              >
                <Avatar className="w-8 h-8">
                  <AvatarImage src={session?.user?.image || undefined} />
                  <AvatarFallback className="bg-primary/20 text-primary text-sm">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:flex flex-col items-start">
                  <span className="text-sm font-medium">
                    {session?.user?.name || "User"}
                  </span>
                  <span className="text-xs text-white/40">
                    {session?.user?.email}
                  </span>
                </div>
                <ChevronDown className="w-4 h-4 text-white/40 hidden md:block" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer">
                <User className="w-4 h-4 mr-2" />
                Profile
              </DropdownMenuItem>
              <Link href="/dashboard/settings">
                <DropdownMenuItem className="cursor-pointer">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </DropdownMenuItem>
              </Link>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer text-red-400 focus:text-red-400"
                onClick={() => signOut({ callbackUrl: "/login" })}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

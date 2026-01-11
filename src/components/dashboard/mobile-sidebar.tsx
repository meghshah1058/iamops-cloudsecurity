"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Cloud,
  Shield,
  FileText,
  Settings,
  LogOut,
  HelpCircle,
} from "lucide-react";

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "AWS Accounts", href: "/dashboard/accounts", icon: Cloud },
  { title: "Audits", href: "/dashboard/audits", icon: Shield },
  { title: "Reports", href: "/dashboard/reports", icon: FileText },
  { title: "Settings", href: "/dashboard/settings", icon: Settings },
  { title: "Help", href: "/dashboard/help", icon: HelpCircle },
];

export function MobileSidebar({ isOpen, onClose }: MobileSidebarProps) {
  const pathname = usePathname();

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="left" className="w-[280px] bg-sidebar border-r border-sidebar-border p-0">
        <SheetHeader className="h-16 px-4 border-b border-sidebar-border flex flex-row items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <SheetTitle className="text-left">
            <span className="text-sm font-semibold text-white">AWS Security</span>
            <span className="block text-[10px] text-white/40 tracking-wider uppercase">
              Audit Dashboard
            </span>
          </SheetTitle>
        </SheetHeader>

        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                  isActive
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-sm font-medium">{item.title}</span>
              </Link>
            );
          })}

          <button
            onClick={() => {
              onClose();
              signOut({ callbackUrl: "/login" });
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-white/60 hover:text-red-400 hover:bg-red-500/10"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-medium">Sign Out</span>
          </button>
        </nav>
      </SheetContent>
    </Sheet>
  );
}

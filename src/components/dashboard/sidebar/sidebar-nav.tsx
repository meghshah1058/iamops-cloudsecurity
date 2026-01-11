"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Cloud,
  Shield,
  AlertTriangle,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  LogOut,
  HelpCircle,
  Server,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";
import { useState } from "react";

interface SidebarNavProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

// AWS Icon
function AwsIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M6.763 10.036c0 .296.032.535.088.71.064.176.144.368.256.576.04.063.056.127.056.183 0 .08-.048.16-.152.24l-.503.335a.383.383 0 0 1-.208.072c-.08 0-.16-.04-.239-.112a2.47 2.47 0 0 1-.287-.375 6.18 6.18 0 0 1-.248-.471c-.622.734-1.405 1.101-2.347 1.101-.67 0-1.205-.191-1.596-.574-.391-.384-.59-.894-.59-1.533 0-.678.239-1.23.726-1.644.487-.415 1.133-.623 1.955-.623.272 0 .551.024.846.064.296.04.6.104.918.176v-.583c0-.607-.127-1.03-.375-1.277-.255-.248-.686-.367-1.3-.367-.28 0-.568.031-.863.103-.295.072-.583.16-.862.272a2.287 2.287 0 0 1-.28.104.488.488 0 0 1-.127.023c-.112 0-.168-.08-.168-.247v-.391c0-.128.016-.224.056-.28a.597.597 0 0 1 .224-.167c.279-.144.614-.264 1.005-.36a4.84 4.84 0 0 1 1.246-.151c.95 0 1.644.216 2.091.647.439.43.662 1.085.662 1.963v2.586zm-3.24 1.214c.263 0 .534-.048.822-.144.287-.096.543-.271.758-.51.128-.152.224-.32.272-.512.047-.191.08-.423.08-.694v-.335a6.66 6.66 0 0 0-.735-.136 6.02 6.02 0 0 0-.75-.048c-.535 0-.926.104-1.19.32-.263.215-.39.518-.39.917 0 .375.095.655.295.846.191.2.47.296.838.296zm6.41.862c-.144 0-.24-.024-.304-.08-.064-.048-.12-.16-.168-.311L7.586 5.55a1.398 1.398 0 0 1-.072-.32c0-.128.064-.2.191-.2h.783c.151 0 .255.025.31.08.065.048.113.16.16.312l1.342 5.284 1.245-5.284c.04-.16.088-.264.151-.312a.549.549 0 0 1 .32-.08h.638c.152 0 .256.025.32.08.063.048.12.16.151.312l1.261 5.348 1.381-5.348c.048-.16.104-.264.16-.312a.52.52 0 0 1 .311-.08h.743c.127 0 .2.065.2.2 0 .04-.009.08-.017.128a1.137 1.137 0 0 1-.056.2l-1.923 6.17c-.048.16-.104.264-.168.312a.549.549 0 0 1-.32.08h-.687c-.151 0-.255-.024-.32-.08-.063-.056-.119-.16-.15-.32l-1.238-5.148-1.23 5.14c-.04.16-.087.264-.15.32-.065.056-.177.08-.32.08zm10.256.215c-.415 0-.83-.048-1.229-.143-.399-.096-.71-.2-.918-.32-.128-.071-.215-.151-.247-.223a.563.563 0 0 1-.048-.224v-.407c0-.167.064-.247.183-.247.048 0 .096.008.144.024.048.016.12.048.2.08.271.12.566.215.878.279.319.064.63.096.95.096.502 0 .894-.088 1.165-.264a.86.86 0 0 0 .415-.758.777.777 0 0 0-.215-.559c-.144-.151-.415-.287-.806-.407l-1.157-.36c-.583-.183-1.014-.454-1.277-.813a1.902 1.902 0 0 1-.4-1.158c0-.335.073-.63.216-.886.144-.255.335-.479.575-.654.24-.184.51-.32.83-.415.32-.096.655-.136 1.006-.136.175 0 .359.008.535.032.183.024.35.056.518.088.16.04.312.08.455.127.144.048.256.096.336.144a.69.69 0 0 1 .24.2.43.43 0 0 1 .071.263v.375c0 .168-.064.256-.184.256a.83.83 0 0 1-.303-.096 3.652 3.652 0 0 0-1.532-.311c-.455 0-.815.071-1.062.223-.248.152-.375.383-.375.71 0 .224.08.416.24.567.159.152.454.304.877.44l1.134.358c.574.184.99.44 1.237.767.247.327.367.702.367 1.117 0 .343-.072.655-.207.926-.144.272-.336.511-.583.703-.248.2-.543.343-.886.447-.36.111-.734.167-1.142.167z"/>
    </svg>
  );
}

// GCP Icon
function GcpIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12.19 2.38a9.344 9.344 0 0 0-9.234 6.893c.053-.02-.055.013 0 0-3.875 2.551-3.922 8.11-.247 10.941l.006-.007-.007.03a6.717 6.717 0 0 0 4.077 1.356h5.173l.03.03h5.192c6.687.053 9.376-8.605 3.835-12.35a9.365 9.365 0 0 0-8.825-6.893zM8.073 19.831a4.966 4.966 0 0 1-2.9-1.088l.006-.003a5.002 5.002 0 0 1 .004-7.47l.003.003.003-.003.006.007a5.006 5.006 0 0 1 7.471.003l-1.768 1.768a2.501 2.501 0 1 0 0 3.536l1.77 1.77a5.013 5.013 0 0 1-4.595 1.477zm11.034-5.012l-2.004-.001v2.004h-1.5v-2.004l-2.004-.001v-1.501h2.004V11.31h1.5v2.006l2.004-.001z"/>
    </svg>
  );
}

// Azure Icon
function AzureIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M5.483 21.3H24L14.025 4.013l-3.038 8.347 5.836 6.938L5.483 21.3zM13.23 2.7L6.105 8.677 0 19.253h5.505l7.725-16.553z"/>
    </svg>
  );
}

interface NavSection {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  items: {
    title: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
  }[];
}

const navSections: NavSection[] = [
  {
    title: "AWS",
    icon: AwsIcon,
    color: "text-orange-400",
    items: [
      {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
      },
      {
        title: "Accounts",
        href: "/dashboard/accounts",
        icon: Cloud,
      },
      {
        title: "Findings",
        href: "/dashboard/findings",
        icon: AlertTriangle,
      },
    ],
  },
  {
    title: "GCP",
    icon: GcpIcon,
    color: "text-blue-400",
    items: [
      {
        title: "Dashboard",
        href: "/dashboard/gcp",
        icon: LayoutDashboard,
      },
      {
        title: "Projects",
        href: "/dashboard/gcp/projects",
        icon: Server,
      },
      {
        title: "Findings",
        href: "/dashboard/gcp/findings",
        icon: AlertTriangle,
      },
    ],
  },
  {
    title: "Azure",
    icon: AzureIcon,
    color: "text-cyan-400",
    items: [
      {
        title: "Dashboard",
        href: "/dashboard/azure",
        icon: LayoutDashboard,
      },
      {
        title: "Subscriptions",
        href: "/dashboard/azure/subscriptions",
        icon: Server,
      },
      {
        title: "Findings",
        href: "/dashboard/azure/findings",
        icon: AlertTriangle,
      },
    ],
  },
];

const bottomNavItems = [
  {
    title: "Reports",
    href: "/dashboard/reports",
    icon: FileText,
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
  {
    title: "Help",
    href: "/dashboard/help",
    icon: HelpCircle,
  },
];

export function SidebarNav({ isCollapsed, onToggle }: SidebarNavProps) {
  const pathname = usePathname();
  const [expandedSections, setExpandedSections] = useState<string[]>(["AWS", "GCP", "Azure"]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const isSectionActive = (section: NavSection) => {
    return section.items.some(item =>
      pathname === item.href ||
      (item.href !== "/dashboard" && pathname.startsWith(item.href))
    );
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-in-out flex flex-col",
        isCollapsed ? "w-[70px]" : "w-[260px]"
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg border border-primary/20 flex-shrink-0">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col animate-fade-in">
              <span className="text-sm font-semibold text-white">Cloud Security</span>
              <span className="text-[10px] text-white/40 tracking-wider uppercase">
                Audit Dashboard
              </span>
            </div>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-4 overflow-y-auto scrollbar-hide">
        {navSections.map((section) => {
          const isExpanded = expandedSections.includes(section.title);
          const isActive = isSectionActive(section);
          const SectionIcon = section.icon;

          return (
            <div key={section.title} className="space-y-1">
              {/* Section Header */}
              <button
                onClick={() => !isCollapsed && toggleSection(section.title)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group",
                  isActive
                    ? "bg-white/5 text-white"
                    : "text-white/50 hover:text-white hover:bg-white/5",
                  isCollapsed && "justify-center px-2"
                )}
              >
                <SectionIcon
                  className={cn(
                    "w-5 h-5 flex-shrink-0 transition-all",
                    section.color,
                    "group-hover:scale-110"
                  )}
                />
                {!isCollapsed && (
                  <>
                    <span className="text-sm font-semibold flex-1 text-left">
                      {section.title}
                    </span>
                    <ChevronDown
                      className={cn(
                        "w-4 h-4 transition-transform duration-200",
                        isExpanded ? "rotate-0" : "-rotate-90"
                      )}
                    />
                  </>
                )}
              </button>

              {/* Section Items */}
              {!isCollapsed && isExpanded && (
                <div className="ml-4 pl-4 border-l border-white/10 space-y-1 animate-fade-in">
                  {section.items.map((item) => {
                    const isItemActive = pathname === item.href ||
                      (item.href !== "/dashboard" && pathname.startsWith(item.href));

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group",
                          isItemActive
                            ? "bg-primary/10 text-primary border border-primary/20"
                            : "text-white/60 hover:text-white hover:bg-white/5"
                        )}
                      >
                        <item.icon
                          className={cn(
                            "w-4 h-4 flex-shrink-0 transition-transform",
                            isItemActive ? "text-primary" : "group-hover:scale-110"
                          )}
                        />
                        <span className="text-sm">
                          {item.title}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              )}

              {/* Collapsed mode - show items as icons */}
              {isCollapsed && (
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const isItemActive = pathname === item.href ||
                      (item.href !== "/dashboard" && pathname.startsWith(item.href));

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "flex items-center justify-center py-2 rounded-lg transition-all duration-200 group",
                          isItemActive
                            ? "bg-primary/10 text-primary"
                            : "text-white/40 hover:text-white hover:bg-white/5"
                        )}
                        title={`${section.title} ${item.title}`}
                      >
                        <item.icon
                          className={cn(
                            "w-4 h-4 flex-shrink-0 transition-transform",
                            isItemActive ? "text-primary" : "group-hover:scale-110"
                          )}
                        />
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Bottom Navigation */}
      <div className="px-3 py-4 border-t border-sidebar-border space-y-1">
        {bottomNavItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
                isActive
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : "text-white/60 hover:text-white hover:bg-white/5",
                isCollapsed && "justify-center px-2"
              )}
            >
              <item.icon
                className={cn(
                  "w-5 h-5 flex-shrink-0 transition-transform",
                  isActive ? "text-primary" : "group-hover:scale-110"
                )}
              />
              {!isCollapsed && (
                <span className="text-sm font-medium animate-fade-in">
                  {item.title}
                </span>
              )}
            </Link>
          );
        })}

        {/* Sign Out */}
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group text-white/60 hover:text-red-400 hover:bg-red-500/10",
            isCollapsed && "justify-center px-2"
          )}
        >
          <LogOut className="w-5 h-5 flex-shrink-0 group-hover:scale-110 transition-transform" />
          {!isCollapsed && (
            <span className="text-sm font-medium animate-fade-in">Sign Out</span>
          )}
        </button>
      </div>

      {/* Collapse Toggle */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggle}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-sidebar border border-sidebar-border hover:bg-white/10 z-50"
      >
        {isCollapsed ? (
          <ChevronRight className="w-4 h-4" />
        ) : (
          <ChevronLeft className="w-4 h-4" />
        )}
      </Button>
    </aside>
  );
}

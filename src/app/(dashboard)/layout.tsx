"use client";

import { useState } from "react";
import { SidebarNav, DashboardHeader, MobileSidebar, AIAssistantButton } from "@/components/dashboard";
import { cn } from "@/lib/utils";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <SidebarNav
          isCollapsed={isSidebarCollapsed}
          onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
      </div>

      {/* Mobile Sidebar */}
      <MobileSidebar
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />

      {/* Header */}
      <DashboardHeader
        onMenuClick={() => setIsMobileSidebarOpen(true)}
        isSidebarCollapsed={isSidebarCollapsed}
      />

      {/* Main Content */}
      <main
        className={cn(
          "pt-16 min-h-screen transition-all duration-300",
          isSidebarCollapsed ? "lg:pl-[70px]" : "lg:pl-[240px]"
        )}
      >
        <div className="p-6">
          {children}
        </div>
      </main>

      {/* AI Assistant */}
      <AIAssistantButton />
    </div>
  );
}

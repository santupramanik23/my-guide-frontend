
import React from "react";
import Sidebar from "@/components/Layout/Sidebar";

/**
 * DashboardLayout
 * - Sticky top bar with optional search / bell
 * - Left sidebar (role-aware)
 * - Center container with optional right sidebar
 *
 * NEW props:
 * - sidebarExtra: ReactNode that is rendered inside Sidebar "extra" slot (e.g., small StatCards)
 * - rightSidebar: ReactNode rendered as right column next to main content
 */
export default function DashboardLayout({
  role = "traveller",
  title = "Dashboard",
  user,
  children,
  sidebarExtra = null,
  rightSidebar = null,
}) {

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Left sidebar with extra slot */}
      <Sidebar role={role} extra={sidebarExtra} />

      {/* Main */}
      <main className="flex-1">
        {/* Content */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          {rightSidebar ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">{children}</div>
              <div className="space-y-6">{rightSidebar}</div>
            </div>
          ) : (
            children
          )}
        </div>
      </main>
    </div>
  );
}

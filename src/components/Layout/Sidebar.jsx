

// src/components/Layout/Sidebar.jsx
import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Home, Menu, X, LogOut, Settings, Users, ClipboardList, Calendar,
  MapPin, DollarSign, BarChart3, CreditCard, Layers, Heart, 
  BookOpen, Star, MessageCircle, Shield, ChevronLeft, User, HelpCircle,
  Briefcase, TrendingUp, FileText, Package
} from "lucide-react";
import { useAuthStore } from "@/store/auth";

// Navigation configuration by role
const NAVIGATION_CONFIG = {
  traveller: {
    primary: [
      { to: "/dashboard/traveller", label: "Dashboard", icon: Home },
      { to: "/account/bookings", label: "My Bookings", icon: Calendar },
      { to: "/account/wishlist", label: "Wishlist", icon: Heart },
      { to: "/account/profile", label: "Profile", icon: User },
      { to: "/search", label: "Explore", icon: MapPin },
    ],
    secondary: [
      { to: "/account/reviews", label: "My Reviews", icon: Star },
      { to: "/account/payments", label: "Payment History", icon: CreditCard },
    ]
  },
  
  guide: {
    primary: [
      { to: "/dashboard/guide", label: "Dashboard", icon: Home },
      { to: "/guide/tours", label: "My Tours", icon: MapPin },
      { to: "/account/bookings", label: "Bookings", icon: Calendar },
      { to: "/guide/earnings", label: "Earnings", icon: DollarSign },
      { to: "/guide/reviews", label: "Reviews", icon: Star },
    ],
    secondary: [
      { to: "/account/profile", label: "Profile", icon: User },
      { to: "/guide/availability", label: "Availability", icon: ClipboardList },
      { to: "/guide/analytics", label: "Analytics", icon: BarChart3 },
    ]
  },

  instructor: {
    primary: [
      { to: "/dashboard/instructor", label: "Dashboard", icon: Home },
      { to: "/instructor/courses", label: "My Courses", icon: BookOpen },
      { to: "/instructor/students", label: "Students", icon: Users },
      { to: "/account/bookings", label: "Bookings", icon: Calendar },
      { to: "/instructor/earnings", label: "Earnings", icon: DollarSign },
    ],
    secondary: [
      { to: "/account/profile", label: "Profile", icon: User },
      { to: "/instructor/materials", label: "Materials", icon: Layers },
      { to: "/instructor/analytics", label: "Analytics", icon: BarChart3 },
    ]
  },

  advisor: {
    primary: [
      { to: "/dashboard/advisor", label: "Dashboard", icon: Home },
      { to: "/advisor/clients", label: "Clients", icon: Users },
      { to: "/advisor/itineraries", label: "Itineraries", icon: MapPin },
      { to: "/account/bookings", label: "Bookings", icon: Calendar },
      { to: "/advisor/reports", label: "Reports", icon: FileText },
    ],
    secondary: [
      { to: "/account/profile", label: "Profile", icon: User },
      { to: "/advisor/commissions", label: "Commissions", icon: DollarSign },
      { to: "/advisor/resources", label: "Resources", icon: Layers },
    ]
  },

  admin: {
    primary: [
      { to: "/dashboard/admin", label: "Dashboard", icon: Home },
      { to: "/admin/users", label: "Users", icon: Users },
      { to: "/admin/places", label: "Places", icon: MapPin },
      { to: "/admin/activities", label: "Activities", icon: Package },
      { to: "/admin/bookings", label: "All Bookings", icon: Calendar },
    ],
    secondary: [
      { to: "/account/profile", label: "Profile", icon: User },
      { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
      { to: "/admin/finances", label: "Finances", icon: DollarSign },
      { to: "/admin/settings", label: "System Settings", icon: Settings },
    ]
  }
};

const COMMON_ACTIONS = [
  { to: "/settings", label: "Settings", icon: Settings },
  { to: "/help", label: "Help & Support", icon: HelpCircle },
];

export default function Sidebar({ 
  role = "traveller", 
  variant = "light",
  className = "",
  extra = null,
  defaultCollapsed = false
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem("sidebar-collapsed");
    return saved ? JSON.parse(saved) : defaultCollapsed;
  });

  // Save collapsed state to localStorage
  useEffect(() => {
    localStorage.setItem("sidebar-collapsed", JSON.stringify(isCollapsed));
  }, [isCollapsed]);

  // Close mobile sidebar when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Get navigation items for current role
  const navigationItems = NAVIGATION_CONFIG[role] || NAVIGATION_CONFIG.traveller;

  // Base classes with sticky positioning
  const sidebarClasses = `
    ${isCollapsed ? "w-20" : "w-64"} 
    ${variant === "dark" 
      ? "bg-gray-900 text-gray-200 border-r border-gray-800" 
      : "bg-white text-gray-800 border-r border-gray-200 shadow-sm"
    }
    transition-all duration-300 ease-in-out
    ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
    md:sticky md:top-0 md:h-screen md:z-10
    fixed inset-y-0 left-0 z-40 md:translate-x-0
    ${className}
  `.trim();

  const linkClasses = (isActive) => `
    flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200
    ${isCollapsed ? "justify-center" : ""}
    ${isActive
      ? "bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300 shadow-sm"
      : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
    }
  `.trim();

  // Render navigation group
  const renderNavigationGroup = (title, items, showTitle = true) => (
    <div className="space-y-1">
      {!isCollapsed && showTitle && (
        <div className="text-xs uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-3 px-3 font-semibold">
          {title}
        </div>
      )}
      {items.map(({ to, label, icon: Icon }) => {
        const isActive = location.pathname === to || location.pathname.startsWith(`${to}/`);
        return (
          <Link
            key={to}
            to={to}
            className={linkClasses(isActive)}
            onClick={() => setIsOpen(false)}
            title={isCollapsed ? label : undefined}
          >
            <Icon className="h-5 w-5 flex-shrink-0" />
            {!isCollapsed && <span className="font-medium">{label}</span>}
            {isActive && !isCollapsed && (
              <div className="ml-auto w-2 h-2 bg-primary-500 rounded-full" />
            )}
          </Link>
        );
      })}
    </div>
  );

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 bg-primary-600 hover:bg-primary-700 text-white p-2.5 rounded-lg shadow-lg transition-colors"
        aria-label="Toggle sidebar"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Sidebar */}
      <aside className={sidebarClasses}>
        
        {/* Header with Logo and Collapse Toggle */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-800">
          <Link 
            to="/"
            className={`group flex items-center gap-3 font-bold text-lg hover:opacity-80 transition-opacity ${
              isCollapsed ? "justify-center" : ""
            }`}
            title="Go to homepage"
            aria-label="Go to homepage"
          >
            <img
              src="/images/LOGO2.png"   
              alt="TourGuide Logo"
              className="w-10 h-auto group-hover:scale-105 transition-transform"
              onError={(e) => { e.currentTarget.src = "/default-logo.png"; }}
            />
            {!isCollapsed && (
              <span className="text-gray-900 dark:text-white">MyGuide</span>
            )}
          </Link>

          {/* Desktop collapse toggle */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsCollapsed(!isCollapsed);
            }}
            className="hidden md:flex items-center justify-center w-8 h-8 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <ChevronLeft
              className={`h-4 w-4 transition-transform ${isCollapsed ? "rotate-180" : ""}`}
            />
          </button>
        </div>

        {/* Scrollable content area */}
        <div className="flex flex-col h-[calc(100vh-64px)]">
          
          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
            {/* Primary navigation */}
            {renderNavigationGroup("Main", navigationItems.primary)}
            
            {/* Secondary navigation */}
            {navigationItems.secondary && navigationItems.secondary.length > 0 && (
              <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                {renderNavigationGroup("Quick Access", navigationItems.secondary)}
              </div>
            )}

            {/* Extra widgets */}
            {extra && (
              <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                {!isCollapsed && (
                  <div className="text-xs uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-3 px-3 font-semibold">
                    Widgets
                  </div>
                )}
                <div className={isCollapsed ? "space-y-2" : ""}>
                  {extra}
                </div>
              </div>
            )}

            {/* Common actions */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
              {renderNavigationGroup("Support", COMMON_ACTIONS, false)}
            </div>
          </nav>

          {/* Footer - Fixed at bottom */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-800 space-y-3">
            
            {/* User info - Clickable to Profile */}
            {user && (
              <Link
                to="/account/profile"
                className={`flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                  isCollapsed ? "justify-center" : ""
                }`}
                title={isCollapsed ? "View Profile" : undefined}
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                  {user.name?.charAt(0)?.toUpperCase() || "U"}
                </div>
                {!isCollapsed && (
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {user.name || "User"}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                      {user.role || role}
                    </div>
                  </div>
                )}
              </Link>
            )}

            {/* Logout button */}
            <button
              onClick={handleLogout}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors ${
                isCollapsed ? "justify-center" : ""
              }`}
              title={isCollapsed ? "Sign Out" : undefined}
            >
              <LogOut className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && <span className="font-medium">Sign Out</span>}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
import React, { Suspense } from "react";
import { Outlet, useLocation } from "react-router-dom";
import ProfessionalHeader from "./ProfessionalHeader";
import ProfessionalFooter from "./ProfessionalFooter";

// Loading component for Suspense fallback
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    </div>
  );
}

// Error boundary component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Layout Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900 px-4">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Something went wrong
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              We're sorry, but something unexpected happened. Please try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Main layout component that wraps all public pages
 * Provides the common shell with header and footer
 */
export default function Layout({ 
  showHeader = true, 
  showFooter = true,
  className = "" 
}) {
  const location = useLocation();
  
  // Determine if we should show footer based on route
  const shouldShowFooter = showFooter && !location.pathname.startsWith('/dashboard');
  
  return (
    <ErrorBoundary>
      <div className={`public-shell min-h-screen flex flex-col ${className}`}>
        
        {/* Header */}
        {showHeader && <ProfessionalHeader />}
        
        {/* Main Content */}
        <main className="flex-1" role="main">
          <Suspense fallback={<PageLoader />}>
            {/* Nested routes render here */}
            <Outlet />
          </Suspense>
        </main>
        
        {/* Footer */}
        {shouldShowFooter && <ProfessionalFooter />}
      </div>
    </ErrorBoundary>
  );
}

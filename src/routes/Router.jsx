
// src/Router.jsx
import { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from "react-router-dom";
import { Toaster } from "react-hot-toast";

// Layout and auth (always needed, keep eager)
import Layout from "@/components/Layout/Layout";
import { useAuthStore } from '@/store/auth';

/* ---------- Route guards (always needed, keep eager) ---------- */
import ProtectedRoute from "./ProtectedRoute";
import RoleGate from "./RoleGate";

/* ---------- Public pages ---------- */
const Home = lazy(() => import("@/pages/public/Home"));
const Search = lazy(() => import("@/pages/public/Search"));
const PlaceDetail = lazy(() => import("@/pages/public/PlaceDetail"));
const ActivityDetail = lazy(() => import("@/pages/public/ActivityDetail"));

/* ---------- Auth ---------- */
const Login = lazy(() => import("@/pages/auth/Login"));
const Signup = lazy(() => import("@/pages/auth/Signup"));

/* ---------- Booking ---------- */
const BookingFlow = lazy(() => import("@/pages/booking/BookingFlow"));
const BookingConfirm = lazy(() => import("@/pages/booking/BookingConfirm"));

/* ---------- Settings & Help ---------- */
const Settings = lazy(() => import("@/pages/settings/Settings"));
const Help = lazy(() => import("@/pages/help/Help"));

/* ---------- Account pages ---------- */
const MyBookings = lazy(() => import("@/pages/account/MyBookings"));
const Wishlist = lazy(() => import("@/pages/account/Wishlist"));
const Profile = lazy(() => import("@/pages/account/Profile"));
const MyReviews = lazy(() => import("@/pages/account/MyReviews"));
const PaymentHistory = lazy(() => import("@/pages/account/PaymentHistory"));

/* ---------- Dashboards ---------- */
const TravellerDashboard = lazy(() => import("@/pages/dashboards/TravellerDashboard"));
const GuideDashboard = lazy(() => import("@/pages/dashboards/GuideDashboard"));
const InstructorDashboard = lazy(() => import("@/pages/dashboards/InstructorDashboard"));
const AdvisorDashboard = lazy(() => import("@/pages/dashboards/AdvisorDashboard"));
const AdminDashboard = lazy(() => import("@/pages/admin/AdminDashboard"));

/* ---------- Admin CRUD ---------- */
const PlaceList = lazy(() => import("@/pages/admin/PlaceList"));
const PlaceCreate = lazy(() => import("@/pages/admin/PlaceCreate"));
const ActivityList = lazy(() => import("@/pages/admin/ActivityList"));
const ActivityCreate = lazy(() => import("@/pages/admin/ActivityCreate"));
const UsersList = lazy(() => import("@/pages/admin/UsersList"));

/* ---------- Page fallback ---------- */
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
    </div>
  );
}

/* ---------- Auth-aware components ---------- */
const DashboardRedirect = () => {
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated || !user) {
    return <Navigate to="/auth/login" replace />;
  }

  const rolePaths = {
    admin: "/dashboard/admin",
    advisor: "/dashboard/advisor",
    guide: "/dashboard/guide",
    instructor: "/dashboard/instructor",
    traveller: "/dashboard/traveller"
  };

  const redirectPath = rolePaths[user.role] || "/dashboard/traveller";
  return <Navigate to={redirectPath} replace />;
};

// Public route wrapper that redirects authenticated users
const PublicRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (isAuthenticated && user) {
    const rolePaths = {
      admin: "/dashboard/admin",
      advisor: "/dashboard/advisor",
      guide: "/dashboard/guide",
      instructor: "/dashboard/instructor",
      traveller: "/dashboard/traveller"
    };

    const redirectPath = rolePaths[user.role] || "/";
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

// Placeholder component for routes not yet implemented
const ComingSoon = ({ title = "Coming Soon" }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
    <div className="text-center">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
        {title}
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        This feature is under development
      </p>
      <Link
        to="/"
        className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
      >
        Go back home
      </Link>
    </div>
  </div>
);

export default function Router() {
  const initialize = useAuthStore((state) => state.initialize);

  // Initialize auth state when app starts
  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* ---------- Public shell ---------- */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="search" element={<Search />} />
          <Route path="places/:id" element={<PlaceDetail />} />
          <Route path="activities/:id" element={<ActivityDetail />} />
          
          {/* Public booking flow - users can browse before login */}
          <Route path="booking" element={<BookingFlow />} />
        </Route>

        {/* ---------- Auth (redirect authenticated users) ---------- */}
        <Route
          path="/auth/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/auth/signup"
          element={
            <PublicRoute>
              <Signup />
            </PublicRoute>
          }
        />

        {/* ---------- Account pages (protected, all roles) ---------- */}
        <Route path="/account" element={<ProtectedRoute />}>
          <Route path="bookings" element={<MyBookings />} />
          <Route path="wishlist" element={<Wishlist />} />
          <Route path="profile" element={<Profile />} />
          <Route path="reviews" element={<MyReviews />} />
          <Route path="payments" element={<PaymentHistory />} />
        </Route>

        {/* ---------- Booking confirmation (protected) ---------- */}
        <Route path="/booking/confirm" element={<ProtectedRoute />}>
          <Route index element={<BookingConfirm />} />
        </Route>

        {/* ---------- Dashboards (protected) ---------- */}
        <Route path="/dashboard" element={<ProtectedRoute />}>
          <Route index element={<DashboardRedirect />} />
          
          <Route
            path="traveller"
            element={
              <RoleGate allowedRoles={["traveller"]}>
                <TravellerDashboard />
              </RoleGate>
            }
          />
          <Route
            path="guide"
            element={
              <RoleGate allowedRoles={["guide"]}>
                <GuideDashboard />
              </RoleGate>
            }
          />
          <Route
            path="instructor"
            element={
              <RoleGate allowedRoles={["instructor"]}>
                <InstructorDashboard />
              </RoleGate>
            }
          />
          <Route
            path="advisor"
            element={
              <RoleGate allowedRoles={["advisor"]}>
                <AdvisorDashboard />
              </RoleGate>
            }
          />
          <Route
            path="admin"
            element={
              <RoleGate allowedRoles={["admin"]}>
                <AdminDashboard />
              </RoleGate>
            }
          />
        </Route>

        {/* ---------- Guide-specific routes ---------- */}
        <Route path="/guide" element={<ProtectedRoute />}>
          <Route 
            path="tours" 
            element={
              <RoleGate allowedRoles={["guide"]}>
                <ComingSoon title="My Tours" />
              </RoleGate>
            } 
          />
          <Route 
            path="earnings" 
            element={
              <RoleGate allowedRoles={["guide"]}>
                <ComingSoon title="Earnings" />
              </RoleGate>
            } 
          />
          <Route 
            path="reviews" 
            element={
              <RoleGate allowedRoles={["guide"]}>
                <ComingSoon title="Reviews" />
              </RoleGate>
            } 
          />
          <Route 
            path="availability" 
            element={
              <RoleGate allowedRoles={["guide"]}>
                <ComingSoon title="Availability" />
              </RoleGate>
            } 
          />
          <Route 
            path="analytics" 
            element={
              <RoleGate allowedRoles={["guide"]}>
                <ComingSoon title="Analytics" />
              </RoleGate>
            } 
          />
        </Route>

        {/* ---------- Instructor-specific routes ---------- */}
        <Route path="/instructor" element={<ProtectedRoute />}>
          <Route 
            path="courses" 
            element={
              <RoleGate allowedRoles={["instructor"]}>
                <ComingSoon title="My Courses" />
              </RoleGate>
            } 
          />
          <Route 
            path="students" 
            element={
              <RoleGate allowedRoles={["instructor"]}>
                <ComingSoon title="Students" />
              </RoleGate>
            } 
          />
          <Route 
            path="earnings" 
            element={
              <RoleGate allowedRoles={["instructor"]}>
                <ComingSoon title="Earnings" />
              </RoleGate>
            } 
          />
          <Route 
            path="materials" 
            element={
              <RoleGate allowedRoles={["instructor"]}>
                <ComingSoon title="Materials" />
              </RoleGate>
            } 
          />
          <Route 
            path="analytics" 
            element={
              <RoleGate allowedRoles={["instructor"]}>
                <ComingSoon title="Analytics" />
              </RoleGate>
            } 
          />
        </Route>

        {/* ---------- Advisor-specific routes ---------- */}
        <Route path="/advisor" element={<ProtectedRoute />}>
          <Route 
            path="clients" 
            element={
              <RoleGate allowedRoles={["advisor"]}>
                <ComingSoon title="Clients" />
              </RoleGate>
            } 
          />
          <Route 
            path="itineraries" 
            element={
              <RoleGate allowedRoles={["advisor"]}>
                <ComingSoon title="Itineraries" />
              </RoleGate>
            } 
          />
          <Route 
            path="reports" 
            element={
              <RoleGate allowedRoles={["advisor"]}>
                <ComingSoon title="Reports" />
              </RoleGate>
            } 
          />
          <Route 
            path="commissions" 
            element={
              <RoleGate allowedRoles={["advisor"]}>
                <ComingSoon title="Commissions" />
              </RoleGate>
            } 
          />
          <Route 
            path="resources" 
            element={
              <RoleGate allowedRoles={["advisor"]}>
                <ComingSoon title="Resources" />
              </RoleGate>
            } 
          />
        </Route>

        {/* ---------- Admin CRUD (protected) ---------- */}
        <Route path="/admin" element={<ProtectedRoute />}>
          <Route
            path="places"
            element={
              <RoleGate allowedRoles={["admin", "guide", "advisor"]}>
                <PlaceList />
              </RoleGate>
            }
          />
          <Route
            path="places/new"
            element={
              <RoleGate allowedRoles={["admin"]}>
                <PlaceCreate />
              </RoleGate>
            }
          />
          <Route
            path="activities"
            element={
              <RoleGate allowedRoles={["admin", "instructor", "advisor"]}>
                <ActivityList />
              </RoleGate>
            }
          />
          <Route
            path="activities/new"
            element={
              <RoleGate allowedRoles={["admin"]}>
                <ActivityCreate />
              </RoleGate>
            }
          />
          <Route
            path="users"
            element={
              <RoleGate allowedRoles={["admin"]}>
                <UsersList />
              </RoleGate>
            }
          />
          <Route
            path="bookings"
            element={
              <RoleGate allowedRoles={["admin"]}>
                <ComingSoon title="All Bookings" />
              </RoleGate>
            }
          />
          <Route
            path="analytics"
            element={
              <RoleGate allowedRoles={["admin"]}>
                <ComingSoon title="Analytics" />
              </RoleGate>
            }
          />
          <Route
            path="finances"
            element={
              <RoleGate allowedRoles={["admin"]}>
                <ComingSoon title="Finances" />
              </RoleGate>
            }
          />
          <Route
            path="settings"
            element={
              <RoleGate allowedRoles={["admin"]}>
                <ComingSoon title="System Settings" />
              </RoleGate>
            }
          />
        </Route>

        {/* ---------- Common routes ---------- */}
        <Route path="/settings" element={<ProtectedRoute />}>
          <Route index element={<Settings />} />
        </Route>

        <Route path="/help" element={<Help />} />

        {/* ---------- 404 ---------- */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      </Suspense>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: { background: "#363636", color: "#fff" },
          success: { duration: 3000, theme: { primary: "#4aed88" } },
        }}
      />
    </BrowserRouter>
  );
}

function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <h1 className="text-9xl font-bold text-gray-200 dark:text-gray-700">404</h1>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Page not found</h2>
        <p className="text-gray-600 dark:text-gray-400">The page you're looking for doesn't exist.</p>
        <Link
          to="/"
          className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
        >
          Go back home
        </Link>
      </div>
    </div>
  );
}
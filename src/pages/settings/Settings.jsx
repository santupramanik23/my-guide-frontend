// src/pages/settings/Settings.jsx
import React, { useState, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Sun,
  Moon,
  Monitor,
  Globe,
  Bell,
  CheckCheck,
  BellRing,
  CalendarClock,
  Star,
  Newspaper,
  Eye,
  MapPin,
  Mail,
  Download,
  Trash2,
  Layers,
  User,
  Lock,
  ChevronRight,
  Sliders,
  ShieldCheck,
} from "lucide-react";
import DashboardLayout from "@/components/Layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useAuthStore } from "@/store/auth";
import { useTheme } from "@/hooks/useTheme";

/* ─── Tabs (no Profile or Security — those live in /account/profile) ─────── */
const TABS = [
  { id: "preferences",   label: "Preferences",   icon: Sliders },
  { id: "notifications", label: "Notifications",  icon: Bell },
  { id: "privacy",       label: "Privacy",        icon: ShieldCheck },
  { id: "account",       label: "Account",        icon: User },
];

/* ─── Helpers ─────────────────────────────────────────────────────────────── */
function getLocalJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

/* ─── Toggle Switch ───────────────────────────────────────────────────────── */
const Toggle = React.memo(function Toggle({ checked, onChange, id }) {
  return (
    <button
      id={id}
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={[
        "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent",
        "transition-colors duration-200 ease-in-out",
        "focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900",
        checked ? "bg-violet-600" : "bg-gray-200 dark:bg-gray-700",
      ].join(" ")}
    >
      <span
        aria-hidden="true"
        className={[
          "pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0",
          "transition-transform duration-200 ease-in-out",
          checked ? "translate-x-5" : "translate-x-0",
        ].join(" ")}
      />
    </button>
  );
});

/* ─── Preferences Tab ─────────────────────────────────────────────────────── */
const THEME_OPTIONS = [
  { mode: "light",  label: "Light",  icon: Sun,     desc: "Clean, bright interface" },
  { mode: "dark",   label: "Dark",   icon: Moon,    desc: "Easy on the eyes" },
  { mode: "system", label: "System", icon: Monitor, desc: "Follows OS preference" },
];

function PreferencesTab() {
  const { themeMode, setTheme } = useTheme();
  const [density, setDensity] = useState(
    () => localStorage.getItem("dash-density") || "comfortable"
  );

  const handleDensity = useCallback((val) => {
    setDensity(val);
    localStorage.setItem("dash-density", val);
    toast.success(`Dashboard set to ${val} mode.`);
  }, []);

  return (
    <div className="space-y-6">
      {/* Theme */}
      <Card variant="outlined">
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Choose how MyGuide looks for you across all devices.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {THEME_OPTIONS.map(({ mode, label, icon: Icon, desc }) => {
              const active = themeMode === mode;
              return (
                <button
                  key={mode}
                  onClick={() => setTheme(mode)}
                  className={[
                    "relative flex flex-col items-center gap-3 p-5 rounded-xl border-2 transition-all text-center",
                    active
                      ? "border-violet-500 bg-violet-50 dark:bg-violet-900/20"
                      : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-violet-300 dark:hover:border-violet-700",
                  ].join(" ")}
                  aria-pressed={active}
                >
                  {active && (
                    <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 rounded-full bg-violet-500" />
                  )}
                  <Icon className={`h-7 w-7 ${active ? "text-violet-600 dark:text-violet-400" : "text-gray-500 dark:text-gray-400"}`} />
                  <div>
                    <p className={`font-semibold text-sm ${active ? "text-violet-700 dark:text-violet-300" : "text-gray-900 dark:text-white"}`}>
                      {label}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Language */}
      <Card variant="outlined">
        <CardHeader>
          <CardTitle>Language & Region</CardTitle>
          <CardDescription>Select your preferred interface language.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 max-w-sm">
            <Globe className="h-5 w-5 text-gray-400 flex-shrink-0" />
            <select
              defaultValue="en"
              className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 transition text-sm"
            >
              <option value="en">English (Default)</option>
              <option value="hi" disabled>Hindi — coming soon</option>
              <option value="bn" disabled>Bengali — coming soon</option>
              <option value="fr" disabled>French — coming soon</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Dashboard Density */}
      <Card variant="outlined">
        <CardHeader>
          <CardTitle>Dashboard Density</CardTitle>
          <CardDescription>Control how much information is shown at once on your dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 max-w-xs">
            {["compact", "comfortable"].map((val) => (
              <button
                key={val}
                onClick={() => handleDensity(val)}
                aria-pressed={density === val}
                className={[
                  "flex-1 py-2.5 px-4 rounded-lg border-2 text-sm font-medium capitalize transition-all",
                  density === val
                    ? "border-violet-500 bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300"
                    : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-violet-300",
                ].join(" ")}
              >
                {val}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ─── Notifications Tab ───────────────────────────────────────────────────── */
const NOTIF_DEFAULTS = {
  bookingConfirmations: true,
  tripReminders: true,
  newActivityAlerts: false,
  reviewRequests: true,
  weeklyDigest: false,
};

const NOTIF_META = [
  {
    key: "bookingConfirmations",
    label: "Booking Confirmations",
    desc: "Get notified when your bookings are confirmed, updated, or cancelled.",
    icon: CheckCheck,
    color: "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400",
  },
  {
    key: "tripReminders",
    label: "Trip Reminders",
    desc: "Receive a reminder 24 hours before each upcoming trip.",
    icon: CalendarClock,
    color: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
  },
  {
    key: "newActivityAlerts",
    label: "New Activity Alerts",
    desc: "Be the first to know when new activities are added in your saved destinations.",
    icon: BellRing,
    color: "bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400",
  },
  {
    key: "reviewRequests",
    label: "Review Requests",
    desc: "We'll prompt you to share feedback after completing a trip.",
    icon: Star,
    color: "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400",
  },
  {
    key: "weeklyDigest",
    label: "Weekly Digest",
    desc: "A curated summary of trending destinations and deals every Monday.",
    icon: Newspaper,
    color: "bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400",
  },
];

function NotificationsTab() {
  const [prefs, setPrefs] = useState(() => getLocalJSON("notif-prefs", NOTIF_DEFAULTS));

  const handleToggle = useCallback((key) => {
    setPrefs((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      localStorage.setItem("notif-prefs", JSON.stringify(next));
      return next;
    });
  }, []);

  return (
    <div className="space-y-4">
      <Card variant="outlined">
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
          <CardDescription>Choose which notifications MyGuide sends to you. Changes are saved instantly.</CardDescription>
        </CardHeader>
        <CardContent className="divide-y divide-gray-100 dark:divide-gray-800">
          {NOTIF_META.map(({ key, label, desc, icon: Icon, color }) => (
            <div key={key} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{label}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">{desc}</p>
              </div>
              <Toggle
                id={`notif-${key}`}
                checked={prefs[key]}
                onChange={() => handleToggle(key)}
              />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

/* ─── Privacy Tab ─────────────────────────────────────────────────────────── */
const PRIVACY_DEFAULTS = {
  profileVisible: true,
  shareActivityHistory: true,
  locationTracking: false,
  marketingEmails: false,
};

const PRIVACY_META = [
  {
    key: "profileVisible",
    label: "Public profile",
    desc: "Allow other MyGuide users to discover and view your profile.",
    icon: Eye,
    color: "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400",
  },
  {
    key: "shareActivityHistory",
    label: "Share activity history with guides",
    desc: "Guides can see your past activities to personalise their recommendations.",
    icon: Layers,
    color: "bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400",
  },
  {
    key: "locationTracking",
    label: "Location-based suggestions",
    desc: "Enable location services to see activities near you.",
    icon: MapPin,
    color: "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400",
  },
  {
    key: "marketingEmails",
    label: "Marketing & promotional emails",
    desc: "Receive curated travel deals, destination spotlights, and special offers.",
    icon: Mail,
    color: "bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400",
  },
];

function PrivacyTab() {
  const [prefs, setPrefs] = useState(() => getLocalJSON("privacy-prefs", PRIVACY_DEFAULTS));

  const handleToggle = useCallback((key) => {
    setPrefs((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      localStorage.setItem("privacy-prefs", JSON.stringify(next));
      return next;
    });
  }, []);

  const handleDownload = useCallback(() => {
    toast("Data export coming soon.", { icon: "📦" });
  }, []);

  return (
    <div className="space-y-6">
      <Card variant="outlined">
        <CardHeader>
          <CardTitle>Privacy Controls</CardTitle>
          <CardDescription>Manage how your data is used and shared within MyGuide. Changes save instantly.</CardDescription>
        </CardHeader>
        <CardContent className="divide-y divide-gray-100 dark:divide-gray-800">
          {PRIVACY_META.map(({ key, label, desc, icon: Icon, color }) => (
            <div key={key} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{label}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">{desc}</p>
              </div>
              <Toggle
                id={`privacy-${key}`}
                checked={prefs[key]}
                onChange={() => handleToggle(key)}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Data export */}
      <Card variant="outlined">
        <CardHeader>
          <CardTitle>Your Data</CardTitle>
          <CardDescription>Download a complete copy of all personal data MyGuide holds about you (GDPR).</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download My Data
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

/* ─── Account Tab ─────────────────────────────────────────────────────────── */
function AccountTab({ user }) {
  const { logout } = useAuthStore();

  const handleDeleteAccount = useCallback(() => {
    const confirmed = window.confirm(
      "Are you absolutely sure? This is irreversible and will permanently delete your account, bookings, and all personal data."
    );
    if (confirmed) {
      toast.error("Account deletion requires contacting support@myguide.com.");
    }
  }, []);

  const initial = (user?.name || "U").charAt(0).toUpperCase();

  return (
    <div className="space-y-6">
      {/* Profile quick-link */}
      <Card variant="outlined">
        <CardHeader>
          <CardTitle>Profile & Security</CardTitle>
          <CardDescription>
            Your personal information, avatar, and password are managed on your Profile page.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Link
            to="/account/profile"
            className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-violet-300 dark:hover:border-violet-700 hover:bg-violet-50/50 dark:hover:bg-violet-900/10 transition-all group"
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
              {initial}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 dark:text-white">{user?.name || "Your Name"}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-violet-600 dark:text-violet-400 font-medium group-hover:gap-3 transition-all">
              Edit Profile
              <ChevronRight className="h-4 w-4" />
            </div>
          </Link>

          <Link
            to="/account/profile"
            className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-violet-300 dark:hover:border-violet-700 hover:bg-violet-50/50 dark:hover:bg-violet-900/10 transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
              <Lock className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900 dark:text-white">Change Password</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Update your login credentials</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-violet-600 dark:text-violet-400 font-medium group-hover:gap-3 transition-all">
              Go to Profile
              <ChevronRight className="h-4 w-4" />
            </div>
          </Link>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card variant="outlined">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-red-500" />
            <span className="text-red-600 dark:text-red-400">Danger Zone</span>
          </CardTitle>
          <CardDescription>Irreversible actions. Proceed with extreme caution.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/10">
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">Delete My Account</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Permanently removes your account, all bookings, reviews, and personal data.
              </p>
            </div>
            <Button variant="danger" onClick={handleDeleteAccount} className="flex-shrink-0">
              <Trash2 className="h-4 w-4 mr-1.5" />
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ─── Settings Page ───────────────────────────────────────────────────────── */
export default function Settings() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState("preferences");

  const handleTabChange = useCallback((id) => setActiveTab(id), []);

  const renderTab = () => {
    switch (activeTab) {
      case "preferences":   return <PreferencesTab />;
      case "notifications": return <NotificationsTab />;
      case "privacy":       return <PrivacyTab />;
      case "account":       return <AccountTab user={user} />;
      default:              return null;
    }
  };

  return (
    <DashboardLayout role={user?.role || "traveller"} title="Settings" user={user}>
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Manage your app preferences, notifications, and privacy.
        </p>
      </div>

      {/* Tab bar */}
      <div className="mb-6 border-b border-gray-200 dark:border-gray-800">
        <nav className="-mb-px flex gap-1 overflow-x-auto pb-px">
          {TABS.map(({ id, label, icon: Icon }) => {
            const active = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => handleTabChange(id)}
                className={[
                  "inline-flex items-center gap-2 whitespace-nowrap px-4 py-2.5 text-sm font-medium",
                  "border-b-2 rounded-t-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500",
                  active
                    ? "border-violet-600 text-violet-700 dark:text-violet-400"
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600",
                ].join(" ")}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      <div className="max-w-2xl">
        {renderTab()}
      </div>
    </DashboardLayout>
  );
}

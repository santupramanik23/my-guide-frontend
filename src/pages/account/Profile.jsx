
// // src/pages/account/Profile.jsx
// import React, { useEffect, useMemo, useRef, useState } from "react";
// import { Link } from "react-router-dom";
// import DashboardLayout from "@/components/Layout/DashboardLayout";
// import { Card, CardContent } from "@/components/ui/Card";
// import Button from "@/components/ui/Button";
// import toast from "react-hot-toast";
// import { api, useAuthStore } from "@/store/auth";
// import { 
//   User, 
//   Mail, 
//   Camera, 
//   Save, 
//   Loader2, 
//   Lock, 
//   KeyRound, 
//   LogOut,
//   Shield,
//   Calendar,
//   MapPin,
//   Award,
//   CheckCircle,
//   Settings
// } from "lucide-react";

// async function getMe() {
//   const { data } = await api.get("/users/me");
//   return data?.data?.user || data?.data || data?.user || data;
// }
// async function updateMe(payload) {
//   const { data } = await api.put("/users/me", payload);
//   return data?.data?.user || data?.data || data?.user || data;
// }
// async function changePassword(payload) {
//   const { data } = await api.patch("/users/me/password", payload);
//   return data;
// }
// async function uploadAvatar(file) {
//   const fd = new FormData();
//   fd.append("avatar", file);
//   const { data } = await api.post("/users/me/avatar", fd, {
//     headers: { "Content-Type": "multipart/form-data" },
//   });
//   return data?.data?.user || data?.data || data?.user || data;
// }

// export default function Profile() {
//   const { user: authUser, logout } = useAuthStore();
//   const setUserInStore = useAuthStore?.getState?.().setUser;
//   const [me, setMe] = useState({ 
//     name: authUser?.name || "", 
//     email: authUser?.email || "", 
//     avatarUrl: authUser?.avatarUrl || "" 
//   });
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [pwSaving, setPwSaving] = useState(false);
//   const [pw, setPw] = useState({ currentPassword: "", newPassword: "" });
//   const fileInputRef = useRef(null);
//   const avatarPreview = useMemo(() => me.avatarUrl, [me.avatarUrl]);

//   useEffect(() => {
//     (async () => {
//       try {
//         setLoading(true);
//         const u = await getMe();
//         setMe({ 
//           name: u?.name || "", 
//           email: u?.email || "", 
//           avatarUrl: u?.avatarUrl || "" 
//         });
//       } catch {
//         toast.error("Failed to load profile");
//       } finally {
//         setLoading(false);
//       }
//     })();
//   }, []);

//   const onSave = async (e) => {
//     e.preventDefault();
//     setSaving(true);
//     try {
//       const updated = await updateMe({ name: me.name, avatarUrl: me.avatarUrl });
//       setMe((p) => ({ 
//         ...p, 
//         name: updated?.name || p.name, 
//         avatarUrl: updated?.avatarUrl || p.avatarUrl 
//       }));
//       setUserInStore?.({ 
//         ...(authUser || {}), 
//         name: updated?.name, 
//         avatarUrl: updated?.avatarUrl 
//       });
//       toast.success("Profile updated successfully!");
//     } catch {
//       toast.error("Failed to save profile");
//     } finally {
//       setSaving(false);
//     }
//   };

//   const onPickFile = () => fileInputRef.current?.click();
//   const onAvatarChange = async (e) => {
//     const file = e.target.files?.[0];
//     if (!file) return;
//     try {
//       const updated = await uploadAvatar(file);
//       setMe((p) => ({ ...p, avatarUrl: updated?.avatarUrl || p.avatarUrl }));
//       setUserInStore?.({ ...(authUser || {}), avatarUrl: updated?.avatarUrl });
//       toast.success("Avatar updated!");
//     } catch {
//       toast.error("Avatar upload failed");
//     } finally {
//       e.target.value = "";
//     }
//   };

//   const onChangePassword = async (e) => {
//     e.preventDefault();
//     if (!pw.currentPassword || !pw.newPassword) {
//       return toast.error("Please fill in both password fields");
//     }
//     if (pw.newPassword.length < 6) {
//       return toast.error("New password must be at least 6 characters");
//     }
//     setPwSaving(true);
//     try {
//       await changePassword(pw);
//       toast.success("Password changed successfully!");
//       setPw({ currentPassword: "", newPassword: "" });
//     } catch (err) {
//       toast.error(err?.response?.data?.message || "Password change failed");
//     } finally {
//       setPwSaving(false);
//     }
//   };

//   const onLogout = async () => {
//     try { 
//       await logout(); 
//     } catch {}
//   };

//   return (
//     <DashboardLayout role={authUser?.role || "traveller"} title="Profile" user={authUser}>
      
//       {/* Header */}
//       <div className="mb-8">
//         <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
//           <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
//             <User className="h-6 w-6 text-white" />
//           </div>
//           My Profile
//         </h1>
//         <p className="text-gray-600 dark:text-gray-400 mt-2">
//           Manage your personal information and account settings
//         </p>
//       </div>

//       {/* Profile Header Card */}
//       <Card className="mb-8 border-0 shadow-lg overflow-hidden">
//         <div className="h-32 bg-gradient-to-r from-primary-500 via-purple-500 to-pink-500" />
//         <CardContent className="p-6 -mt-16 relative">
//           <div className="flex flex-col md:flex-row md:items-end gap-6">
//             {/* Avatar */}
//             <div className="relative group">
//               <div className="w-32 h-32 rounded-2xl bg-white dark:bg-gray-800 p-2 shadow-xl">
//                 <img
//                   src={avatarPreview || "/default-avatar.png"}
//                   onError={(e) => (e.currentTarget.src = "/default-avatar.png")}
//                   alt={me.name || "User"}
//                   className="w-full h-full rounded-xl object-cover"
//                 />
//               </div>
//               <button
//                 type="button"
//                 onClick={onPickFile}
//                 className="absolute bottom-2 right-2 p-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white shadow-lg transition-all duration-300 hover:scale-110"
//                 title="Change avatar"
//               >
//                 <Camera className="h-4 w-4" />
//               </button>
//               <input 
//                 ref={fileInputRef} 
//                 type="file" 
//                 accept="image/*" 
//                 className="hidden" 
//                 onChange={onAvatarChange} 
//               />
//             </div>

//             {/* User Info */}
//             <div className="flex-1 pb-2">
//               <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
//                 {me.name || "Your Name"}
//               </h2>
//               <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
//                 <span className="inline-flex items-center gap-1.5">
//                   <Mail className="h-4 w-4" />
//                   {me.email}
//                 </span>
//                 <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 rounded-full font-medium">
//                   <Shield className="h-4 w-4" />
//                   {authUser?.role || "Traveller"}
//                 </span>
//                 <span className="inline-flex items-center gap-1.5">
//                   <Calendar className="h-4 w-4" />
//                   Member since {new Date().getFullYear()}
//                 </span>
//               </div>
//             </div>

//             {/* Logout Button */}
//             <Button 
//               variant="outline" 
//               className="gap-2 border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20" 
//               onClick={onLogout}
//             >
//               <LogOut className="h-4 w-4" />
//               Sign Out
//             </Button>
//           </div>
//         </CardContent>
//       </Card>

//       {/* Forms Grid */}
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
//         {/* Personal Info Form */}
//         <form onSubmit={onSave} className="lg:col-span-2">
//           <Card className="border-0 shadow-md">
//             <CardContent className="p-6">
//               <div className="flex items-center justify-between mb-6">
//                 <div>
//                   <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
//                     <User className="h-5 w-5" />
//                     Personal Information
//                   </h3>
//                   <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
//                     Update your personal details
//                   </p>
//                 </div>
//                 <Button 
//                   type="submit" 
//                   disabled={saving || loading} 
//                   className="gap-2"
//                   size="sm"
//                 >
//                   {saving ? (
//                     <Loader2 className="h-4 w-4 animate-spin" />
//                   ) : (
//                     <Save className="h-4 w-4" />
//                   )}
//                   Save Changes
//                 </Button>
//               </div>

//               {loading ? (
//                 <div className="space-y-4">
//                   <div className="h-20 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
//                   <div className="h-20 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
//                 </div>
//               ) : (
//                 <div className="space-y-5">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                       Full Name
//                     </label>
//                     <div className="relative">
//                       <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
//                       <input
//                         value={me.name}
//                         onChange={(e) => setMe((p) => ({ ...p, name: e.target.value }))}
//                         className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
//                         placeholder="Enter your full name"
//                       />
//                     </div>
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                       Email Address
//                     </label>
//                     <div className="relative">
//                       <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
//                       <input
//                         value={me.email}
//                         disabled
//                         className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-500 cursor-not-allowed"
//                       />
//                     </div>
//                     <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
//                       Email cannot be changed for security reasons
//                     </p>
//                   </div>

//                   <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
//                     <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
//                       <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
//                       <div>
//                         <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
//                           Profile Verified
//                         </h4>
//                         <p className="text-sm text-blue-700 dark:text-blue-300">
//                           Your profile is complete and verified. Keep your information up to date.
//                         </p>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </CardContent>
//           </Card>
//         </form>

//         {/* Security Section */}
//         <div className="space-y-6">
          
//           {/* Change Password Card */}
//           <form onSubmit={onChangePassword}>
//             <Card className="border-0 shadow-md">
//               <CardContent className="p-6">
//                 <div className="mb-6">
//                   <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
//                     <Lock className="h-5 w-5" />
//                     Security
//                   </h3>
//                   <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
//                     Update your password
//                   </p>
//                 </div>

//                 <div className="space-y-4">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                       Current Password
//                     </label>
//                     <div className="relative">
//                       <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
//                       <input
//                         type="password"
//                         value={pw.currentPassword}
//                         onChange={(e) => setPw((p) => ({ ...p, currentPassword: e.target.value }))}
//                         className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
//                         placeholder="••••••••"
//                       />
//                     </div>
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                       New Password
//                     </label>
//                     <div className="relative">
//                       <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
//                       <input
//                         type="password"
//                         value={pw.newPassword}
//                         onChange={(e) => setPw((p) => ({ ...p, newPassword: e.target.value }))}
//                         className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
//                         placeholder="Minimum 6 characters"
//                       />
//                     </div>
//                   </div>

//                   <Button 
//                     type="submit" 
//                     disabled={pwSaving} 
//                     className="w-full gap-2"
//                   >
//                     {pwSaving ? (
//                       <Loader2 className="h-4 w-4 animate-spin" />
//                     ) : (
//                       <KeyRound className="h-4 w-4" />
//                     )}
//                     Update Password
//                   </Button>
//                 </div>
//               </CardContent>
//             </Card>
//           </form>

//           {/* Account Stats Card */}
//           <Card className="border-0 shadow-md bg-gradient-to-br from-purple-500 to-pink-600 text-white">
//             <CardContent className="p-6">
//               <div className="flex items-center gap-4 mb-4">
//                 <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
//                   <Award className="h-6 w-6" />
//                 </div>
//                 <div>
//                   <h3 className="font-bold text-lg">Premium Member</h3>
//                   <p className="text-sm opacity-90">Active since {new Date().getFullYear()}</p>
//                 </div>
//               </div>
//               <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/20">
//                 <div>
//                   <div className="text-2xl font-bold">12</div>
//                   <div className="text-xs opacity-90">Bookings</div>
//                 </div>
//                 <div>
//                   <div className="text-2xl font-bold">8</div>
//                   <div className="text-xs opacity-90">Places Visited</div>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>

//           {/* Settings Link Card */}
//           <Card className="border-0 shadow-md">
//             <CardContent className="p-6">
//               <Link 
//                 to="/settings"
//                 className="flex items-center gap-3 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
//               >
//                 <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
//                   <Settings className="h-5 w-5" />
//                 </div>
//                 <div className="flex-1">
//                   <div className="font-medium">Account Settings</div>
//                   <div className="text-sm text-gray-500">Manage preferences</div>
//                 </div>
//                 <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
//                 </svg>
//               </Link>
//             </CardContent>
//           </Card>
//         </div>
//       </div>
//     </DashboardLayout>
//   );
// }
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/Layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import toast from "react-hot-toast";
import { api, useAuthStore } from "@/store/auth";
import { useSampleDataStore } from "@/store/sampleData";
import {
  User, Mail, Camera, Save, Loader2, Lock, KeyRound, LogOut,
  Shield, Calendar, Award, CheckCircle, Settings, Phone, MapPin,
  FileText, Star, Heart, CreditCard, Eye, EyeOff, ChevronRight,
  Compass, Landmark, Leaf, Utensils, ShoppingBag, Zap, Waves,
} from "lucide-react";

/* ─── API helpers ─────────────────────────────────────────────────────────── */
async function getMe() {
  const { data } = await api.get("/users/me");
  return data?.data?.user || data?.data || data?.user || data;
}
async function updateMe(payload) {
  const { data } = await api.put("/users/me", payload);
  return data?.data?.user || data?.data || data?.user || data;
}
async function changePassword(payload) {
  const { data } = await api.patch("/users/me/password", payload);
  return data;
}
async function uploadAvatar(file) {
  const fd = new FormData();
  fd.append("avatar", file);
  const { data } = await api.post("/users/me/avatar", fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data?.data?.user || data?.data || data?.user || data;
}
async function getUserStats() {
  try {
    const { data } = await api.get("/users/me/stats");
    return data?.data || data || {};
  } catch {
    return {};
  }
}

/* ─── Travel interest categories ─────────────────────────────────────────── */
const INTEREST_OPTIONS = [
  { id: "cultural",      label: "Cultural",      icon: Landmark },
  { id: "nature",        label: "Nature",         icon: Leaf },
  { id: "adventure",     label: "Adventure",      icon: Zap },
  { id: "food",          label: "Food & Cuisine", icon: Utensils },
  { id: "spiritual",     label: "Spiritual",      icon: Compass },
  { id: "shopping",      label: "Shopping",       icon: ShoppingBag },
  { id: "beach",         label: "Beach & Water",  icon: Waves },
  { id: "art",           label: "Art & Museums",  icon: Star },
];

/* ─── Achievement definitions ─────────────────────────────────────────────── */
function buildAchievements(bookingCount, reviewCount, wishlistCount) {
  return [
    {
      id: "first_booking",
      label: "First Booking",
      desc: "Completed your first adventure",
      icon: "🎫",
      unlocked: bookingCount >= 1,
      color: "from-violet-500 to-purple-600",
    },
    {
      id: "explorer",
      label: "Explorer",
      desc: "Made 3 or more bookings",
      icon: "🧭",
      unlocked: bookingCount >= 3,
      color: "from-blue-500 to-cyan-500",
    },
    {
      id: "reviewer",
      label: "Reviewer",
      desc: "Shared your first review",
      icon: "⭐",
      unlocked: reviewCount >= 1,
      color: "from-amber-400 to-orange-500",
    },
    {
      id: "wishlist_collector",
      label: "Collector",
      desc: "Saved 5+ items to wishlist",
      icon: "❤️",
      unlocked: wishlistCount >= 5,
      color: "from-pink-500 to-rose-500",
    },
    {
      id: "adventurer",
      label: "Adventurer",
      desc: "Completed 5 or more trips",
      icon: "🏔️",
      unlocked: bookingCount >= 5,
      color: "from-green-500 to-emerald-600",
    },
    {
      id: "globetrotter",
      label: "Globetrotter",
      desc: "Reached 10+ bookings",
      icon: "🌍",
      unlocked: bookingCount >= 10,
      color: "from-indigo-500 to-violet-600",
    },
  ];
}

/* ─── Skeleton loader ─────────────────────────────────────────────────────── */
function Skeleton({ className = "" }) {
  return <div className={`animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800 ${className}`} />;
}

/* ─── Input field wrapper ─────────────────────────────────────────────────── */
function Field({ label, icon: Icon, children, hint }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        )}
        {children}
      </div>
      {hint && <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">{hint}</p>}
    </div>
  );
}

const INPUT = "w-full py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all text-sm";
const INPUT_ICON = `${INPUT} pl-10 pr-4`;
const INPUT_PLAIN = `${INPUT} px-4`;
const INPUT_DISABLED = "w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-gray-400 dark:text-gray-600 cursor-not-allowed text-sm";

/* ─── Main component ──────────────────────────────────────────────────────── */
export default function Profile() {
  const { user: authUser, logout } = useAuthStore();
  const { bookings, reviews } = useSampleDataStore();
  const fileInputRef = useRef(null);

  /* form state */
  const [me, setMe] = useState({
    name:      authUser?.name  || "",
    email:     authUser?.email || "",
    avatarUrl: authUser?.avatarUrl || "",
    phone:     authUser?.phone || "",
    city:      authUser?.city  || "",
    bio:       authUser?.bio   || "",
  });
  const [pw, setPw] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false });
  const [interests, setInterests] = useState(() => {
    try { return JSON.parse(localStorage.getItem("travel-interests") || "[]"); }
    catch { return []; }
  });

  /* loading / saving flags */
  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);
  const [pwSaving,  setPwSaving]  = useState(false);

  /* stats (API + sample data fallback) */
  const DEMO_ID = "4";
  const effectiveId = useMemo(() => {
    const has = bookings.some(b => b.userId === authUser?.id);
    return has ? authUser?.id : DEMO_ID;
  }, [bookings, authUser?.id]);

  const sampleStats = useMemo(() => {
    const ub = bookings.filter(b => b.userId === effectiveId && b.status === "confirmed");
    const ur = reviews.filter(r => r.userId === effectiveId);
    const totalSpent = ub.reduce((s, b) => s + b.totalAmount, 0);
    return { bookingsCount: ub.length, reviewsCount: ur.length, totalSpent };
  }, [bookings, reviews, effectiveId]);

  const [apiStats, setApiStats] = useState({ bookingsCount: 0, placesVisited: 0 });

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [userResult, statsResult] = await Promise.all([getMe(), getUserStats()]);
        setMe(p => ({
          ...p,
          name:      userResult?.name      || p.name,
          email:     userResult?.email     || p.email,
          avatarUrl: userResult?.avatarUrl || p.avatarUrl,
          phone:     userResult?.phone     || p.phone,
          city:      userResult?.city      || p.city,
          bio:       userResult?.bio       || p.bio,
        }));
        setApiStats({
          bookingsCount:  statsResult?.bookingsCount  || statsResult?.totalBookings || 0,
          placesVisited:  statsResult?.placesVisited  || statsResult?.uniquePlaces  || 0,
        });
      } catch {
        /* silently fall back to sample data */
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* merged stats: prefer API non-zero, else sample */
  const displayStats = useMemo(() => ({
    bookings:     apiStats.bookingsCount  || sampleStats.bookingsCount,
    places:       apiStats.placesVisited  || 0,
    reviews:      sampleStats.reviewsCount,
    totalSpent:   sampleStats.totalSpent,
  }), [apiStats, sampleStats]);

  /* achievements from stats */
  const achievements = useMemo(
    () => buildAchievements(displayStats.bookings, displayStats.reviews, 0),
    [displayStats.bookings, displayStats.reviews]
  );

  /* handlers */
  const setField = useCallback((field) => (e) =>
    setMe(p => ({ ...p, [field]: e.target.value })), []);

  const toggleInterest = useCallback((id) => {
    setInterests(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      localStorage.setItem("travel-interests", JSON.stringify(next));
      return next;
    });
  }, []);

  const onPickFile = useCallback(() => fileInputRef.current?.click(), []);

  const onAvatarChange = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return toast.error("Image must be under 5 MB.");
    if (!["image/jpeg", "image/png", "image/jpg", "image/webp"].includes(file.type))
      return toast.error("Only JPG, PNG, or WEBP images are allowed.");
    try {
      const updated = await uploadAvatar(file);
      setMe(p => ({ ...p, avatarUrl: updated?.avatarUrl || p.avatarUrl }));
      toast.success("Avatar updated!");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Avatar upload failed.");
    } finally {
      e.target.value = "";
    }
  }, []);

  const onSave = useCallback(async (e) => {
    e.preventDefault();
    if (!me.name.trim()) return toast.error("Name cannot be empty.");
    setSaving(true);
    try {
      await updateMe({ name: me.name, phone: me.phone, city: me.city, bio: me.bio });
      toast.success("Profile saved!");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save profile.");
    } finally {
      setSaving(false);
    }
  }, [me]);

  const onChangePassword = useCallback(async (e) => {
    e.preventDefault();
    if (!pw.currentPassword) return toast.error("Enter your current password.");
    if (pw.newPassword.length < 6) return toast.error("New password needs at least 6 characters.");
    if (pw.newPassword !== pw.confirmPassword) return toast.error("Passwords don't match.");
    setPwSaving(true);
    try {
      await changePassword({ currentPassword: pw.currentPassword, newPassword: pw.newPassword });
      toast.success("Password changed!");
      setPw({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      toast.error(err?.response?.data?.message || "Password change failed.");
    } finally {
      setPwSaving(false);
    }
  }, [pw]);

  const onLogout = useCallback(async () => {
    try { await logout(); } catch { /* ignore */ }
  }, [logout]);

  const initial = (me.name || "U").charAt(0).toUpperCase();

  /* ── JSX ── */
  return (
    <DashboardLayout role={authUser?.role || "traveller"} title="My Profile" user={authUser}>

      {/* ── Hero banner ── */}
      <Card className="mb-6 border-0 shadow-md overflow-hidden">
        <div className="h-28 bg-gradient-to-r from-violet-600 via-purple-500 to-pink-500 relative">
          <div className="absolute inset-0 opacity-20"
            style={{ backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)", backgroundSize: "30px 30px" }}
          />
        </div>
        <CardContent className="px-6 pb-5 -mt-14">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4">
            {/* Avatar */}
            <div className="relative group flex-shrink-0">
              <div className="w-24 h-24 rounded-2xl border-4 border-white dark:border-gray-900 shadow-xl overflow-hidden bg-gradient-to-br from-violet-500 to-purple-700">
                {me.avatarUrl ? (
                  <img src={me.avatarUrl} onError={e => { e.currentTarget.style.display = "none"; }}
                    alt={me.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white text-3xl font-bold">
                    {initial}
                  </div>
                )}
              </div>
              <button type="button" onClick={onPickFile}
                className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-violet-600 hover:bg-violet-700 text-white flex items-center justify-center shadow-lg transition-transform hover:scale-110"
                title="Change avatar">
                <Camera className="h-3.5 w-3.5" />
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onAvatarChange} />
            </div>

            {/* Identity */}
            <div className="flex-1 min-w-0 pb-1">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white truncate">
                {me.name || "Your Name"}
              </h2>
              <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" />{me.email}</span>
                {me.city && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{me.city}</span>}
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 rounded-full font-semibold capitalize">
                  <Shield className="h-3 w-3" />{authUser?.role || "traveller"}
                </span>
                {authUser?.createdAt && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    Since {new Date(authUser.createdAt).getFullYear()}
                  </span>
                )}
              </div>
              {me.bio && (
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{me.bio}</p>
              )}
            </div>

            <Button variant="outline"
              className="flex-shrink-0 border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20 text-sm"
              onClick={onLogout}>
              <LogOut className="h-4 w-4 mr-1.5" />Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ── Stats row ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Bookings",    value: displayStats.bookings,                          icon: Calendar,    color: "bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400" },
          { label: "Reviews",     value: displayStats.reviews,                           icon: Star,        color: "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400" },
          { label: "Places",      value: displayStats.places || displayStats.bookings,   icon: MapPin,      color: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400" },
          { label: "Total Spent", value: `₹${displayStats.totalSpent.toLocaleString()}`, icon: CreditCard,  color: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400" },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="border-0 shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
                  {loading ? <span className="text-sm text-gray-400">…</span> : value}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Main grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── LEFT: info + interests + recent ── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Personal Information */}
          <form onSubmit={onSave}>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <User className="h-4 w-4 text-violet-500" />Personal Information
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Update your personal details</p>
                  </div>
                  <Button type="submit" size="sm" loading={saving} disabled={loading}>
                    <Save className="h-4 w-4 mr-1.5" />Save
                  </Button>
                </div>

                {loading ? (
                  <div className="space-y-4">
                    {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-11" />)}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Full Name" icon={User}>
                      <input value={me.name} onChange={setField("name")}
                        className={INPUT_ICON} placeholder="Your full name" />
                    </Field>

                    <Field label="Email Address" icon={Mail}
                      hint="Email cannot be changed for security reasons.">
                      <input value={me.email} disabled className={INPUT_DISABLED} />
                    </Field>

                    <Field label="Phone Number" icon={Phone}
                      hint="Optional. Used for booking reminders.">
                      <input value={me.phone} onChange={setField("phone")}
                        className={INPUT_ICON} placeholder="+91 98765 43210" />
                    </Field>

                    <Field label="City / Location" icon={MapPin}
                      hint="Your home city or current location.">
                      <input value={me.city} onChange={setField("city")}
                        className={INPUT_ICON} placeholder="e.g. Kolkata, India" />
                    </Field>

                    <div className="sm:col-span-2">
                      <Field label="Bio" icon={FileText}
                        hint={`${me.bio.length}/200 characters`}>
                        <textarea value={me.bio} onChange={setField("bio")} rows={3}
                          maxLength={200}
                          className={`${INPUT_PLAIN} pl-10 resize-none`}
                          placeholder="Tell other travellers a little about yourself…" />
                      </Field>
                    </div>
                  </div>
                )}

                {/* Verified badge */}
                <div className="mt-4 flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400">
                  <CheckCircle className="h-4 w-4 flex-shrink-0" />
                  <span>Profile verified — email confirmed</span>
                </div>
              </CardContent>
            </Card>
          </form>

          {/* Travel Interests */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="mb-4">
                <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Compass className="h-4 w-4 text-violet-500" />Travel Interests
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Select what excites you — helps us recommend better activities.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {INTEREST_OPTIONS.map(({ id, label, icon: Icon }) => {
                  const active = interests.includes(id);
                  return (
                    <button key={id} type="button" onClick={() => toggleInterest(id)}
                      aria-pressed={active}
                      className={[
                        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border-2 transition-all",
                        active
                          ? "border-violet-500 bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300"
                          : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-violet-300 dark:hover:border-violet-700",
                      ].join(" ")}>
                      <Icon className="h-3.5 w-3.5" />{label}
                    </button>
                  );
                })}
              </div>
              {interests.length > 0 && (
                <p className="mt-3 text-xs text-violet-600 dark:text-violet-400">
                  {interests.length} interest{interests.length !== 1 ? "s" : ""} selected
                </p>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-violet-500" />Recent Activity
                </h3>
                <Link to="/account/bookings"
                  className="text-xs text-violet-600 dark:text-violet-400 hover:underline font-medium flex items-center gap-1">
                  View all <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
              {bookings
                .filter(b => b.userId === effectiveId)
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, 3)
                .map(booking => (
                  <div key={booking.id}
                    className="flex items-center gap-3 py-3 border-b border-gray-100 dark:border-gray-800 last:border-0">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 text-sm ${
                      booking.status === "confirmed"
                        ? "bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600"
                        : booking.status === "cancelled"
                        ? "bg-red-100 dark:bg-red-900/20 text-red-500"
                        : "bg-amber-100 dark:bg-amber-900/20 text-amber-600"
                    }`}>
                      {booking.status === "confirmed" ? "✓" : booking.status === "cancelled" ? "✕" : "○"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        Activity #{booking.activityId}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(booking.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">₹{booking.totalAmount}</p>
                      <span className={`text-xs capitalize ${
                        booking.status === "confirmed" ? "text-emerald-600 dark:text-emerald-400"
                        : booking.status === "cancelled" ? "text-red-500" : "text-amber-600"
                      }`}>{booking.status}</span>
                    </div>
                  </div>
                ))}
              {bookings.filter(b => b.userId === effectiveId).length === 0 && (
                <p className="text-sm text-gray-400 dark:text-gray-600 text-center py-4">No bookings yet.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ── RIGHT: security + achievements + links ── */}
        <div className="space-y-6">

          {/* Change Password */}
          <form onSubmit={onChangePassword}>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                  <Lock className="h-4 w-4 text-violet-500" />Security
                </h3>
                <div className="space-y-3">
                  {[
                    { field: "currentPassword", label: "Current Password",    key: "current" },
                    { field: "newPassword",      label: "New Password (6+)",  key: "new" },
                    { field: "confirmPassword",  label: "Confirm Password",    key: "confirm" },
                  ].map(({ field, label, key }) => (
                    <div key={field}>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
                      <div className="relative">
                        <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type={showPw[key] ? "text" : "password"}
                          value={pw[field]}
                          onChange={e => setPw(p => ({ ...p, [field]: e.target.value }))}
                          className={`${INPUT_ICON} pr-9`}
                          placeholder="••••••••"
                        />
                        <button type="button"
                          onClick={() => setShowPw(p => ({ ...p, [key]: !p[key] }))}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                          {showPw[key] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  ))}
                  <Button type="submit" className="w-full mt-1" loading={pwSaving}>
                    <KeyRound className="h-4 w-4 mr-1.5" />Update Password
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>

          {/* Achievements */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                <Award className="h-4 w-4 text-violet-500" />Achievements
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {achievements.map(({ id, label, desc, icon, unlocked, color }) => (
                  <div key={id} title={desc}
                    className={`flex flex-col items-center gap-1.5 p-2 rounded-xl text-center transition-all ${
                      unlocked
                        ? `bg-gradient-to-br ${color} text-white shadow-sm`
                        : "bg-gray-100 dark:bg-gray-800 grayscale opacity-40"
                    }`}>
                    <span className="text-2xl">{icon}</span>
                    <span className="text-xs font-semibold leading-tight">{label}</span>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs text-gray-400 dark:text-gray-500 text-center">
                {achievements.filter(a => a.unlocked).length}/{achievements.length} unlocked
              </p>
            </CardContent>
          </Card>

          {/* Quick links */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4 space-y-1">
              {[
                { to: "/settings",        icon: Settings,  label: "Preferences & Privacy", sub: "Theme, notifications" },
                { to: "/account/reviews", icon: Star,      label: "My Reviews",             sub: "Activities you reviewed" },
                { to: "/account/payments",icon: CreditCard,label: "Payment History",        sub: "All transactions" },
              ].map(({ to, icon: Icon, label, sub }) => (
                <Link key={to} to={to}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group">
                  <div className="w-9 h-9 rounded-lg bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center flex-shrink-0">
                    <Icon className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{label}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">{sub}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-300 dark:text-gray-600 group-hover:text-violet-500 transition-colors" />
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
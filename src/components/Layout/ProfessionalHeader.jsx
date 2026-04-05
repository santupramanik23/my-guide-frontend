import { memo, useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Search, User, LogOut, ChevronDown, Sun, Moon } from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { useUIStore } from "@/store/ui";
import { useTheme } from "@/hooks/useTheme";
import Button from "@/components/ui/Button";

const ROLE_TO_DASHBOARD = Object.freeze({
  admin: "/dashboard/admin",
  advisor: "/dashboard/advisor",
  guide: "/dashboard/guide",
  instructor: "/dashboard/instructor",
  traveller: "/dashboard/traveller",
});

const NAV_LINKS = Object.freeze([
  { label: "Explore", to: "/search" },
  { label: "Places", to: "/search?type=place" },
  { label: "Activities", to: "/search?type=activity" },
]);

function ProfessionalHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { searchQuery, setSearchQuery } = useUIStore() || {};

  const [localQuery, setLocalQuery] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const { isDarkMode, toggleTheme } = useTheme();
  const menuRef = useRef(null);

  const query = searchQuery ?? localQuery;
  const setQuery = setSearchQuery ?? setLocalQuery;
  const isLandingPage = location.pathname === "/";
  const showSearch = true;
  const isSearchSection = location.pathname === "/search";

  useEffect(() => {
    if (!showMenu) return;
    const handlePointer = (e) => {
      if (!menuRef.current?.contains(e.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("pointerdown", handlePointer, { passive: true });
    return () => document.removeEventListener("pointerdown", handlePointer);
  }, [showMenu]);

  const handleSearchSubmit = useCallback((e) => {
    e.preventDefault();
    const value = query?.trim();
    if (!value) return;
    navigate(`/search?q=${encodeURIComponent(value)}`);
  }, [navigate, query]);

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }, [logout, navigate]);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/92 shadow-sm backdrop-blur-xl dark:border-[#2a1a45] dark:bg-[#120c1f]/92">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center gap-4">
          <Link to="/" className="flex items-center gap-3 shrink-0" aria-label="Go to home">
            <img
              src="/images/LOGO2.png"
              alt="MyGuide Logo"
              className="h-auto w-10"
            />
            <div className="hidden sm:block">
              <span className="font-display text-[1.35rem] tracking-tight text-slate-900 dark:text-white">MyGuide</span>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {NAV_LINKS.map((link) => {
              const isActive =
                (link.to === "/search" && isSearchSection) ||
                (link.to.includes("type=place") && location.search.includes("type=place")) ||
                (link.to.includes("type=activity") && location.search.includes("type=activity"));

              return (
                <Link
                  key={link.label}
                  to={link.to}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-slate-100 text-slate-900 dark:bg-[#22183a] dark:text-white"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-[#1b1430] dark:hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {showSearch && (
            <form onSubmit={handleSearchSubmit} className="hidden flex-1 xl:block">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="search"
                  placeholder="Search destinations or activities"
                  value={query || ""}
                  onChange={(e) => setQuery?.(e.target.value)}
                  className="w-full rounded-full border border-slate-200 bg-white px-4 py-2.5 pl-10 text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-[#2a1a45] dark:bg-[#1a1230] dark:text-gray-100 dark:placeholder-gray-500"
                  aria-label="Search"
                />
              </div>
            </form>
          )}

          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="rounded-full p-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-gray-300 dark:hover:bg-[#22183a] dark:hover:text-white"
              aria-label="Toggle dark mode"
              type="button"
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            {isAuthenticated ? (
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setShowMenu((prev) => !prev)}
                  className="flex items-center gap-2 rounded-full px-2 py-1.5 transition hover:bg-slate-100 dark:hover:bg-[#22183a]"
                  aria-label="Account menu"
                >
                  <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center text-sm font-semibold">
                    {user?.name?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                  <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${showMenu ? "rotate-180" : ""}`} />
                </button>

                {showMenu && (
                  <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-[#2a1a45] dark:bg-[#1a1230]">
                    <div className="border-b border-slate-100 px-4 py-3 dark:border-[#2a1a45]">
                      <div className="text-sm font-semibold text-slate-900 truncate dark:text-white">{user?.name || "Account"}</div>
                      <div className="text-xs text-slate-500 truncate">{user?.email}</div>
                    </div>
                    <div className="py-1">
                      <Link
                        to="/account/profile"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-[#22183a]"
                        onClick={() => setShowMenu(false)}
                      >
                        <User className="h-4 w-4 text-gray-400" />
                        Profile
                      </Link>
                      {user?.role && ROLE_TO_DASHBOARD[user.role] && (
                        <Link
                          to={ROLE_TO_DASHBOARD[user.role]}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-[#22183a]"
                          onClick={() => setShowMenu(false)}
                        >
                          Dashboard
                        </Link>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setShowMenu(false);
                        handleLogout();
                      }}
                      className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                    >
                      <LogOut className="h-4 w-4" />
                      Log out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/auth/login"
                  className="rounded-full px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-primary-600 dark:text-gray-200 dark:hover:bg-[#22183a] dark:hover:text-primary-300"
                >
                  Log in
                </Link>
                <Link
                  to="/auth/signup"
                  className="rounded-full bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>

        {showSearch && (
          <form onSubmit={handleSearchSubmit} className="pb-3 xl:hidden">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="search"
                placeholder="Search destinations, activities"
                value={query || ""}
                onChange={(e) => setQuery?.(e.target.value)}
                className="w-full rounded-full border border-slate-200 bg-white px-4 py-2.5 pl-10 text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-[#2a1a45] dark:bg-[#1a1230] dark:text-gray-100 dark:placeholder-gray-500"
                aria-label="Search"
              />
            </div>
          </form>
        )}
      </div>
    </header>
  );
}

export default memo(ProfessionalHeader);

import { memo, useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, User, LogOut, ChevronDown, Sun, Moon } from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { useUIStore } from "@/store/ui";

const ROLE_TO_DASHBOARD = Object.freeze({
  admin: "/dashboard/admin",
  advisor: "/dashboard/advisor",
  guide: "/dashboard/guide",
  instructor: "/dashboard/instructor",
  traveller: "/dashboard/traveller",
});

function ProfessionalHeader() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { searchQuery, setSearchQuery } = useUIStore() || {};

  const [localQuery, setLocalQuery] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const [darkMode, setDarkMode] = useTheme();
  const menuRef = useRef(null);

  const query = searchQuery ?? localQuery;
  const setQuery = setSearchQuery ?? setLocalQuery;

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
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-purple-100/70 shadow-sm dark:bg-[#120c1f]/95 dark:border-[#2a1a45]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 h-16">
          <Link to="/" className="flex items-center gap-3 shrink-0" aria-label="Go to home">
            <img
              src="/images/LOGO2.png"
              alt="MyGuide Logo"
              className="w-10 h-auto"
            />
            <span className="font-display text-lg text-gray-900 hidden sm:block">MyGuide</span>
          </Link>

          <form onSubmit={handleSearchSubmit} className="hidden md:block flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="search"
                placeholder="Search destinations, activities"
                value={query || ""}
                onChange={(e) => setQuery?.(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 rounded-full border border-purple-100 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition shadow-sm dark:bg-[#1a1230] dark:text-gray-100 dark:placeholder-gray-500 dark:border-[#2a1a45]"
                aria-label="Search"
              />
            </div>
          </form>

          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => setDarkMode((prev) => !prev)}
              className="p-2 rounded-full text-gray-600 hover:text-gray-900 hover:bg-purple-50 transition dark:text-gray-300 dark:hover:text-white dark:hover:bg-[#22183a]"
              aria-label="Toggle dark mode"
              type="button"
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            {isAuthenticated ? (
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setShowMenu((prev) => !prev)}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-full hover:bg-gray-100 transition"
                  aria-label="Account menu"
                >
                  <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center text-sm font-semibold">
                    {user?.name?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                  <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${showMenu ? "rotate-180" : ""}`} />
                </button>

                {showMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="text-sm font-semibold text-gray-900 truncate">{user?.name || "Account"}</div>
                      <div className="text-xs text-gray-500 truncate">{user?.email}</div>
                    </div>
                    <div className="py-1">
                      <Link
                        to="/account/profile"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setShowMenu(false)}
                      >
                        <User className="h-4 w-4 text-gray-400" />
                        Profile
                      </Link>
                      {user?.role && ROLE_TO_DASHBOARD[user.role] && (
                        <Link
                          to={ROLE_TO_DASHBOARD[user.role]}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
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
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
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
                  className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 dark:text-gray-200 dark:hover:text-primary-300"
                >
                  Log in
                </Link>
                <Link
                  to="/auth/signup"
                  className="px-4 py-2 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-full shadow-sm"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>

        <form onSubmit={handleSearchSubmit} className="md:hidden pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="search"
              placeholder="Search destinations, activities"
              value={query || ""}
              onChange={(e) => setQuery?.(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 rounded-full border border-purple-100 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition shadow-sm dark:bg-[#1a1230] dark:text-gray-100 dark:placeholder-gray-500 dark:border-[#2a1a45]"
              aria-label="Search"
            />
          </div>
        </form>
      </div>
    </header>
  );
}

export default memo(ProfessionalHeader);

function useTheme() {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("theme");
    return saved ? saved === "dark" : !!window.matchMedia?.("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  return [darkMode, setDarkMode];
}

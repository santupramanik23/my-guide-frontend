import { create } from "zustand";
import { persist } from "zustand/middleware";

export const THEME_STORAGE_KEY = "my-guide-ui";
export const THEME_OPTIONS = ["light", "dark", "system"];

const DEFAULT_FILTERS = {
  category: null,
  priceRange: [0, 10000],
  dateRange: null,
  city: null,
};

const canUseDOM = () => typeof window !== "undefined" && typeof document !== "undefined";

export function resolveTheme(mode) {
  if (!canUseDOM()) return mode === "dark" ? "dark" : "light";
  if (mode === "system") {
    return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return mode === "dark" ? "dark" : "light";
}

export function applyTheme(mode) {
  const resolvedTheme = resolveTheme(mode);

  if (canUseDOM()) {
    const root = document.documentElement;
    root.classList.toggle("dark", resolvedTheme === "dark");
    root.classList.toggle("light", resolvedTheme === "light");
    root.dataset.theme = resolvedTheme;

    const themeMeta = document.querySelector('meta[name="theme-color"]');
    if (themeMeta) {
      themeMeta.setAttribute("content", resolvedTheme === "dark" ? "#111827" : "#ffffff");
    }
  }

  return resolvedTheme;
}

export const useUIStore = create(
  persist(
    (set, get) => ({
      themeMode: "system",
      resolvedTheme: "light",
      isThemeReady: false,

      setTheme: (themeMode) => {
        const nextTheme = THEME_OPTIONS.includes(themeMode) ? themeMode : "system";
        const resolvedTheme = applyTheme(nextTheme);
        set({ themeMode: nextTheme, resolvedTheme, isThemeReady: true });
      },

      toggleTheme: () => {
        const nextTheme = get().resolvedTheme === "dark" ? "light" : "dark";
        get().setTheme(nextTheme);
      },

      hydrateTheme: () => {
        const resolvedTheme = applyTheme(get().themeMode);
        set({ resolvedTheme, isThemeReady: true });
      },

      syncSystemTheme: () => {
        if (get().themeMode !== "system") return;
        const resolvedTheme = applyTheme("system");
        set({ resolvedTheme, isThemeReady: true });
      },

      isMobileMenuOpen: false,
      setMobileMenuOpen: (isOpen) => set({ isMobileMenuOpen: isOpen }),

      isPageLoading: false,
      setPageLoading: (isLoading) => set({ isPageLoading: isLoading }),

      activeModal: null,
      openModal: (modalType, data = null) => set({ activeModal: { type: modalType, data } }),
      closeModal: () => set({ activeModal: null }),

      searchQuery: "",
      setSearchQuery: (query) => set({ searchQuery: query }),

      filters: DEFAULT_FILTERS,
      updateFilters: (newFilters) =>
        set((state) => ({
          filters: { ...state.filters, ...newFilters },
        })),
      resetFilters: () =>
        set({
          filters: DEFAULT_FILTERS,
        }),
    }),
    {
      name: THEME_STORAGE_KEY,
      partialize: (state) => ({
        themeMode: state.themeMode,
        resolvedTheme: state.resolvedTheme,
      }),
      onRehydrateStorage: () => (state) => {
        state?.hydrateTheme?.();
      },
    }
  )
);

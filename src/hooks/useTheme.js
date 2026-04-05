import { useMemo } from "react";
import { useUIStore } from "@/store/ui";

export function useTheme() {
  const themeMode = useUIStore((state) => state.themeMode);
  const resolvedTheme = useUIStore((state) => state.resolvedTheme);
  const setTheme = useUIStore((state) => state.setTheme);
  const toggleTheme = useUIStore((state) => state.toggleTheme);
  const isThemeReady = useUIStore((state) => state.isThemeReady);

  return useMemo(
    () => ({
      themeMode,
      resolvedTheme,
      isDarkMode: resolvedTheme === "dark",
      isThemeReady,
      setTheme,
      toggleTheme,
    }),
    [themeMode, resolvedTheme, isThemeReady, setTheme, toggleTheme]
  );
}

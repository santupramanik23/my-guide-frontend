import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import Router from "./routes/Router.jsx";
import "./index.css";
import { useUIStore } from "@/store/ui";

function ThemeController() {
  const hydrateTheme = useUIStore((state) => state.hydrateTheme);
  const syncSystemTheme = useUIStore((state) => state.syncSystemTheme);

  useEffect(() => {
    hydrateTheme();

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => syncSystemTheme();

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }

    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, [hydrateTheme, syncSystemTheme]);

  return null;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeController />
    <Router />
  </React.StrictMode>
);

"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { DEFAULT_THEME, isThemeName, THEME_STORAGE_KEY, type ThemeName } from "../../tokens/theme";

type ThemeContextValue = {
  theme: ThemeName;
  setTheme(theme: ThemeName): void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setCurrentTheme] = useState<ThemeName>(DEFAULT_THEME);

  const applyTheme = useCallback((nextTheme: ThemeName) => {
    document.documentElement.dataset.theme = nextTheme;
  }, []);

  const setTheme = useCallback((nextTheme: ThemeName) => {
    setCurrentTheme(nextTheme);
    applyTheme(nextTheme);
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    } catch {
      // Keep the selected theme active for this page even when storage is unavailable.
    }
  }, [applyTheme]);

  useEffect(() => {
    try {
      const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
      if (isThemeName(storedTheme)) {
        setCurrentTheme(storedTheme);
        applyTheme(storedTheme);
      } else {
        applyTheme(DEFAULT_THEME);
      }
    } catch {
      applyTheme(DEFAULT_THEME);
    }

    function synchronizeTheme(event: StorageEvent) {
      if (event.key === THEME_STORAGE_KEY) {
        const nextTheme = isThemeName(event.newValue) ? event.newValue : DEFAULT_THEME;
        setCurrentTheme(nextTheme);
        applyTheme(nextTheme);
      }
    }

    window.addEventListener("storage", synchronizeTheme);
    return () => window.removeEventListener("storage", synchronizeTheme);
  }, [applyTheme]);

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used inside ThemeProvider.");
  return context;
}

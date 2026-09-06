import { appConfig } from "@/config/app-config";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Theme = "light" | "dark" | "system";

/* Keyed by the app's own name: two generated apps served from one origin
   would otherwise share, and overwrite, each other's theme choice. */
const STORAGE_KEY = `${appConfig.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-theme`;

interface ThemeContextValue {
  theme: Theme;
  /** What is actually painted once "system" is resolved. */
  resolvedTheme: "light" | "dark";
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function prefersDark(): boolean {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function readStoredTheme(): Theme {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark" || stored === "system") return stored;
  } catch {
    /* Private browsing blocks storage; fall through to the system default. */
  }
  /* No stored choice yet: honour the theme picked when the app was built,
     rather than whatever this particular visitor's OS happens to prefer. */
  return appConfig.defaultTheme;
}

/**
 * Replaces next-themes: toggles `.dark` on <html> and remembers the choice.
 * `index.html` applies the stored value before first paint, so this only has
 * to keep the class in sync afterwards.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(readStoredTheme);
  const [systemDark, setSystemDark] = useState(prefersDark);

  useEffect(() => {
    const query = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => setSystemDark(query.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  const resolvedTheme = theme === "system" ? (systemDark ? "dark" : "light") : theme;

  useEffect(() => {
    document.documentElement.classList.toggle("dark", resolvedTheme === "dark");
  }, [resolvedTheme]);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* The theme still applies for this session. */
    }
  }, []);

  const value = useMemo(() => ({ theme, resolvedTheme, setTheme }), [theme, resolvedTheme, setTheme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used inside <ThemeProvider>");
  return context;
}

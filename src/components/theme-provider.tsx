"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type Theme = "light" | "dark" | "amoled";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleNextTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
  setTheme: () => {},
  toggleNextTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Read from localStorage or system preference
    const saved = localStorage.getItem("urbannest_theme") as Theme | null;
    if (saved && (saved === "light" || saved === "dark" || saved === "amoled")) {
      setThemeState(saved);
      applyTheme(saved);
    } else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setThemeState("dark");
      applyTheme("dark");
    } else {
      applyTheme("light");
    }
    setMounted(true);
  }, []);

  const applyTheme = (t: Theme) => {
    const root = document.documentElement;
    if (t === "light") {
      root.classList.remove("dark", "amoled");
      root.style.colorScheme = "light";
    } else if (t === "dark") {
      root.classList.add("dark");
      root.classList.remove("amoled");
      root.style.colorScheme = "dark";
    } else if (t === "amoled") {
      root.classList.add("dark", "amoled");
      root.style.colorScheme = "dark";
    }
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem("urbannest_theme", newTheme);
    } catch {}
    applyTheme(newTheme);
  };

  const toggleNextTheme = () => {
    if (theme === "light") setTheme("dark");
    else if (theme === "dark") setTheme("amoled");
    else setTheme("light");
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleNextTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

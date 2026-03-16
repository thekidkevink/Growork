import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useColorScheme as useSystemColorScheme } from "react-native";

type ThemePreference = "light" | "dark" | "system";
type ResolvedTheme = "light" | "dark";

interface ThemeContextValue {
  themePreference: ThemePreference;
  colorScheme: ResolvedTheme;
  setThemePreference: (preference: ThemePreference) => Promise<void>;
  toggleTheme: () => Promise<void>;
}

const STORAGE_KEY = "growork.theme-preference";

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemePreferenceProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const systemScheme = useSystemColorScheme();
  const [themePreference, setThemePreferenceState] =
    useState<ThemePreference>("system");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadPreference = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (
          !cancelled &&
          (stored === "light" || stored === "dark" || stored === "system")
        ) {
          setThemePreferenceState(stored);
        }
      } finally {
        if (!cancelled) {
          setHydrated(true);
        }
      }
    };

    void loadPreference();

    return () => {
      cancelled = true;
    };
  }, []);

  const resolvedColorScheme: ResolvedTheme =
    themePreference === "system"
      ? systemScheme === "dark"
        ? "dark"
        : "light"
      : themePreference;

  const setThemePreference = useCallback(async (preference: ThemePreference) => {
    setThemePreferenceState(preference);
    await AsyncStorage.setItem(STORAGE_KEY, preference);
  }, []);

  const toggleTheme = useCallback(async () => {
    const nextPreference = resolvedColorScheme === "dark" ? "light" : "dark";
    setThemePreferenceState(nextPreference);
    await AsyncStorage.setItem(STORAGE_KEY, nextPreference);
  }, [resolvedColorScheme]);

  const value = useMemo(
    () => ({
      themePreference,
      colorScheme: resolvedColorScheme,
      setThemePreference,
      toggleTheme,
    }),
    [resolvedColorScheme, setThemePreference, themePreference, toggleTheme]
  );

  if (!hydrated) {
    return null;
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);

  if (!context) {
    const fallbackScheme = useSystemColorScheme() === "dark" ? "dark" : "light";

    return {
      themePreference: "system" as ThemePreference,
      colorScheme: fallbackScheme,
      setThemePreference: async () => {},
      toggleTheme: async () => {},
    };
  }

  return context;
}

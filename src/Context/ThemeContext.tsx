import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';

interface ThemeContextValue {
  isDark: boolean;
  toggleTheme: () => void;
  setDark: (v: boolean) => void;
}

export const ThemeContext = createContext<ThemeContextValue>({
  isDark: true,
  toggleTheme: () => {},
  setDark: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode; defaultDark?: boolean }> = ({
  children,
  defaultDark = true,
}) => {
  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('app:theme');
      return stored ? JSON.parse(stored) : defaultDark;
    } catch {
      return defaultDark;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('app:theme', JSON.stringify(isDark));
    } catch {}
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      root.style.background = '#000';
    } else {
      root.classList.remove('dark');
      root.style.background = '#fff';
    }
  }, [isDark]);

  const toggleTheme = useCallback(() => setIsDark((v) => !v), []);
  const setDark = useCallback((v: boolean) => setIsDark(v), []);

  const value = useMemo(() => ({ isDark, toggleTheme, setDark }), [isDark, toggleTheme, setDark]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
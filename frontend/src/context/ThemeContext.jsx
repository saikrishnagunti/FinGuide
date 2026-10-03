import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  // Helper to determine the system's preferred color scheme
  const getSystemTheme = () => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  };

  const [isManual, setIsManual] = useState(() => {
    try {
      return localStorage.getItem('finguide_theme_manual') === 'true';
    } catch {
      return false;
    }
  });

  const [theme, setTheme] = useState(() => {
    try {
      const manual = localStorage.getItem('finguide_theme_manual') === 'true';
      const saved = localStorage.getItem('finguide_theme');
      if (manual && saved && (saved === 'light' || saved === 'dark')) {
        return saved;
      }
    } catch {}
    return getSystemTheme();
  });

  // Apply active theme to DOM documentElement and persist
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('finguide_theme', theme);
    } catch {}
  }, [theme]);

  // Listen to system color scheme changes in real-time
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleSystemChange = (e) => {
      // If user hasn't explicitly locked in a manual theme, follow system automatically
      const manual = localStorage.getItem('finguide_theme_manual') === 'true';
      if (!manual) {
        const newTheme = e.matches ? 'dark' : 'light';
        setTheme(newTheme);
      }
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleSystemChange);
      return () => mediaQuery.removeEventListener('change', handleSystemChange);
    } else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleSystemChange);
      return () => mediaQuery.removeListener(handleSystemChange);
    }
  }, []);

  // Manual toggle by user button click: switches theme and locks choice
  const toggleTheme = useCallback(() => {
    setTheme(prev => {
      const next = prev === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem('finguide_theme', next);
        localStorage.setItem('finguide_theme_manual', 'true');
      } catch {}
      setIsManual(true);
      return next;
    });
  }, []);

  // Reset to auto-sync with system preference
  const resetToSystem = useCallback(() => {
    try {
      localStorage.removeItem('finguide_theme_manual');
      localStorage.removeItem('finguide_theme');
    } catch {}
    setIsManual(false);
    const systemTheme = getSystemTheme();
    setTheme(systemTheme);
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        toggleTheme,
        resetToSystem,
        isDark: theme === 'dark',
        isManual,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}


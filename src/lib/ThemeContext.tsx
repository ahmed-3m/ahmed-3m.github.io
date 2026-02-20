'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  reduceTransparency: boolean;
  toggleReduceTransparency: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'light';
    const saved = localStorage.getItem('theme') as Theme | null;
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return saved || (systemPrefersDark ? 'dark' : 'light');
  });

  const [reduceTransparency, setReduceTransparency] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const savedTransparency = localStorage.getItem('reduceTransparency');
    const systemPrefersReducedTransparency =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-transparency: reduce)').matches;
    return savedTransparency ? savedTransparency === 'true' : systemPrefersReducedTransparency;
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.setAttribute(
      'data-reduce-transparency',
      reduceTransparency ? 'true' : 'false'
    );
  }, [theme, reduceTransparency]);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const toggleReduceTransparency = () => {
    const nextValue = !reduceTransparency;
    setReduceTransparency(nextValue);
    localStorage.setItem('reduceTransparency', String(nextValue));
  };

  return (
    <ThemeContext.Provider
      value={{ theme, toggleTheme, reduceTransparency, toggleReduceTransparency }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
}

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
  // Always start from the SSR default ('dark'). The persisted preference is
  // applied after mount (below) and pre-paint by the inline script in
  // layout.tsx. Reading localStorage during initial render made the first
  // client render disagree with the server HTML, which failed hydration and
  // forced React to re-render the entire tree — duplicating every JSON-LD
  // script tag on the page for returning visitors.
  const [theme, setTheme] = useState<Theme>('dark');
  const [reduceTransparency, setReduceTransparency] = useState<boolean>(false);

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'light' || saved === 'dark') setTheme(saved);

    const savedTransparency = localStorage.getItem('reduceTransparency');
    if (savedTransparency === 'true' || savedTransparency === 'false') {
      setReduceTransparency(savedTransparency === 'true');
    } else if (
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-transparency: reduce)').matches
    ) {
      setReduceTransparency(true);
    }
  }, []);

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

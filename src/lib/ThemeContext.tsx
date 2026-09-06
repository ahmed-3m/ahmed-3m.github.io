'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useSyncExternalStore,
  type ReactNode,
} from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  reduceTransparency: boolean;
  toggleReduceTransparency: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// ── theme as an external store (localStorage) ─────────────────────────────
// useSyncExternalStore keeps hydration safe: React uses getServerSnapshot
// ('dark') for the hydration pass — matching the SSR HTML — then re-renders
// with the client snapshot after mount. Reading localStorage during initial
// state instead made the first client render disagree with the server HTML,
// which failed hydration and forced React to re-render the entire tree
// (duplicating every JSON-LD script tag for returning light-theme visitors).

function subscribeStorage(callback: () => void) {
  window.addEventListener('storage', callback);
  return () => window.removeEventListener('storage', callback);
}

function getClientTheme(): Theme {
  return localStorage.getItem('theme') === 'light' ? 'light' : 'dark';
}

function getServerTheme(): Theme {
  return 'dark';
}

// ── reduced transparency (localStorage override + system media query) ─────

const reduceTransparencyQuery =
  typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia('(prefers-reduced-transparency: reduce)')
    : null;

function subscribeTransparency(callback: () => void) {
  window.addEventListener('storage', callback);
  reduceTransparencyQuery?.addEventListener('change', callback);
  return () => {
    window.removeEventListener('storage', callback);
    reduceTransparencyQuery?.removeEventListener('change', callback);
  };
}

function getClientReduceTransparency(): boolean {
  const saved = localStorage.getItem('reduceTransparency');
  if (saved === 'true') return true;
  if (saved === 'false') return false;
  return reduceTransparencyQuery?.matches ?? false;
}

function getServerReduceTransparency(): boolean {
  return false;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useSyncExternalStore(subscribeStorage, getClientTheme, getServerTheme);
  const reduceTransparency = useSyncExternalStore(
    subscribeTransparency,
    getClientReduceTransparency,
    getServerReduceTransparency
  );

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.setAttribute(
      'data-reduce-transparency',
      reduceTransparency ? 'true' : 'false'
    );
  }, [theme, reduceTransparency]);

  const toggleTheme = useCallback(() => {
    localStorage.setItem('theme', getClientTheme() === 'dark' ? 'light' : 'dark');
    // The storage event does not fire in the tab that made the change.
    window.dispatchEvent(new Event('storage'));
  }, []);

  const toggleReduceTransparency = useCallback(() => {
    localStorage.setItem('reduceTransparency', getClientReduceTransparency() ? 'false' : 'true');
    window.dispatchEvent(new Event('storage'));
  }, []);

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

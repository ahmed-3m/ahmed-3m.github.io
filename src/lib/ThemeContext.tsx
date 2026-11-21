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

// ── theme as an external store (localStorage + prefers-color-scheme) ───────
// useSyncExternalStore keeps hydration safe: React uses getServerSnapshot
// ('dark') for the hydration pass — matching the SSR HTML — then re-renders
// with the client snapshot after mount. Reading localStorage during initial
// state instead made the first client render disagree with the server HTML,
// which failed hydration and forced React to re-render the entire tree
// (duplicating every JSON-LD script tag for returning light-theme visitors).

const colorSchemeQuery =
  typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia('(prefers-color-scheme: light)')
    : null;

const THEME_STORAGE_KEY = 'theme';
const REDUCE_TRANSPARENCY_KEY = 'reduceTransparency';

let memoryTheme: Theme | null = null;
let memoryReduceTransparency: boolean | null = null;

function readStorage(key: string): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    window.localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

function subscribeTheme(callback: () => void) {
  const handleStorage = (event: Event) => {
    if (
      typeof StorageEvent !== 'undefined' &&
      event instanceof StorageEvent &&
      (event.key === null || event.key === THEME_STORAGE_KEY)
    ) {
      memoryTheme = null;
    }
    callback();
  };
  window.addEventListener('storage', handleStorage);
  colorSchemeQuery?.addEventListener('change', callback);
  return () => {
    window.removeEventListener('storage', handleStorage);
    colorSchemeQuery?.removeEventListener('change', callback);
  };
}

function getClientTheme(): Theme {
  if (memoryTheme) return memoryTheme;
  const saved = readStorage(THEME_STORAGE_KEY);
  if (saved === 'light' || saved === 'dark') return saved;
  return colorSchemeQuery?.matches ? 'light' : 'dark';
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
  const handleStorage = (event: Event) => {
    if (
      typeof StorageEvent !== 'undefined' &&
      event instanceof StorageEvent &&
      (event.key === null || event.key === REDUCE_TRANSPARENCY_KEY)
    ) {
      memoryReduceTransparency = null;
    }
    callback();
  };
  window.addEventListener('storage', handleStorage);
  reduceTransparencyQuery?.addEventListener('change', callback);
  return () => {
    window.removeEventListener('storage', handleStorage);
    reduceTransparencyQuery?.removeEventListener('change', callback);
  };
}

function getClientReduceTransparency(): boolean {
  if (memoryReduceTransparency !== null) return memoryReduceTransparency;
  const saved = readStorage(REDUCE_TRANSPARENCY_KEY);
  if (saved === 'true') return true;
  if (saved === 'false') return false;
  return reduceTransparencyQuery?.matches ?? false;
}

function getServerReduceTransparency(): boolean {
  return false;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useSyncExternalStore(subscribeTheme, getClientTheme, getServerTheme);
  const reduceTransparency = useSyncExternalStore(
    subscribeTransparency,
    getClientReduceTransparency,
    getServerReduceTransparency
  );

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.style.colorScheme = theme;
    document.documentElement.setAttribute(
      'data-reduce-transparency',
      reduceTransparency ? 'true' : 'false'
    );
  }, [theme, reduceTransparency]);

  const toggleTheme = useCallback(() => {
    const nextTheme: Theme = getClientTheme() === 'dark' ? 'light' : 'dark';
    memoryTheme = nextTheme;
    writeStorage(THEME_STORAGE_KEY, nextTheme);
    // The storage event does not fire in the tab that made the change.
    window.dispatchEvent(new Event('storage'));
  }, []);

  const toggleReduceTransparency = useCallback(() => {
    const nextReduceTransparency = !getClientReduceTransparency();
    memoryReduceTransparency = nextReduceTransparency;
    writeStorage(REDUCE_TRANSPARENCY_KEY, nextReduceTransparency ? 'true' : 'false');
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

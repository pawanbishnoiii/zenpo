import { useEffect, useState, useCallback } from 'react';

export type ThemeMode = 'light' | 'dark';

const STORAGE_KEY = 'ezo_theme_mode';

const apply = (mode: ThemeMode) => {
  const root = document.documentElement;
  if (mode === 'dark') root.classList.add('dark');
  else root.classList.remove('dark');
};

export const useTheme = () => {
  const [mode, setMode] = useState<ThemeMode>(() => {
    if (typeof window === 'undefined') return 'light';
    const stored = localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
    if (stored === 'light' || stored === 'dark') return stored;
    // Default: day mode (do NOT auto-follow OS preference)
    return 'light';
  });

  useEffect(() => { apply(mode); localStorage.setItem(STORAGE_KEY, mode); }, [mode]);

  const toggle = useCallback(() => setMode(m => (m === 'dark' ? 'light' : 'dark')), []);

  return { mode, setMode, toggle, isDark: mode === 'dark' };
};

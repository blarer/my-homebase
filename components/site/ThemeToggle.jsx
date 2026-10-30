'use client';

import { useEffect, useState } from 'react';

/**
 * Light / dark switch. The applied theme is set before paint by ThemeScript;
 * this catches up to it after mount and drives changes. The swap is
 * instant: a datasheet in a PDF viewer changes mode in one frame.
 */
const STORAGE_KEY = 'theme';
const apply = (theme) => {
  document.documentElement.dataset.theme = theme;
};

export default function ThemeToggle() {
  const [theme, setTheme] = useState(null);

  useEffect(() => {
    setTheme(document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light');
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (event) => {
      if (localStorage.getItem(STORAGE_KEY)) return;
      const next = event.matches ? 'dark' : 'light';
      apply(next);
      setTheme(next);
    };
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  const dark = theme === 'dark';
  const toggle = () => {
    const next = dark ? 'light' : 'dark';
    apply(next);
    localStorage.setItem(STORAGE_KEY, next);
    setTheme(next);
  };

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggle}
      aria-pressed={dark}
      aria-label={dark ? 'Switch to light sheet' : 'Switch to dark sheet'}
    >
      <span className="theme-toggle-box" aria-hidden="true" />
      <span className="theme-toggle-label num" aria-hidden="true">
        {theme === null ? 'MODE' : dark ? 'DARK' : 'LIGHT'}
      </span>
    </button>
  );
}

'use client';

import { useEffect, useState } from 'react';

/**
 * Theme toggle.
 *
 * The applied theme is set by an inline script in the document head before
 * paint (see ThemeScript), so this component only has to catch up to whatever
 * is already on <html> and then drive changes. Rendering a stable placeholder
 * until mounted keeps the server and client markup identical.
 */
const STORAGE_KEY = 'theme';

function apply(theme) {
  document.documentElement.dataset.theme = theme;
}

/**
 * Paper and ink crossfade on a manual flip. The class is added just before
 * the theme changes and removed after the transition, so first paint and
 * the system-preference listener never animate (a page should not fade in
 * when it opens, only when you turn the lamp on).
 */
let flipTimer = 0;
function flip(theme) {
  const root = document.documentElement;
  root.classList.add('theme-flipping');
  apply(theme);
  clearTimeout(flipTimer);
  flipTimer = setTimeout(() => root.classList.remove('theme-flipping'), 560);
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState(null);

  useEffect(() => {
    setTheme(document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light');
  }, []);

  // Follow the system while the visitor has not made an explicit choice.
  useEffect(() => {
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

  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    flip(next);
    localStorage.setItem(STORAGE_KEY, next);
    setTheme(next);
  };

  const dark = theme === 'dark';

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggle}
      aria-pressed={dark}
      aria-label={dark ? 'Switch to daylight theme' : 'Switch to lamplight theme'}
      title={dark ? 'Switch to daylight theme' : 'Switch to lamplight theme'}
    >
      <span className="theme-toggle-track" aria-hidden="true">
        <span className="theme-toggle-knob" />
      </span>
      <span className="theme-toggle-label" aria-hidden="true">
        {theme === null ? '\u00a0' : dark ? 'Lamplight' : 'Daylight'}
      </span>
    </button>
  );
}

'use client';

import NextLink from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useLayoutEffect, useState } from 'react';
import { Theme } from '@astryxdesign/core/theme';
import { LinkProvider } from '@astryxdesign/core/Link';
import { AppShell } from '@astryxdesign/core/AppShell';
import { TopNav, TopNavHeading, TopNavItem } from '@astryxdesign/core/TopNav';
import { Switch } from '@astryxdesign/core/Switch';
import { themes, defaultThemeSlug } from '../../src/astryx-themes';

/**
 * The site frame, scaffolded from Astryx's `shell-top-nav` template:
 * AppShell with a TopNav, content padded by the shell.
 *
 * The colour mode is chosen before first paint by ThemeScript (it writes
 * `data-theme` on <html>, which the theme stylesheet keys on), so this only
 * reads that choice back and drives changes through <Theme mode>.
 */
const NAV = [
  { href: '/', label: 'Introduction' },
  { href: '/work/', label: 'The work' },
];

const STORAGE_KEY = 'theme';
const normalise = (path) => (path.endsWith('/') ? path : `${path}/`);

export default function SiteShell({ children }) {
  const pathname = normalise(usePathname() ?? '/');
  const [mode, setMode] = useState(null);

  // Read the same inputs ThemeScript used, not the attribute: <Theme>'s own
  // layout effect runs first and rewrites `data-theme` from its `mode` prop.
  // A layout effect re-renders before paint, so a dark visit never flashes.
  useLayoutEffect(() => {
    let stored = null;
    try {
      stored = localStorage.getItem(STORAGE_KEY);
    } catch {}
    const dark = stored ? stored === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
    setMode(dark ? 'dark' : 'light');
  }, []);

  useEffect(() => {
    // Follow the system while the visitor has not chosen explicitly.
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (event) => {
      if (localStorage.getItem(STORAGE_KEY)) return;
      setMode(event.matches ? 'dark' : 'light');
    };
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  const toggle = (dark) => {
    const next = dark ? 'dark' : 'light';
    localStorage.setItem(STORAGE_KEY, next);
    setMode(next);
  };

  return (
    <Theme theme={themes[defaultThemeSlug]} mode={mode ?? 'system'}>
      <LinkProvider component={NextLink}>
        <AppShell
          variant="surface"
          height="auto"
          contentPadding={6}
          topNav={
            <TopNav
              label="Site"
              heading={<TopNavHeading heading="Blare" subheading="systems, measured" headingHref="/" />}
              startContent={NAV.map((item) => (
                <TopNavItem
                  key={item.href}
                  label={item.label}
                  href={item.href}
                  isSelected={pathname === item.href}
                />
              ))}
              endContent={
                <Switch
                  label="Dark"
                  size="sm"
                  value={mode === 'dark'}
                  onChange={toggle}
                />
              }
            />
          }
        >
          {children}
        </AppShell>
      </LinkProvider>
    </Theme>
  );
}

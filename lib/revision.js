import revisions from '@/lib/revisions.json';

/** The newest revision, from lib/revisions.json (see scripts/sync-revisions.mjs). */
export function revision() {
  const list = revisions.revisions;
  return { ...list[list.length - 1], count: list.length };
}

/**
 * The date printed in the page header. The pages are prerendered, so this is
 * evaluated once, when the site is built: the sheet carries its build date.
 */
export function buildDate() {
  return new Date().toISOString().slice(0, 10);
}

export const allRevisions = () => [...revisions.revisions].reverse();

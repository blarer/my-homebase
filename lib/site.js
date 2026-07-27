/**
 * Canonical origin for metadata, the sitemap, and robots.txt.
 *
 * This has to match the domain the site is actually served from. It previously
 * pointed at a domain that is not ours and does not serve the site, so every
 * share card and the sitemap advertised a URL that fails to load.
 */
export const SITE_URL = 'https://louds.net';

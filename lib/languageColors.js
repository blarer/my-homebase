/**
 * GitHub Linguist colours for the languages present in the snapshot.
 *
 * These are the only saturated colours on the site, so every hue on the page
 * is carrying data rather than decoration.
 */
export const LANGUAGE_COLORS = {
  Rust: '#dea584',
  Swift: '#f05138',
  Python: '#3572a5',
  JavaScript: '#f1e05a',
  TypeScript: '#3178c6',
  CSS: '#663399',
  Nix: '#7e7eff',
  Lua: '#000080',
  PowerShell: '#012456',
  Shell: '#89e051',
  Just: '#384d54',
  C: '#555555',
  HTML: '#e34c26',
  Go: '#00add8',
};

export function languageColor(name) {
  return LANGUAGE_COLORS[name] ?? '#8b949e';
}

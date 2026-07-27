/**
 * GitHub Linguist colours for the languages present in the snapshot.
 *
 * These are the only saturated colours on the site, so every hue on the page
 * is carrying data rather than decoration.
 */
export const LANGUAGE_COLORS = {
  Rust: "#dea584",
  Swift: "#f05138",
  Python: "#3572a5",
  JavaScript: "#f1e05a",
  TypeScript: "#3178c6",
  CSS: "#663399",
  Nix: "#7e7eff",
  Lua: "#000080",
  PowerShell: "#012456",
  Shell: "#89e051",
  Just: "#384d54",
  C: "#555555",
  HTML: "#e34c26",
  Go: "#00add8",
  "C#": "#178600",
  Svelte: "#ff3e00",
  Batchfile: "#c1f12e",
  Dockerfile: "#384d54",
  Makefile: "#427819",
  Vue: "#41b883",
  Zig: "#ec915c",
  Kotlin: "#a97bff",
  Java: "#b07219",
  Ruby: "#701516",
  "C++": "#f34b7d",
  "Objective-C": "#438eff",
  Haskell: "#5e5086",
  Elixir: "#6e4a7e",
  SCSS: "#c6538c",
  Astro: "#ff5a03",
};

/**
 * The colour Linguist gives a language, or a neutral grey when it has none.
 *
 * A language without an entry is drawn grey rather than given an invented hue,
 * because on this page colour is data: a made-up colour would look like a
 * measurement.
 */
export function languageColor(name) {
  return LANGUAGE_COLORS[name] ?? "#8b949e";
}

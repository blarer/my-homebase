import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  // Written by `astryx theme` / the theme editor; regenerated, never hand-edited.
  { ignores: ["src/themes/**", "themes/**", "src/astryx-themes.js"] },
  ...compat.extends("next/core-web-vitals"),
];

export default eslintConfig;

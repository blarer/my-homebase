/**
 * Byte counts as the site prints them: decimal units, the way GitHub's
 * languages API counts, with the precision a reader can actually compare.
 * `digits` is the MB precision; the ring centre uses two so the total reads
 * as a measurement rather than a rounding.
 */
export function bytes(total, digits = 1) {
  if (total >= 1_000_000) return `${(total / 1_000_000).toFixed(digits)} MB`;
  if (total >= 1_000) return `${Math.round(total / 1_000)} KB`;
  return `${total} B`;
}

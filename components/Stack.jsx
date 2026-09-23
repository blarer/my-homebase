import { languageColor } from "@/lib/languageColors";
import LanguageRing from "@/components/LanguageRing";
import "@/app/components.css";

/**
 * Languages, counted rather than claimed.
 *
 * The old marquee listed fifteen technologies including several that appear
 * nowhere in the work. This lists only what is actually in the repositories,
 * ordered by how much of it there is.
 *
 * The ring and the list are the same numbers twice on purpose: the ring shows
 * the shape of the whole, the list gives the exact figures. Neither is
 * decoration for the other.
 */

function bytes(total) {
  if (total >= 1_000_000) return `${(total / 1_000_000).toFixed(1)} MB`;
  if (total >= 1_000) return `${Math.round(total / 1_000)} KB`;
  return `${total} B`;
}

export default function Stack({ repos }) {
  const totals = new Map();

  for (const repo of repos) {
    for (const [name, value] of Object.entries(repo.languages)) {
      totals.set(name, (totals.get(name) ?? 0) + value);
    }
  }

  const ranked = [...totals.entries()].sort((a, b) => b[1] - a[1]);
  const grand = ranked.reduce((sum, [, value]) => sum + value, 0);
  const largest = ranked[0]?.[1] ?? 1;

  return (
    <section id="languages" className="section">
      <div className="shell">
        <div className="section-head">
          <span className="tag">Languages</span>
          <h2>What the work is actually written in</h2>
        </div>

        <div className="lang-split">
          <LanguageRing repos={repos} />

          <ol className="lang-list">
            {ranked.map(([name, value], index) => (
              <li className="lang-row" key={name}>
                <span className="num lang-rank">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="lang-name">
                  <span
                    className="swatch"
                    style={{ background: languageColor(name) }}
                    aria-hidden="true"
                  />
                  {name}
                </span>
                <span className="lang-bar">
                  {/* The run (fill + needle) moves as one rigid unit, so the
                      playhead always sits exactly on the leading edge. The
                      width is server-rendered: the measurement is visible
                      with JavaScript disabled. */}
                  <span
                    className="lang-bar-run"
                    style={{ width: `${(value / largest) * 100}%` }}
                  >
                    <span
                      className="lang-bar-fill"
                      style={{ background: languageColor(name) }}
                    />
                    <span className="lang-needle" aria-hidden="true" />
                  </span>
                </span>
                <span className="num lang-share">
                  {((value / grand) * 100).toFixed(1)}%
                </span>
                <span className="num lang-bytes">{bytes(value)}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

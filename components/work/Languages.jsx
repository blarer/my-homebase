import { languageColor } from "@/lib/languageColors";
import { bytes } from "@/lib/format";
import LanguageRing from "@/components/work/LanguageRing";
import { Caption } from "@/components/ui/Section";

/**
 * Composition: what the work is actually written in, counted rather than
 * claimed. Figure 8 is the ring (the shape of the whole); Table 5 is the same
 * numbers as a datasheet prints a material composition, with a bar in the
 * table so the ranking can be read without the ring.
 */
export default function Languages({ repos }) {
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
    <div id="languages" className="lang-split">
      <figure className="ds-figure lang-figure">
        <LanguageRing repos={repos} />
        <figcaption>
          <Caption n={8} as="span">
            Composition by language, all repositories. Point at a segment to
            read it out.
          </Caption>
        </figcaption>
      </figure>

      <div className="ds-table-wrap">
        <table className="ds-table lang-table">
          <caption>
            <Caption kind="Table" n={5} as="span">
              Composition, source bytes by language
            </Caption>
          </caption>
          <thead>
            <tr>
              <th scope="col" className="ds-num">#</th>
              <th scope="col">Language</th>
              <th scope="col" className="lang-bar-col"><span className="sr-only">Share, drawn</span></th>
              <th scope="col" className="ds-num">Share</th>
              <th scope="col" className="ds-num">Bytes</th>
            </tr>
          </thead>
          <tbody>
            {ranked.map(([name, value], index) => (
              <tr className="lang-row" key={name}>
                <td className="ds-num lang-rank">{index + 1}</td>
                <th scope="row" className="lang-name">
                  <span className="swatch" style={{ background: languageColor(name) }} aria-hidden="true" />
                  {name}
                </th>
                <td className="lang-bar" aria-hidden="true">
                  <span className="lang-bar-run" style={{ width: `${(value / largest) * 100}%`, background: languageColor(name) }} />
                </td>
                <td className="ds-num lang-share">{((value / grand) * 100).toFixed(1)}%</td>
                <td className="ds-num lang-bytes">{bytes(value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

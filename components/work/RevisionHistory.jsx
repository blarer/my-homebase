import { allRevisions } from '@/lib/revision';
import { Caption } from '@/components/ui/Section';

/**
 * Table 6, the revision history, from git log (lib/revisions.json, written
 * by scripts/sync-revisions.mjs). One revision per working day, newest
 * first, as a datasheet prints its changes. The day's last commit subject
 * stands for the revision; the rest are folded under a disclosure so the
 * table stays a table.
 */
export default function RevisionHistory() {
  const revs = allRevisions();
  return (
    <div className="ds-table-wrap">
      <table className="ds-table rev-table">
        <caption>
          <Caption kind="Table" n={6} as="span">
            Revision history, from the repository&apos;s git log
          </Caption>
        </caption>
        <thead>
          <tr>
            <th scope="col">REV</th>
            <th scope="col">Date</th>
            <th scope="col" className="ds-num">Commits</th>
            <th scope="col">Changes</th>
          </tr>
        </thead>
        <tbody>
          {revs.map((r) => (
            <tr key={r.rev}>
              <th scope="row" className="num">{r.rev}</th>
              <td className="num">{r.date}</td>
              <td className="ds-num">{r.commits}</td>
              <td>
                {r.subjects.length === 1 ? (
                  r.subjects[0]
                ) : (
                  <details className="rev-more">
                    <summary>{r.subjects[r.subjects.length - 1]}</summary>
                    <ul>
                      {r.subjects.slice(0, -1).reverse().map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </details>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

import { FIGURES, LIVE_FIGURES } from '@/lib/figures';

/**
 * List of figures, the way a monograph prints one after its title page:
 * number, title, dot leaders, and where the figure's result lands. Each row
 * links to its figure; Race opens a folded figure when its hash is followed.
 */
export default function FigureIndex() {
  const rows = [
    ...FIGURES.map((f) => ({ id: f.id, n: f.n, title: f.title, source: f.repoName, result: f.headline })),
    ...LIVE_FIGURES.map((f) => ({ id: f.id, n: f.n, title: f.title, source: 'GitHub API', result: f.unit })),
  ];

  return (
    <nav id="figures" className="section figure-index" aria-labelledby="figure-index-title">
      <div className="shell figure-index-inner">
      <h2 id="figure-index-title" className="figure-index-title">
        List of figures
      </h2>
      <ol className="figure-index-list">
        {rows.map((row, i) => (
          <li key={row.id} className="figure-index-row" style={{ '--i': i }}>
            <a href={`#${row.id}`} className="figure-index-link">
              <span className="num figure-index-n">{row.n}</span>
              <span className="figure-index-name">
                {row.title}
                <span className="figure-index-source num"> {row.source}</span>
              </span>
              <span className="figure-index-leader" aria-hidden="true" />
              <span className="num figure-index-result">{row.result}</span>
            </a>
          </li>
        ))}
      </ol>
      </div>
    </nav>
  );
}

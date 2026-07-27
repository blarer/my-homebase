'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { squarify } from '@/lib/treemap';
import { languageColor } from '@/lib/languageColors';

/**
 * Work as a treemap of the actual repositories, each tile sized by real source
 * bytes and split into language bands in the same proportion GitHub reports.
 *
 * This is the same shape storage-manager-swift draws for a disk, applied to the
 * work itself: the section is a demonstration of the tool, not a description.
 */

const NOTES = {
  'storage-manager-swift':
    'Rust core walks the filesystem with getattrlistbulk(2), batching attributes instead of one lstat per file. SwiftUI draws the treemap.',
  mp4trim:
    'Stream-copy trimming (-map 0 -c copy), so Dolby Vision and HDR10 metadata survive bit-exact. Falls back to ffmpeg frame previews when the system decoder chokes.',
  'nix-windows-config':
    'WSL2 plus home-manager, sharing modules 1:1 with the Darwin config. One bootstrap script rebuilds the whole Windows machine.',
  'my-homebase': 'This site. The treemap you are reading is its own component.',
};

function bytes(total) {
  if (total >= 1_000_000) return `${(total / 1_000_000).toFixed(1)} MB`;
  if (total >= 1_000) return `${Math.round(total / 1_000)} KB`;
  return `${total} B`;
}

function useMeasure() {
  const ref = useRef(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new ResizeObserver(([entry]) => {
      const box = entry.contentRect;
      setSize({ width: box.width, height: box.height });
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return [ref, size];
}

export default function Work({ repos }) {
  const [ref, size] = useMeasure();
  const [active, setActive] = useState(null);

  const items = useMemo(
    () =>
      repos.map((repo) => ({
        key: repo.name,
        value: Object.values(repo.languages).reduce((sum, n) => sum + n, 0),
        repo,
      })),
    [repos],
  );

  const total = items.reduce((sum, item) => sum + item.value, 0);

  const tiles = useMemo(() => {
    if (size.width < 1 || size.height < 1) return [];
    return squarify(items, { x: 0, y: 0, width: size.width, height: size.height });
  }, [items, size.width, size.height]);

  const current = active ?? tiles[0]?.key ?? null;
  const currentRepo = items.find((item) => item.key === current)?.repo ?? null;

  return (
    <section id="work" className="section">
      <div className="shell">
        <div className="section-head">
          <span className="tag">Work</span>
          <h2>Four repositories, drawn to scale</h2>
        </div>

        <p className="section-lede">
          Every tile is one repository, sized by its source bytes and split by
          language. <span className="num">{bytes(total)}</span> of code in total,
          measured from the GitHub API.
        </p>

        <div className="treemap-frame">
          <div className="treemap" ref={ref}>
            {tiles.map((tile) => {
              const langs = Object.entries(tile.repo.languages).sort((a, b) => b[1] - a[1]);
              const tileTotal = tile.value;
              let offset = 0;

              return (
                <button
                  key={tile.key}
                  type="button"
                  className="tile"
                  aria-pressed={current === tile.key}
                  style={{
                    left: `${(tile.x / size.width) * 100}%`,
                    top: `${(tile.y / size.height) * 100}%`,
                    width: `${(tile.width / size.width) * 100}%`,
                    height: `${(tile.height / size.height) * 100}%`,
                  }}
                  data-active={current === tile.key || undefined}
                  onClick={() => setActive(tile.key)}
                  onMouseEnter={() => setActive(tile.key)}
                  onFocus={() => setActive(tile.key)}
                >
                  <span className="tile-bands" aria-hidden="true">
                    {langs.map(([name, value]) => {
                      const height = (value / tileTotal) * 100;
                      const band = (
                        <span
                          key={name}
                          className="tile-band"
                          style={{
                            top: `${offset}%`,
                            height: `${height}%`,
                            background: languageColor(name),
                          }}
                        />
                      );
                      offset += height;
                      return band;
                    })}
                  </span>

                  <span className="tile-body">
                    <span className="tile-name">{tile.repo.name}</span>
                    <span className="num tile-size">{bytes(tile.value)}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {currentRepo && (
          <div className="readout" aria-live="polite">
            <div className="readout-key">
              <span className="num readout-pct">
                {((items.find((i) => i.key === current).value / total) * 100).toFixed(1)}%
              </span>
              <span className="tag">of all source</span>
            </div>

            <div className="readout-main">
              <h3 className="readout-name">
                <a href={currentRepo.url}>
                  {currentRepo.name}
                  <span className="readout-name-host"> on GitHub</span>
                </a>
              </h3>
              <p className="readout-note">{NOTES[currentRepo.name] ?? currentRepo.description}</p>
              <ul className="readout-langs">
                {Object.entries(currentRepo.languages)
                  .sort((a, b) => b[1] - a[1])
                  .map(([name, value]) => (
                    <li key={name}>
                      <span
                        className="swatch"
                        style={{ background: languageColor(name) }}
                        aria-hidden="true"
                      />
                      {name}
                      <span className="num readout-lang-size">{bytes(value)}</span>
                    </li>
                  ))}
              </ul>
            </div>

            <dl className="readout-meta">
              <div>
                <dt className="tag">Last push</dt>
                <dd className="num">{currentRepo.pushedAt}</dd>
              </div>
              <div>
                <dt className="tag">Started</dt>
                <dd className="num">{currentRepo.createdAt}</dd>
              </div>
            </dl>
          </div>
        )}
      </div>
    </section>
  );
}

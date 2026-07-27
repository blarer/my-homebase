"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { squarify } from "@/lib/treemap";
import { languageColor } from "@/lib/languageColors";

/**
 * Work as a treemap of the actual repositories, each tile sized by real source
 * bytes and split into language bands in the same proportion GitHub reports.
 *
 * This is the same shape storage-manager-swift draws for a disk, applied to the
 * work itself: the section is a demonstration of the tool, not a description.
 */

const NOTES = {
  "storage-manager-swift":
    "Rust core walks the filesystem with getattrlistbulk(2), batching attributes instead of one lstat per file. SwiftUI draws the treemap.",
  mp4trim:
    "Stream-copy trimming (-map 0 -c copy), so Dolby Vision and HDR10 metadata survive bit-exact. Falls back to ffmpeg frame previews when the system decoder chokes.",
  "nix-windows-config":
    "WSL2 plus home-manager, sharing modules 1:1 with the Darwin config. One bootstrap script rebuilds the whole Windows machine.",
  "my-homebase": "This site. The treemap you are reading is its own component.",
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

  // Which language band the pointer is actually over, and where to put the
  // label. Hovering a tile already tells you the repo; this answers the
  // question the colours raise but do not answer, which is what the colours
  // are. Null whenever the pointer is not over a band (keyboard focus, touch).
  const [probe, setProbe] = useState(null);

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
  const privateCount = repos.filter((repo) => repo.private).length;

  const tiles = useMemo(() => {
    if (size.width < 1 || size.height < 1) return [];
    return squarify(items, {
      x: 0,
      y: 0,
      width: size.width,
      height: size.height,
    });
  }, [items, size.width, size.height]);

  const current = active ?? tiles[0]?.key ?? null;
  const currentRepo = items.find((item) => item.key === current)?.repo ?? null;

  /**
   * Resolves a pointer position inside a tile to the language band under it.
   *
   * The bands are laid out top-down in descending size, so walking the same
   * cumulative fractions the renderer uses finds the band without storing
   * per-band geometry or adding a listener per band.
   */
  const probeTile = (event, tile) => {
    const box = event.currentTarget.getBoundingClientRect();
    if (box.height === 0) return;
    const fraction = (event.clientY - box.top) / box.height;

    const langs = Object.entries(tile.repo.languages).sort(
      (a, b) => b[1] - a[1],
    );
    let offset = 0;
    let hit = langs[langs.length - 1];
    for (const entry of langs) {
      offset += entry[1] / tile.value;
      if (fraction <= offset) {
        hit = entry;
        break;
      }
    }
    if (!hit) return;

    const frame = event.currentTarget.parentElement.getBoundingClientRect();
    setProbe({
      name: hit[0],
      value: hit[1],
      share: hit[1] / tile.value,
      repo: tile.repo.name,
      x: event.clientX - frame.left,
      y: event.clientY - frame.top,
    });
  };

  return (
    <section id="work" className="section">
      <div className="shell">
        <div className="section-head">
          <span className="tag">Work</span>
          <h2>{items.length} repositories, drawn to scale</h2>
        </div>

        <p className="section-lede">
          Every tile is one repository, sized by its source bytes and split by
          language. <span className="num">{bytes(total)}</span> of code in
          total, measured from the GitHub API.
          {privateCount > 0 && (
            <>
              {" "}
              {privateCount} of them are private and appear as shape only: the
              language mix and volume are real, the names and contents are not
              published.
            </>
          )}
        </p>

        <div className="treemap-frame">
          <div
            className="treemap"
            ref={ref}
            onMouseLeave={() => setProbe(null)}
          >
            {tiles.map((tile) => {
              const langs = Object.entries(tile.repo.languages).sort(
                (a, b) => b[1] - a[1],
              );
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
                  data-private={tile.repo.private || undefined}
                  onClick={() => setActive(tile.key)}
                  onMouseEnter={(event) => {
                    setActive(tile.key);
                    probeTile(event, tile);
                  }}
                  onMouseMove={(event) => probeTile(event, tile)}
                  onFocus={() => {
                    setActive(tile.key);
                    setProbe(null);
                  }}
                  onBlur={() => setProbe(null)}
                >
                  <span className="tile-bands" aria-hidden="true">
                    {langs.map(([name, value]) => {
                      const height = (value / tileTotal) * 100;
                      // Dim every band except the one under the pointer, so
                      // the tooltip and the colour it names are unambiguous.
                      const probed =
                        probe?.repo === tile.repo.name && probe.name === name;
                      const band = (
                        <span
                          key={name}
                          className="tile-band"
                          data-probed={probed || undefined}
                          data-dimmed={
                            (probe?.repo === tile.repo.name && !probed) ||
                            undefined
                          }
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
                    <span className="tile-name">
                      {tile.repo.private ? "private" : tile.repo.name}
                    </span>
                    <span className="num tile-size">{bytes(tile.value)}</span>
                  </span>
                </button>
              );
            })}

            {probe && (
              <span
                className="probe"
                // Positioned in the frame's own coordinates, and flipped to
                // the other side of the cursor near the right or bottom edge
                // so the label never leaves the treemap.
                style={{
                  left: probe.x,
                  top: probe.y,
                  transform: `translate(${probe.x > size.width - 150 ? "-100%" : "0"}, ${
                    probe.y > size.height - 60 ? "-100%" : "0"
                  }) translate(${probe.x > size.width - 150 ? "-12px" : "12px"}, ${
                    probe.y > size.height - 60 ? "-12px" : "12px"
                  })`,
                }}
                aria-hidden="true"
              >
                <span
                  className="swatch"
                  style={{ background: languageColor(probe.name) }}
                />
                {probe.name}
                <span className="num probe-share">
                  {(probe.share * 100).toFixed(0)}%
                </span>
                <span className="num probe-bytes">{bytes(probe.value)}</span>
              </span>
            )}
          </div>
        </div>

        {currentRepo && (
          <div className="readout" aria-live="polite">
            <div className="readout-key">
              <span className="num readout-pct">
                {(
                  (items.find((i) => i.key === current).value / total) *
                  100
                ).toFixed(1)}
                %
              </span>
              <span className="tag">of all source</span>
            </div>

            <div className="readout-main">
              <h3 className="readout-name">
                {currentRepo.private ? (
                  <span className="readout-private">
                    private repository
                    <span className="readout-name-host"> — not published</span>
                  </span>
                ) : (
                  <a href={currentRepo.url}>
                    {currentRepo.name}
                    <span className="readout-name-host"> on GitHub</span>
                  </a>
                )}
              </h3>
              <p className="readout-note">
                {currentRepo.private
                  ? "Counted, not shown. The language mix and volume are measured from the GitHub API like every other tile; the name and contents stay private."
                  : (NOTES[currentRepo.name] ?? currentRepo.description)}
              </p>
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
                      <span className="num readout-lang-size">
                        {bytes(value)}
                      </span>
                    </li>
                  ))}
              </ul>
            </div>

            <dl className="readout-meta">
              <div>
                <dt className="tag">Last push</dt>
                <dd className="num">{currentRepo.pushedAt ?? "—"}</dd>
              </div>
              <div>
                <dt className="tag">Started</dt>
                <dd className="num">{currentRepo.createdAt ?? "—"}</dd>
              </div>
            </dl>
          </div>
        )}
      </div>
    </section>
  );
}

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { squarify } from "@/lib/treemap";
import { languageColor } from "@/lib/languageColors";
import { bytes } from "@/lib/format";
import { VStack, HStack } from "@astryxdesign/core/Stack";
import { Grid } from "@astryxdesign/core/Grid";
import { Card } from "@astryxdesign/core/Card";
import { AspectRatio } from "@astryxdesign/core/AspectRatio";
import { Heading, Text } from "@astryxdesign/core/Text";
import { Code } from "@astryxdesign/core/Code";
import { Link } from "@astryxdesign/core/Link";
import { List, ListItem } from "@astryxdesign/core/List";
import { Icon } from "@astryxdesign/core/Icon";
import { StopIcon } from "@heroicons/react/24/solid";

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

export default function Treemap({ repos }) {
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

  const currentShare = currentRepo
    ? ((items.find((i) => i.key === current).value / total) * 100).toFixed(1)
    : null;

  return (
    <VStack gap={4} id="work">
      <VStack gap={1}>
        <Heading level={2}>{`${items.length} repositories, drawn to scale`}</Heading>
        <Text type="supporting">Fig. 5 · Work</Text>
      </VStack>
      <Text as="p" color="secondary" textWrap="pretty">
        Every tile is one repository, sized by its source bytes and split by
        language. <Code size="inherit">{bytes(total)}</Code> of code in total,
        measured from the GitHub API.
        {privateCount > 0 &&
          ` ${privateCount} of them are private and appear as shape only: the language mix and volume are real, the names and contents are not published.`}
      </Text>

      <Card padding={0}>
        <AspectRatio ratio={16 / 9}>
          {/* Tile geometry comes from the squarify layout at run time, so it
              is the one place on the site that positions elements by hand:
              percentages from lib/treemap.js, colours from the theme tokens
              and the Linguist palette. */}
          <VStack ref={ref} width="100%" height="100%" onMouseLeave={() => setProbe(null)} style={STYLES.frame}>
            {tiles.map((tile) => {
              const langs = Object.entries(tile.repo.languages).sort((a, b) => b[1] - a[1]);
              const probedTile = probe?.repo === tile.repo.name;
              const selected = current === tile.key;
              let offset = 0;
              return (
                <button
                  key={tile.key}
                  type="button"
                  aria-pressed={selected}
                  aria-label={`${tile.repo.private ? 'private repository' : tile.repo.name}, ${bytes(tile.value)}`}
                  style={{
                    ...STYLES.tile,
                    left: `${(tile.x / size.width) * 100}%`,
                    top: `${(tile.y / size.height) * 100}%`,
                    width: `${(tile.width / size.width) * 100}%`,
                    height: `${(tile.height / size.height) * 100}%`,
                    outline: selected ? 'var(--border-width) solid var(--color-accent)' : undefined,
                  }}
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
                  {langs.map(([name, value]) => {
                    const height = (value / tile.value) * 100;
                    const dimmed = probedTile && probe.name !== name;
                    const band = (
                      <VStack
                        key={name}
                        aria-hidden="true"
                        style={{
                          ...STYLES.band,
                          top: `${offset}%`,
                          height: `${height}%`,
                          background: languageColor(name),
                          opacity: dimmed ? 0.35 : 1,
                        }}
                      />
                    );
                    offset += height;
                    return band;
                  })}
                  <VStack gap={0} padding={1} style={STYLES.label}>
                    <Text type="label" maxLines={1} hasTruncateTooltip={false}>
                      {tile.repo.private ? 'private' : tile.repo.name}
                    </Text>
                    <Text type="code" size="xsm" color="secondary" hasTruncateTooltip={false}>{bytes(tile.value)}</Text>
                  </VStack>
                </button>
              );
            })}

            {probe && (
              <HStack
                gap={1}
                padding={1}
                vAlign="center"
                aria-hidden="true"
                style={{
                  ...STYLES.probe,
                  transform: `translate3d(${probe.x}px, ${probe.y}px, 0) translate(${
                    probe.x > size.width - 150 ? 'calc(-100% - var(--spacing-3))' : 'var(--spacing-3)'
                  }, ${probe.y > size.height - 60 ? 'calc(-100% - var(--spacing-3))' : 'var(--spacing-3)'})`,
                }}
              >
                <Icon icon={StopIcon} size="xsm" style={{ color: languageColor(probe.name) }} />
                <Text type="label">{probe.name}</Text>
                <Text type="code" color="secondary">{(probe.share * 100).toFixed(0)}%</Text>
                <Text type="code" color="secondary">{bytes(probe.value)}</Text>
              </HStack>
            )}
          </VStack>
        </AspectRatio>
      </Card>

      {currentRepo && (
        <Card aria-live="polite">
          <Grid columns={{ minWidth: 220, repeat: 'fit' }} gap={6} align="start">
            <VStack gap={0.5}>
              <Heading level={3} color="accent">{currentShare}%</Heading>
              <Text type="supporting">of all source</Text>
            </VStack>
            <VStack gap={2}>
              <Heading level={3}>
                {currentRepo.private ? (
                  'Private repository, not published'
                ) : (
                  <Link href={currentRepo.url} type="inherit">{currentRepo.name} on GitHub</Link>
                )}
              </Heading>
              <Text as="p" color="secondary" textWrap="pretty">
                {currentRepo.private
                  ? 'Counted, not shown. The language mix and volume are measured from the GitHub API like every other tile; the name and contents stay private.'
                  : (NOTES[currentRepo.name] ?? currentRepo.description)}
              </Text>
              <List density="compact">
                {Object.entries(currentRepo.languages)
                  .sort((a, b) => b[1] - a[1])
                  .map(([name, value]) => (
                    <ListItem
                      key={name}
                      label={name}
                      startContent={<Icon icon={StopIcon} size="xsm" style={{ color: languageColor(name) }} />}
                      endContent={<Text type="code" color="secondary">{bytes(value)}</Text>}
                    />
                  ))}
              </List>
            </VStack>
            <VStack gap={2}>
              <VStack gap={0}>
                <Text type="supporting">Last push</Text>
                <Text type="code">{currentRepo.pushedAt ?? '—'}</Text>
              </VStack>
              <VStack gap={0}>
                <Text type="supporting">Started</Text>
                <Text type="code">{currentRepo.createdAt ?? '—'}</Text>
              </VStack>
            </VStack>
          </Grid>
        </Card>
      )}
    </VStack>
  );
}

// Positioning only; every colour and length is a theme token.
const STYLES = {
  frame: { position: 'relative', overflow: 'hidden' },
  tile: {
    position: 'absolute',
    padding: 0,
    border: 'var(--border-width) solid var(--color-background-card)',
    background: 'var(--color-background-muted)',
    overflow: 'hidden',
    cursor: 'pointer',
    outlineOffset: 'calc(-2 * var(--border-width))',
  },
  band: { position: 'absolute', insetInline: 0 },
  label: {
    position: 'relative',
    alignItems: 'flex-start',
    background: 'var(--color-background-card)',
    borderEndEndRadius: 'var(--radius-inner)',
    maxWidth: '100%',
  },
  probe: {
    position: 'absolute',
    left: 0,
    top: 0,
    pointerEvents: 'none',
    background: 'var(--color-background-popover)',
    borderRadius: 'var(--radius-element)',
    boxShadow: 'var(--shadow-med)',
    whiteSpace: 'nowrap',
  },
};

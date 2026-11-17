'use client';

import { VStack, HStack } from '@astryxdesign/core/Stack';
import { Grid } from '@astryxdesign/core/Grid';
import { Card } from '@astryxdesign/core/Card';
import { Heading, Text } from '@astryxdesign/core/Text';
import { Table, proportional, pixel } from '@astryxdesign/core/Table';
import { ProgressBar } from '@astryxdesign/core/ProgressBar';
import { Icon } from '@astryxdesign/core/Icon';
import { StopIcon } from '@heroicons/react/24/solid';
import { languageColor } from '@/lib/languageColors';
import { bytes } from '@/lib/format';
import LanguageRing from '@/components/work/LanguageRing';

/**
 * Languages, counted rather than claimed: only what is actually in the
 * repositories, ordered by how much of it there is. The ring shows the
 * shape of the whole; the table gives the exact figures.
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

  const rows = ranked.map(([name, value], index) => ({
    id: name,
    rank: String(index + 1).padStart(2, '0'),
    name,
    value,
    share: `${((value / grand) * 100).toFixed(1)}%`,
    size: bytes(value),
  }));

  const columns = [
    { key: 'rank', header: '#', width: pixel(48), renderCell: (r) => <Text type="code" color="secondary">{r.rank}</Text> },
    {
      key: 'name',
      header: 'Language',
      width: pixel(160),
      renderCell: (r) => (
        <HStack gap={2} vAlign="center">
          {/* The swatch is the language's Linguist colour: data, not decoration. */}
          <Icon icon={StopIcon} size="xsm" style={{ color: languageColor(r.name) }} />
          <Text>{r.name}</Text>
        </HStack>
      ),
    },
    {
      key: 'value',
      header: 'Volume',
      width: proportional(1),
      renderCell: (r) => (
        <ProgressBar label={`${r.name} source bytes`} isLabelHidden value={r.value} max={largest} variant="neutral" />
      ),
    },
    { key: 'share', header: 'Share', width: pixel(72), align: 'end', renderCell: (r) => <Text type="code" hasTabularNumbers>{r.share}</Text> },
    { key: 'size', header: 'Bytes', width: pixel(88), align: 'end', renderCell: (r) => <Text type="code" hasTabularNumbers>{r.size}</Text> },
  ];

  return (
    <VStack gap={4} id="languages">
      <VStack gap={1}>
        <Heading level={2}>What the work is actually written in</Heading>
        <Text type="supporting">Fig. 6 · Languages</Text>
      </VStack>
      <Grid columns={{ minWidth: 300, repeat: 'fit' }} gap={4} align="start">
        <Card>
          <LanguageRing repos={repos} />
        </Card>
        <Card padding={2}>
          <Table data={rows} columns={columns} idKey="id" density="compact" dividers="rows" hasHover />
        </Card>
      </Grid>
    </VStack>
  );
}

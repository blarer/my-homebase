'use client';

import { VStack } from '@astryxdesign/core/Stack';
import { Card } from '@astryxdesign/core/Card';
import { Heading, Text } from '@astryxdesign/core/Text';
import { Link } from '@astryxdesign/core/Link';
import { Table, proportional, pixel } from '@astryxdesign/core/Table';
import { FIGURES, LIVE_FIGURES } from '@/lib/figures';

/**
 * The list of figures, after the dashboard template's TableCard: number,
 * title, source and where the result lands. Each title links to its figure.
 */
const rows = [
  ...FIGURES.map((f) => ({ id: f.id, n: f.n, title: f.title, source: f.repoName, result: f.headline })),
  ...LIVE_FIGURES.map((f) => ({ id: f.id, n: f.n, title: f.title, source: 'GitHub API', result: f.unit })),
];

const columns = [
  { key: 'n', header: 'Fig.', width: pixel(56), renderCell: (r) => <Text type="code" color="secondary">{r.n}</Text> },
  { key: 'title', header: 'Figure', width: proportional(2), renderCell: (r) => <Link href={`#${r.id}`}>{r.title}</Link> },
  { key: 'source', header: 'Source', width: proportional(1), renderCell: (r) => <Text type="code" color="secondary">{r.source}</Text> },
  { key: 'result', header: 'Result', width: pixel(140), align: 'end', renderCell: (r) => <Text type="code">{r.result}</Text> },
];

export default function FigureTable() {
  return (
    <Card>
      <VStack gap={4}>
        <Heading level={2} id="figures">List of figures</Heading>
        <Table data={rows} columns={columns} idKey="id" density="compact" dividers="rows" hasHover />
      </VStack>
    </Card>
  );
}

'use client';

import { Text } from '@astryxdesign/core/Text';
import { List, ListItem } from '@astryxdesign/core/List';
import { Table, proportional, pixel } from '@astryxdesign/core/Table';
import { allRevisions } from '@/lib/revision';
import { TableBlock } from '@/components/ui/Section';

/**
 * Table 6, the revision history, from git log (lib/revisions.json, written
 * by scripts/sync-revisions.mjs). One revision per working day, newest
 * first, as a datasheet prints its changes: every change listed in full,
 * newest first within the day. REV, date and count are narrow fixed
 * columns; the changes take the rest of the width.
 */
const columns = [
  {
    key: 'rev',
    header: 'REV',
    width: pixel(56),
    renderCell: (r) => <Text type="code" color={r.latest ? 'accent' : 'primary'}>{r.rev}</Text>,
  },
  { key: 'date', header: 'Date', width: pixel(112), renderCell: (r) => <Text type="code">{r.date}</Text> },
  {
    key: 'commits',
    header: 'Commits',
    width: pixel(80),
    align: 'end',
    renderCell: (r) => <Text type="code" hasTabularNumbers>{r.commits}</Text>,
  },
  {
    key: 'subjects',
    header: 'Changes',
    width: proportional(1, { minWidth: 360 }),
    renderCell: (r) =>
      r.subjects.length === 1 ? (
        <Text>{r.subjects[0]}</Text>
      ) : (
        <List density="compact" listStyle="disc">
          {[...r.subjects].reverse().map((s, j) => (
            <ListItem key={j} label={<Text textWrap="pretty">{s}</Text>} align="first-line" />
          ))}
        </List>
      ),
  },
];

export default function RevisionHistory() {
  const rows = allRevisions().map((r, i) => ({ ...r, id: r.rev, latest: i === 0 }));
  return (
    <TableBlock n={6} minWidth={640} caption="Revision history, from the repository's git log">
      <Table data={rows} columns={columns} idKey="id" density="compact" dividers="rows" verticalAlign="top" />
    </TableBlock>
  );
}

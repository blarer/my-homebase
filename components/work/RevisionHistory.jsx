import { Text } from '@astryxdesign/core/Text';
import { List, ListItem } from '@astryxdesign/core/List';
import { Table, TableHeader, TableBody, TableRow, TableHeaderCell, TableCell } from '@astryxdesign/core/Table';
import { allRevisions } from '@/lib/revision';
import { TableBlock } from '@/components/ui/Section';

/**
 * Table 6, the revision history, from git log (lib/revisions.json, written
 * by scripts/sync-revisions.mjs). One revision per working day, newest
 * first, as a datasheet prints its changes: every change listed in full,
 * newest first within the day.
 */
export default function RevisionHistory() {
  const revs = allRevisions();
  return (
    <TableBlock n={6} minWidth={640} caption="Revision history, from the repository's git log">
      <Table density="compact" dividers="rows" verticalAlign="top">
        <TableHeader>
          <TableRow isHeaderRow>
            <TableHeaderCell scope="col">REV</TableHeaderCell>
            <TableHeaderCell scope="col">Date</TableHeaderCell>
            <TableHeaderCell scope="col">Commits</TableHeaderCell>
            <TableHeaderCell scope="col">Changes</TableHeaderCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {revs.map((r, i) => (
            <TableRow key={r.rev}>
              <TableHeaderCell scope="row">
                <Text type="code" color={i === 0 ? 'accent' : 'primary'}>{r.rev}</Text>
              </TableHeaderCell>
              <TableCell><Text type="code">{r.date}</Text></TableCell>
              <TableCell><Text type="code" hasTabularNumbers>{r.commits}</Text></TableCell>
              <TableCell>
                {r.subjects.length === 1 ? (
                  <Text>{r.subjects[0]}</Text>
                ) : (
                  <List density="compact" listStyle="disc">
                    {[...r.subjects].reverse().map((s, j) => (
                      <ListItem key={j} label={<Text textWrap="pretty">{s}</Text>} align="first-line" />
                    ))}
                  </List>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableBlock>
  );
}

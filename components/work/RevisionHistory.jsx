import { VStack } from '@astryxdesign/core/Stack';
import { Card } from '@astryxdesign/core/Card';
import { Text } from '@astryxdesign/core/Text';
import { Collapsible } from '@astryxdesign/core/Collapsible';
import { List, ListItem } from '@astryxdesign/core/List';
import { Table, TableHeader, TableBody, TableRow, TableHeaderCell, TableCell } from '@astryxdesign/core/Table';
import { allRevisions } from '@/lib/revision';
import { Caption } from '@/components/ui/Section';

/**
 * Table 6, the revision history, from git log (lib/revisions.json, written
 * by scripts/sync-revisions.mjs). One revision per working day, newest
 * first, as a datasheet prints its changes. The day's last commit subject
 * stands for the revision; the rest fold under a Collapsible so the table
 * stays a table.
 */
export default function RevisionHistory() {
  const revs = allRevisions();
  return (
    <VStack gap={2}>
      <Caption kind="Table" n={6}>
        Revision history, from the repository&apos;s git log
      </Caption>
      <Card padding={0}>
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
                    <Collapsible
                      defaultIsOpen={false}
                      chevronPosition="start"
                      trigger={<Text>{r.subjects[r.subjects.length - 1]}</Text>}
                    >
                      <List density="compact" listStyle="disc">
                        {r.subjects.slice(0, -1).reverse().map((s, j) => (
                          <ListItem key={j} label={s} />
                        ))}
                      </List>
                    </Collapsible>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </VStack>
  );
}

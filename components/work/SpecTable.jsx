import { FIGURES } from '@/lib/figures';
import { totals } from '@/lib/datasheet';
import { bytes } from '@/lib/format';
import { Caption } from '@/components/ui/Section';
import { VStack } from '@astryxdesign/core/Stack';
import { Card } from '@astryxdesign/core/Card';
import { Text } from '@astryxdesign/core/Text';
import { Link } from '@astryxdesign/core/Link';
import { Table, TableHeader, TableBody, TableRow, TableHeaderCell, TableCell } from '@astryxdesign/core/Table';

/**
 * Table 4, Electrical Characteristics, in the form every datasheet prints:
 * parameter, test conditions, MIN / TYP / MAX, unit.
 *
 * Honesty rule for the columns: a benchmark that was run as one measurement
 * has one value, so it goes in TYP and MIN / MAX stay empty. Only the
 * repository rows have a real spread (smallest, median, largest repository),
 * so only they fill all three. Nothing is interpolated to make a row look
 * complete.
 */
const fig = (id) => FIGURES.find((f) => f.id === id);
const run = (id, label) => fig(id).runs.find((r) => r.label === label).value;

const mb = (v) => (v / 1_000_000).toFixed(2);
const kb = (v) => Math.round(v / 1_000);

export default function SpecTable({ repos }) {
  const t = totals(repos);

  const groups = [
    {
      title: 'Disk scan (storage-manager-swift)',
      ref: 'benchmark',
      rows: [
        { p: 'Scan time, getattrlistbulk', c: '296 GB, 956k files, one machine', typ: run('benchmark', 'storage-manager'), unit: 's', mine: true },
        { p: 'Scan time, parallel read_dir + lstat', c: 'Same tree', typ: run('benchmark', 'parallel read_dir + lstat'), unit: 's' },
        { p: 'Scan time, du -sk', c: 'Same tree', typ: run('benchmark', 'du -sk'), unit: 's' },
        { p: 'Speed-up over du', c: 'Ratio of the above', typ: '10.3', unit: '×', mine: true },
      ],
    },
    {
      title: 'Dictation latency (on-device, private)',
      ref: 'dictation',
      rows: [
        { p: 'Key release to text, edit-by-voice', c: 'M4 Pro, selection rewritten in place', typ: run('dictation', 'edit-by-voice'), unit: 'ms', mine: true },
        { p: 'Key release to text, dictation', c: 'Accessibility write, native field', typ: run('dictation', 'dictation'), unit: 'ms' },
        { p: 'Key release to text, clipboard fallback', c: 'Unfocused app, paste', typ: run('dictation', 'clipboard fallback'), unit: 'ms' },
        { p: 'Aqua Voice insert latency', c: 'Advertised, not measured here', typ: run('dictation', 'Aqua Voice'), unit: 'ms' },
      ],
    },
    {
      title: 'Menu bar meter (wattsbar)',
      ref: 'footprint',
      rows: [
        { p: 'Resident memory, Swift + IOKit', c: 'At rest, Activity Monitor', typ: run('footprint', 'Swift + IOKit'), unit: 'MB', mine: true },
        { p: 'Resident memory, Python + rumps', c: 'At rest, Activity Monitor', typ: run('footprint', 'Python + rumps'), unit: 'MB' },
        { p: 'Sensor read interval', c: 'SMC, live watts', typ: 1, unit: 's' },
      ],
    },
    {
      title: 'Clip encode (mp4trim)',
      ref: 'clip',
      rows: [
        { p: 'Output size, Free tier', c: '10 MB limit, 540p30', typ: run('clip', 'Free, 10 MB'), max: 10, unit: 'MB', mine: true },
        { p: 'Output size, Nitro Basic', c: '50 MB limit, 1080p60', typ: run('clip', 'Nitro Basic, 50 MB'), max: 50, unit: 'MB' },
        { p: 'Output size, lossless trim', c: 'Stream copy of 51.5 s source', typ: run('clip', 'Lossless trim'), unit: 'MB' },
        { p: 'Encode budget', c: 'Share of limit, before audio', typ: 93, unit: '%' },
      ],
    },
    {
      title: 'Source (all repositories, GitHub API)',
      ref: 'floorplan',
      rows: [
        { p: 'Source per repository', c: `${t.repos} repositories`, min: kb(t.min), typ: kb(t.median), max: kb(t.max), unit: 'KB' },
        { p: 'Total source', c: `Snapshot, ${t.repos} public repositories`, typ: mb(t.bytes), unit: 'MB', mine: true },
        { p: 'Languages', c: 'Distinct, as GitHub reports', typ: t.languages, unit: '' },
      ],
    },
  ];

  const num = (v, mine) => (
    <Text type="code" hasTabularNumbers color={mine ? 'accent' : 'primary'} weight={mine ? 'semibold' : undefined}>
      {v ?? ''}
    </Text>
  );

  return (
    <VStack gap={2}>
      <Caption kind="Table" n={4}>
        Electrical characteristics. Single measurements are listed as TYP; MIN
        and MAX are given only where a real spread or limit exists.
      </Caption>
      <Card padding={0}>
        <Table density="compact" dividers="rows">
          <TableHeader>
            <TableRow isHeaderRow>
              <TableHeaderCell scope="col">Parameter</TableHeaderCell>
              <TableHeaderCell scope="col">Test conditions</TableHeaderCell>
              <TableHeaderCell scope="col">MIN</TableHeaderCell>
              <TableHeaderCell scope="col">TYP</TableHeaderCell>
              <TableHeaderCell scope="col">MAX</TableHeaderCell>
              <TableHeaderCell scope="col">UNIT</TableHeaderCell>
            </TableRow>
          </TableHeader>
          {groups.map((g) => (
            <TableBody key={g.title}>
              <TableRow>
                <TableHeaderCell scope="rowgroup" colSpan={6}>
                  <Link href={`#${g.ref}`} type="label">{g.title}</Link>
                </TableHeaderCell>
              </TableRow>
              {g.rows.map((r) => (
                <TableRow key={r.p}>
                  <TableHeaderCell scope="row">
                    <Text type="body" weight="normal">{r.p}</Text>
                  </TableHeaderCell>
                  <TableCell><Text type="supporting">{r.c}</Text></TableCell>
                  <TableCell>{num(r.min)}</TableCell>
                  <TableCell>{num(r.typ, r.mine)}</TableCell>
                  <TableCell>{num(r.max)}</TableCell>
                  <TableCell><Text type="code" color="secondary">{r.unit}</Text></TableCell>
                </TableRow>
              ))}
            </TableBody>
          ))}
        </Table>
      </Card>
      <Text as="p" type="supporting">
        Total source {bytes(t.bytes, 2)}. Benchmark values are quoted from each
        repository&apos;s README, where the method is written up.
      </Text>
    </VStack>
  );
}

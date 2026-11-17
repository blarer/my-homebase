import { VStack, HStack } from '@astryxdesign/core/Stack';
import { Text } from '@astryxdesign/core/Text';
import { Link } from '@astryxdesign/core/Link';
import { List, ListItem } from '@astryxdesign/core/List';
import { Avatar } from '@astryxdesign/core/Avatar';
import { Table, TableHeader, TableBody, TableRow, TableHeaderCell, TableCell } from '@astryxdesign/core/Table';
import TitleBlock from '@/components/sheet/TitleBlock';
import SheetFooter from '@/components/sheet/SheetFooter';
import Section, { TableBlock } from '@/components/ui/Section';
import BlockDiagram from '@/components/home/BlockDiagram';
import Pinout from '@/components/home/Pinout';
import { PART, TITLE, totals } from '@/lib/datasheet';
import { FIGURES } from '@/lib/figures';
import { bytes } from '@/lib/format';
import snapshot from '@/lib/repos.json';

export const metadata = {
  title: 'BLARE-1 datasheet: systems-software engineer',
  description:
    'I write systems software and the tools around it. Each project got faster by removing work, not by adding threads. Datasheet page 1: features, description, block diagram, pins.',
};

const fig = (id) => FIGURES.find((f) => f.id === id);

/** A measured value in running text, linked to the figure that measured it. */
const Measured = ({ id }) => (
  <Link href={`/work/#${id}`} type="code">
    {fig(id).headline}
  </Link>
);
const Num = ({ children }) => <Text type="code" color="inherit">{children}</Text>;
// A node label wraps; a plain-string label would be cut to one line.
const Bullet = ({ children }) => <ListItem label={<Text textWrap="pretty">{children}</Text>} align="first-line" />;

const ORDERING = [
  { part: 'BLARE-1/WORK', href: '/work/', pkg: 'Datasheet page 2', contents: 'Benchmarks, timing diagrams, die floorplan, composition' },
  { part: 'BLARE-1/GH', href: 'https://github.com/blarer', pkg: 'github.com/blarer', contents: null },
  { part: 'BLARE-1/MAIL', href: 'mailto:blare@louds.net', pkg: 'blare@louds.net', contents: 'Direct contact' },
];

/**
 * Page 1 of the datasheet, laid out from the `documentation-technical`
 * template: title block, then numbered sections. The first screen is the
 * part's front page, Features and Applications beside the block diagram.
 */
export default function Home() {
  const t = totals(snapshot.repos);
  return (
    <VStack gap={10} as="main" id="main" tabIndex={-1} maxWidth={1120}>
      <TitleBlock part={PART} title={TITLE}>
        Blare <Num>(blarer)</Num>. Systems programmer. I build the tools I wish
        I had, then measure whether they were worth building.
      </TitleBlock>

      <BlockDiagram>
        <VStack gap={8}>
          <Section id="features" n="1" title="Features">
            <List listStyle="disc">
              <Bullet>Fixes live one layer below where people usually look: syscalls, stream copy, transport, direct sensor reads</Bullet>
              <Bullet>Disk scan <Measured id="benchmark" /> than <Num>du</Num> on 296 GB, 956k files</Bullet>
              <Bullet>Key release to text on screen in <Measured id="dictation" />, fully local</Bullet>
              <Bullet>Menu bar meter at <Measured id="footprint" /> after a native rewrite</Bullet>
              <Bullet>Every Discord tier hit, <Measured id="clip" /> on the free limit</Bullet>
              <Bullet>
                <Num>{bytes(t.bytes)}</Num> of source across <Num>{t.repos}</Num> repositories
                and <Num>{t.languages}</Num> languages, counted from the GitHub API
              </Bullet>
              <Bullet>Every value on this sheet is measured or linked to its source</Bullet>
            </List>
          </Section>

          <Section id="applications" n="2" title="Applications">
            <List listStyle="disc" density="compact">
              <Bullet>Systems software and the tools around it</Bullet>
              <Bullet>Performance work: finding the work to remove</Bullet>
              <Bullet>Native macOS tooling (Swift, IOKit, Accessibility)</Bullet>
              <Bullet>Rust cores behind native front ends</Bullet>
              <Bullet>Reproducible machine configuration (Nix)</Bullet>
            </List>
          </Section>
        </VStack>
      </BlockDiagram>

      <Section id="about" n="3" title="Description">
        <HStack gap={6} vAlign="start" wrap="wrap">
          <VStack gap={1} hAlign="center" as="figure">
            <Avatar src="/avatar.png" name="Blare" size={112} shape="square" />
            <Text type="code" color="secondary">blarer</Text>
          </VStack>
          <VStack gap={3} maxWidth={680}>
            <Text as="p" textWrap="pretty">
              I write systems software and the tools around it. Most of what I
              build starts the same way: something on my own machine is slower,
              heavier, or more fragile than it should be, and the fix turns out
              to live a layer below where people usually look.
            </Text>
            <Text as="p" textWrap="pretty">
              The disk scanner was a syscall problem, not a UI problem. The
              video trimmer was a stream-copy problem, not an encoding problem.
              The voice dictation tool was a transport problem: recognition was
              already local and fast, and the latency was in how the text got
              into the field. The battery meter was a polling problem, so it
              reads the power sensors directly instead of waiting on the gauge.
              Each one got faster by removing work, not by adding threads.
            </Text>
            <Text as="p" textWrap="pretty">
              Right now I&apos;m reading into machine learning properly:
              transformer internals, self-attention, how inference actually
              spends its time, and where agents break down. I use AI daily and
              want to understand the machine underneath it rather than treat it
              as a box that returns answers.
            </Text>
            <Text as="p" type="supporting" color="secondary">
              Measured characteristics are on page 2: see{' '}
              <Link href="/work/#specifications" type="inherit">6 Specifications</Link>.
            </Text>
          </VStack>
        </HStack>
      </Section>

      <Section id="pins" n="4" title="Pin Configuration and Functions">
        <Pinout />
      </Section>

      <Section id="ordering" n="5" title="Ordering Information">
        <TableBlock n={3} caption="Ordering information">
          <Table density="compact" dividers="rows">
            <TableHeader>
              <TableRow isHeaderRow>
                <TableHeaderCell scope="col">Orderable part</TableHeaderCell>
                <TableHeaderCell scope="col">Package</TableHeaderCell>
                <TableHeaderCell scope="col">Contents</TableHeaderCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ORDERING.map((o) => (
                <TableRow key={o.part}>
                  <TableHeaderCell scope="row">
                    <Link href={o.href} type="code">{o.part}</Link>
                  </TableHeaderCell>
                  <TableCell><Text type="code" color="secondary">{o.pkg}</Text></TableCell>
                  <TableCell>
                    <Text type="supporting">
                      {o.contents ?? <><Num>{t.repos}</Num> public repositories, source and method</>}
                    </Text>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableBlock>
      </Section>

      <SheetFooter page="1" syncedAt={snapshot.syncedAt} />
    </VStack>
  );
}

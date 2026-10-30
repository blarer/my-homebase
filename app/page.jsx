import Image from 'next/image';
import Link from 'next/link';
import SheetHeader from '@/components/sheet/SheetHeader';
import SheetFooter from '@/components/sheet/SheetFooter';
import Section, { Caption } from '@/components/ui/Section';
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

/**
 * Page 1 of the datasheet. The first viewport is the part's front page:
 * title block, Features, Applications and the start of the Description in
 * the left column, the functional block diagram in the right, the way
 * page 1 of every IC datasheet is laid out.
 */
export default function Home() {
  const t = totals(snapshot.repos);
  return (
    <>
      <SheetHeader page="1" />
      <main id="main" tabIndex={-1} className="sheet">
        <div className="ds-title">
          <h1 className="ds-h1">
            <span className="ds-h1-part num">{PART}</span>
            <span className="ds-h1-name">{TITLE}</span>
          </h1>
          <p className="ds-title-meta">
            Blare <span className="num">(blarer)</span>. Systems programmer. I
            build the tools I wish I had, then measure whether they were worth
            building.
          </p>
        </div>

        <div className="ds-cols ds-front">
          <div className="ds-col">
            <Section id="features" n="1" title="Features">
              <ul className="ds-bullets">
                <li>
                  Fixes live one layer below where people usually look: syscalls,
                  stream copy, transport, direct sensor reads
                </li>
                <li>
                  Disk scan <Link className="ds-measured" href="/work/#benchmark">{fig('benchmark').headline}</Link>{' '}
                  than <span className="num">du</span> on 296 GB, 956k files
                </li>
                <li>
                  Key release to text on screen in{' '}
                  <Link className="ds-measured" href="/work/#dictation">{fig('dictation').headline}</Link>, fully local
                </li>
                <li>
                  Menu bar meter at{' '}
                  <Link className="ds-measured" href="/work/#footprint">{fig('footprint').headline}</Link>{' '}
                  after a native rewrite
                </li>
                <li>
                  Every Discord tier hit, <Link className="ds-measured" href="/work/#clip">{fig('clip').headline}</Link>{' '}
                  on the free limit
                </li>
                <li>
                  <span className="num">{bytes(t.bytes)}</span> of source across{' '}
                  <span className="num">{t.repos}</span> repositories and{' '}
                  <span className="num">{t.languages}</span> languages, counted
                  from the GitHub API
                </li>
                <li>Every value on this sheet is measured or linked to its source</li>
              </ul>
            </Section>

            <Section id="applications" n="2" title="Applications">
              <ul className="ds-bullets ds-bullets-tight">
                <li>Systems software and the tools around it</li>
                <li>Performance work: finding the work to remove</li>
                <li>Native macOS tooling (Swift, IOKit, Accessibility)</li>
                <li>Rust cores behind native front ends</li>
                <li>Reproducible machine configuration (Nix)</li>
              </ul>
            </Section>
          </div>

          <div className="ds-col">
            <BlockDiagram />
          </div>
        </div>

        <div className="ds-cols">
          <div className="ds-col ds-col-wide">
            <Section id="about" n="3" title="Description">
              <div className="ds-desc">
                <figure className="ds-portrait">
                  <Image src="/avatar.png" alt="Blare" width={256} height={256} sizes="112px" />
                  <figcaption className="num">blarer</figcaption>
                </figure>
                <p>
                  I write systems software and the tools around it. Most of what I
                  build starts the same way: something on my own machine is slower,
                  heavier, or more fragile than it should be, and the fix turns out
                  to live a layer below where people usually look.
                </p>
                <p>
                  The disk scanner was a syscall problem, not a UI problem. The
                  video trimmer was a stream-copy problem, not an encoding problem.
                  The voice dictation tool was a transport problem: recognition was
                  already local and fast, and the latency was in how the text got
                  into the field. The battery meter was a polling problem, so it
                  reads the power sensors directly instead of waiting on the gauge.
                  Each one got faster by removing work, not by adding threads.
                </p>
                <p>
                  Right now I&apos;m reading into machine learning properly:
                  transformer internals, self-attention, how inference actually
                  spends its time, and where agents break down. I use AI daily and
                  want to understand the machine underneath it rather than treat it
                  as a box that returns answers.
                </p>
                <p className="ds-xref">
                  Measured characteristics are on page 2: see{' '}
                  <Link href="/work/#specifications">6 Specifications</Link>.
                </p>
              </div>
            </Section>
          </div>
        </div>

        <Section id="pins" n="4" title="Pin Configuration and Functions">
          <Pinout />
        </Section>

        <Section id="ordering" n="5" title="Ordering Information">
          <div className="ds-table-wrap">
            <table className="ds-table">
              <caption>
                <Caption kind="Table" n={3} as="span">
                  Ordering information
                </Caption>
              </caption>
              <thead>
                <tr>
                  <th scope="col">Orderable part</th>
                  <th scope="col">Package</th>
                  <th scope="col">Contents</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">
                    <Link href="/work/" className="num ds-order">BLARE-1/WORK</Link>
                  </th>
                  <td>Datasheet page 2</td>
                  <td>Benchmarks, timing diagrams, die floorplan, composition</td>
                </tr>
                <tr>
                  <th scope="row">
                    <a href="https://github.com/blarer" className="num ds-order">BLARE-1/GH</a>
                  </th>
                  <td>github.com/blarer</td>
                  <td>
                    <span className="num">{t.publicRepos}</span> public repositories, source and method
                  </td>
                </tr>
                <tr>
                  <th scope="row">
                    <a href="mailto:blare@louds.net" className="num ds-order">BLARE-1/MAIL</a>
                  </th>
                  <td>blare@louds.net</td>
                  <td>Direct contact</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Section>
      </main>
      <SheetFooter page="1" syncedAt={snapshot.syncedAt} />
    </>
  );
}

import SheetHeader from '@/components/sheet/SheetHeader';
import SheetFooter from '@/components/sheet/SheetFooter';
import Section from '@/components/ui/Section';
import SpecTable from '@/components/work/SpecTable';
import Timing from '@/components/work/Timing';
import Treemap from '@/components/work/Treemap';
import Languages from '@/components/work/Languages';
import RevisionHistory from '@/components/work/RevisionHistory';
import { FIGURES } from '@/lib/figures';
import { PART } from '@/lib/datasheet';
import snapshot from '@/lib/repos.json';

export const metadata = {
  title: 'BLARE-1 characterization: the work, measured',
  description:
    'Datasheet page 2: electrical characteristics, timing diagrams for four benchmarks, the repositories as a die floorplan, language composition, revision history.',
};

/**
 * Page 2 of the datasheet: the characterization data. Sections continue
 * from page 1 (6 onward), figures from 3, tables from 4.
 */
export default function WorkPage() {
  const { repos, syncedAt } = snapshot;

  return (
    <>
      <SheetHeader page="2" />
      <main id="main" tabIndex={-1} className="sheet">
        <div className="ds-title ds-title-compact">
          <h1 className="ds-h1">
            <span className="ds-h1-part num">{PART}</span>
            <span className="ds-h1-name">Characterization: the work, measured</span>
          </h1>
          <p className="ds-title-meta">
            Four benchmarks I ran, one per repository, then the repositories
            themselves, counted from the GitHub API. The last two change when
            the code does.
          </p>
        </div>

        <Section id="specifications" n="6" title="Specifications">
          <SpecTable repos={repos} />
        </Section>

        <Section id="timing" n="7" title="Timing Characteristics">
          <p className="ds-p ds-p-intro">
            Each run is drawn as a BUSY signal on one shared axis: it rises at
            zero and falls when the run finishes. The spread of the falling
            edges is the result. Highlighted traces are mine.
          </p>
          <div className="timing-grid-2">
            {FIGURES.map((figure) => (
              <Timing key={figure.id} {...figure} />
            ))}
          </div>
        </Section>

        <Section id="work" n="8" title="Die Floorplan">
          <Treemap repos={repos} />
        </Section>

        <Section id="composition" n="9" title="Composition">
          <Languages repos={repos} />
        </Section>

        <Section id="revisions" n="10" title="Revision History">
          <RevisionHistory />
        </Section>
      </main>
      <SheetFooter page="2" syncedAt={syncedAt} />
    </>
  );
}

import { VStack, HStack, Layout, LayoutContent } from '@astryxdesign/core/Layout';
import { Heading, Text } from '@astryxdesign/core/Text';
import { Grid } from '@astryxdesign/core/Grid';
import { Divider } from '@astryxdesign/core/Divider';
import { Button } from '@astryxdesign/core/Button';
import Race from '@/components/work/Race';
import FigureTable from '@/components/work/FigureTable';
import MetricCard from '@/components/work/MetricCard';
import Treemap from '@/components/work/Treemap';
import Languages from '@/components/work/Languages';
import Footer from '@/components/site/Footer';
import { FIGURES } from '@/lib/figures';
import snapshot from '@/lib/repos.json';

export const metadata = {
  title: 'Blare — the work, measured',
  description:
    'Benchmarks from four repositories run as races, every repository drawn to scale, and the languages they are written in, counted from the GitHub API.',
};

/**
 * The figures, scaffolded from Astryx's `dashboard` template: a row of
 * headline tiles, then the charts, then the supporting tables, with a
 * Divider and a section head between bands.
 */
export default function WorkPage() {
  const { repos, syncedAt } = snapshot;

  return (
    <Layout
      height="auto"
      contentWidth={1200}
      content={
        <LayoutContent padding={6} isScrollable={false}>
          <VStack gap={6}>
            <HStack hAlign="between" vAlign="end" wrap="wrap" gap={4}>
              <VStack gap={2} maxWidth="68ch">
                <Heading level={1}>The work, measured</Heading>
                <Text as="p" color="secondary" textWrap="pretty">
                  Six figures. The first four are measurements I took, one per
                  repository, folded under their titles. The last two are drawn
                  from the repositories themselves, so they change when the code
                  does.
                </Text>
              </VStack>
              <Button label="Back to the introduction" variant="secondary" href="/" />
            </HStack>

            {/* Headline tiles: one per measured figure. */}
            <Grid columns={{ minWidth: 240, repeat: 'fit' }} gap={4}>
              {FIGURES.map((figure) => (
                <MetricCard key={figure.id} {...figure} />
              ))}
            </Grid>

            <FigureTable />

            <Divider />

            <HStack hAlign="between" vAlign="center">
              <Heading level={2}>Benchmarks</Heading>
            </HStack>
            <VStack gap={4}>
              {FIGURES.map((figure) => (
                <Race key={figure.id} {...figure} />
              ))}
            </VStack>

            <Divider />

            <Treemap repos={repos} />

            <Divider />

            <Languages repos={repos} />

            <Footer syncedAt={syncedAt} />
          </VStack>
        </LayoutContent>
      }
    />
  );
}

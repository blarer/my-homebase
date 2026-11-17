import { VStack } from '@astryxdesign/core/Stack';
import { Card } from '@astryxdesign/core/Card';
import { Heading, Text } from '@astryxdesign/core/Text';
import { Link } from '@astryxdesign/core/Link';

/**
 * A headline tile, after the dashboard template's MetricCard: the figure's
 * result as the big number, its repository and title under it. Links to
 * the figure, which opens when its hash is followed.
 */
export default function MetricCard({ id, repoName, title, headline }) {
  return (
    <Card>
      <VStack gap={1}>
        <Text type="supporting">{repoName}</Text>
        <Heading level={2} type="display-3" color="accent">{headline}</Heading>
        <Link href={`#${id}`} type="supporting" color="secondary">{title}</Link>
      </VStack>
    </Card>
  );
}

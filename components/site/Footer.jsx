import { HStack, VStack } from '@astryxdesign/core/Stack';
import { Text } from '@astryxdesign/core/Text';
import { Link } from '@astryxdesign/core/Link';
import { Divider } from '@astryxdesign/core/Divider';
import { Code } from '@astryxdesign/core/Code';

/**
 * The colophon: where the numbers came from and when they were counted,
 * then the way out. Sits at the foot of every page's content column.
 */
export default function Footer({ syncedAt }) {
  return (
    <VStack gap={4} as="footer">
      <Divider />
      <HStack gap={4} hAlign="between" vAlign="start" wrap="wrap">
        <VStack gap={1} maxWidth="60ch">
          <Text type="label">Colophon</Text>
          <Text type="supporting">
            Built with the Astryx design system. Repository figures counted
            from the GitHub API, last synced <Code size="inherit" color="inherit">{syncedAt}</Code>.
          </Text>
        </VStack>
        <HStack gap={4} as="nav" aria-label="Elsewhere">
          <Link href="/work/" type="supporting">Work</Link>
          <Link href="https://github.com/blarer" type="supporting">GitHub</Link>
          <Link href="mailto:blare@louds.net" type="supporting">Email</Link>
        </HStack>
      </HStack>
    </VStack>
  );
}

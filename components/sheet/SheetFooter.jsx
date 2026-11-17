import { HStack, VStack } from '@astryxdesign/core/Stack';
import { Divider } from '@astryxdesign/core/Divider';
import { Text } from '@astryxdesign/core/Text';
import { Link } from '@astryxdesign/core/Link';
import { PART, DOC } from '@/lib/datasheet';
import { revision } from '@/lib/revision';

/**
 * The page footer rule: document number and page on the left, where the
 * values came from under it, the ways out on the right.
 */
export default function SheetFooter({ page, syncedAt }) {
  const rev = revision();
  const other = page === '1' ? { href: '/work/', label: 'Characterization, p.2' } : { href: '/', label: 'Datasheet, p.1' };
  return (
    <VStack gap={3} as="footer">
      <Divider />
      <HStack gap={4} justify="space-between" wrap="wrap" vAlign="start">
        <VStack gap={1}>
          <Text type="code" color="secondary">
            {PART} · {DOC} REV {rev.rev} · page {page} of 2
          </Text>
          <Text as="p" type="supporting" color="secondary" textWrap="pretty">
            Repository values counted from the GitHub API, last synced{' '}
            <Text type="code" color="inherit">{syncedAt}</Text>.
          </Text>
        </VStack>
        <HStack gap={4} as="nav" aria-label="Elsewhere" wrap="wrap">
          <Link href={other.href} type="supporting">{other.label}</Link>
          <Link href="https://github.com/blarer" type="supporting">GitHub</Link>
          <Link href="mailto:blare@louds.net" type="supporting">Email</Link>
        </HStack>
      </HStack>
    </VStack>
  );
}

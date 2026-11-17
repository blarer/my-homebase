import { VStack, HStack } from '@astryxdesign/core/Stack';
import { Text } from '@astryxdesign/core/Text';
import { Link } from '@astryxdesign/core/Link';
import TitleBlock from '@/components/sheet/TitleBlock';

export default function NotFound() {
  return (
    <VStack gap={6} as="main" id="main" tabIndex={-1} maxWidth={720}>
      <TitleBlock part="404" title="No such page in this datasheet">
        Nothing is served at this address. The datasheet has two pages.
      </TitleBlock>
      <HStack gap={4} wrap="wrap">
        <Link href="/">Page 1, datasheet</Link>
        <Text color="secondary" aria-hidden="true">·</Text>
        <Link href="/work/">Page 2, characterization</Link>
      </HStack>
    </VStack>
  );
}

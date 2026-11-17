import { VStack } from '@astryxdesign/core/Stack';
import { Heading, Text } from '@astryxdesign/core/Text';

/**
 * The title block under the TopNav, which already carries the part number,
 * document number and pages. Part number as a kicker, the title as the one
 * h1, then a single line of lede: the `documentation-technical` header.
 */
export default function TitleBlock({ part, title, children }) {
  return (
    <VStack gap={2} as="header" maxWidth={720}>
      <Text type="code" color="accent" weight="semibold">{part}</Text>
      <Heading level={1}>{title}</Heading>
      <Text as="p" color="secondary" textWrap="pretty">{children}</Text>
    </VStack>
  );
}

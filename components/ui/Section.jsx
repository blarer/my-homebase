import { VStack } from '@astryxdesign/core/Stack';
import { Heading, Text } from '@astryxdesign/core/Text';

/**
 * A numbered datasheet section. The number is information: the sections
 * run across both pages and are cross-referenced in the text ("see 6"),
 * as in any datasheet. Laid out the way the `documentation-technical`
 * template lays out each step: heading, then content, gap 4.
 */
export default function Section({ id, n, title, children }) {
  return (
    <VStack gap={4} as="section" id={id} aria-labelledby={`${id}-title`}>
      <Heading level={2} id={`${id}-title`}>
        <Text type="inherit" color="accent">{n}</Text> {title}
      </Heading>
      {children}
    </VStack>
  );
}

/** A figure or table caption in datasheet form: "Figure 1. Title". */
export function Caption({ kind = 'Figure', n, children }) {
  return (
    <Text as="p" type="supporting" textWrap="pretty">
      <Text type="inherit" weight="semibold" color="primary">
        {kind} {n}.
      </Text>{' '}
      {children}
    </Text>
  );
}

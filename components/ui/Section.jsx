import { VStack } from '@astryxdesign/core/Stack';
import { Heading, Text } from '@astryxdesign/core/Text';
import { Divider } from '@astryxdesign/core/Divider';
import { ScrollableArea } from '@astryxdesign/core/ScrollableArea';

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

/**
 * A printed-datasheet figure: no frame, a hairline rule above, the drawing,
 * and the caption under it. `maxWidth` caps a drawing at its natural size,
 * so SVG text never scales past the type scale on a wide screen.
 */
export function Figure({ n, caption, maxWidth, children, ...props }) {
  return (
    <VStack gap={2} as="figure" {...props}>
      <Divider />
      <VStack width="100%" maxWidth={maxWidth}>
        {children}
      </VStack>
      <Caption n={n}>{caption}</Caption>
    </VStack>
  );
}

/**
 * A datasheet table: caption above (tables are captioned on top, figures
 * underneath), then the table itself, scrolling sideways on a phone rather
 * than squeezing its columns together.
 */
export function TableBlock({ n, caption, children, note, minWidth = 560 }) {
  return (
    <VStack gap={2}>
      <Caption kind="Table" n={n}>{caption}</Caption>
      <ScrollableArea axis="inline" width="100%">
        {/* Full width, but never narrower than the columns can be read at. */}
        <VStack width={`max(100%, ${minWidth}px)`}>{children}</VStack>
      </ScrollableArea>
      {note && <Text as="p" type="supporting" color="secondary">{note}</Text>}
    </VStack>
  );
}

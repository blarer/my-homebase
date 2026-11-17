'use client';

import { VStack, HStack } from '@astryxdesign/core/Stack';
import { Heading, Text } from '@astryxdesign/core/Text';
import { Button } from '@astryxdesign/core/Button';
import { Icon } from '@astryxdesign/core/Icon';
import { ArrowRightIcon } from '@heroicons/react/20/solid';

/**
 * The centred-hero stack: name, one line about the person, and the two
 * ways onward. A client component because the icon is a component value,
 * which cannot cross the server/client boundary as a prop.
 */
export default function Hero() {
  return (
    <VStack gap={6} hAlign="center">
      <VStack gap={3} hAlign="center">
        <Heading level={1} type="display-1">J L</Heading>
        <Text type="large" color="secondary" justify="center" textWrap="balance">
          Systems programmer. I build the tools I wish I had, then measure
          whether they were worth building.
        </Text>
      </VStack>
      <HStack gap={3} wrap="wrap" hAlign="center">
        <Button
          label="See the work, measured"
          variant="primary"
          href="/work/"
          endContent={<Icon icon={ArrowRightIcon} size="sm" color="inherit" />}
        />
        <Button label="About" variant="secondary" href="#about" />
      </HStack>
    </VStack>
  );
}

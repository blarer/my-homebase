import { VStack, HStack } from '@astryxdesign/core/Stack';
import { Grid } from '@astryxdesign/core/Grid';
import { Heading, Text } from '@astryxdesign/core/Text';
import { Link } from '@astryxdesign/core/Link';
import { Avatar } from '@astryxdesign/core/Avatar';
import { Section } from '@astryxdesign/core/Section';

/**
 * About, in his own register: what he works on and how.
 */
export default function About() {
  return (
    <Section variant="transparent" padding={0}>
      <Grid columns={{ minWidth: 280, repeat: 'fit' }} gap={8} align="start">
        <VStack gap={4} id="about">
          <Heading level={2}>Jains Yeah Yeah Yeah</Heading>
          <HStack gap={3} vAlign="center">
            <Avatar src="/avatar.png" name="Blare" size={96} shape="rounded" tooltip={false} />
            <Text type="code" color="secondary">blarer</Text>
          </HStack>
        </VStack>

        <VStack gap={4} maxWidth="68ch">
          <Text as="p" textWrap="pretty">
            I write systems software and the tools around it. Most of what I
            build starts the same way: something on my own machine is slower,
            heavier, or more fragile than it should be, and the fix turns out
            to live a layer below where people usually look.
          </Text>
          <Text as="p" textWrap="pretty">
            The disk scanner was a syscall problem, not a UI problem. The
            video trimmer was a stream-copy problem, not an encoding problem.
            The voice dictation tool was a transport problem: recognition was
            already local and fast, and the latency was in how the text got
            into the field. The battery meter was a polling problem, so it
            reads the power sensors directly instead of waiting on the gauge.
            Each one got faster by removing work, not by adding threads.
          </Text>
          <Text as="p" textWrap="pretty">
            Right now I&apos;m reading into machine learning properly:
            transformer internals, self-attention, how inference actually spends
            its time, and where agents break down. I use AI daily and want to
            understand the machine underneath it rather than treat it as a box
            that returns answers.
          </Text>
          <HStack gap={4} wrap="wrap">
            <Link href="/work/">See the work, measured →</Link>
            <Link href="https://github.com/blarer">github.com/blarer</Link>
            <Link href="mailto:blare@louds.net">blare@louds.net</Link>
          </HStack>
        </VStack>
      </Grid>
    </Section>
  );
}

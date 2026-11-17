import { VStack, Layout, LayoutContent } from '@astryxdesign/core/Layout';
import { Heading, Text } from '@astryxdesign/core/Text';
import { Button } from '@astryxdesign/core/Button';

/**
 * 404, as plain content inside the site shell (`shell-top-nav`).
 */
export default function NotFound() {
  return (
    <Layout
      height="auto"
      contentWidth={640}
      content={
        <LayoutContent padding={10} isScrollable={false}>
          <VStack gap={4} hAlign="center">
            <Text type="code" color="secondary">404</Text>
            <Heading level={1} justify="center">No such path</Heading>
            <Text as="p" color="secondary" justify="center">
              Nothing is served at this address. The work is on the home page.
            </Text>
            <Button label="Back to the index" variant="primary" href="/" />
          </VStack>
        </LayoutContent>
      }
    />
  );
}

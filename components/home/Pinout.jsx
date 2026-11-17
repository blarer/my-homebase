import { PINS, PART } from '@/lib/datasheet';
import { Figure, TableBlock } from '@/components/ui/Section';
import { Grid } from '@astryxdesign/core/Grid';
import { Text } from '@astryxdesign/core/Text';
import { Link } from '@astryxdesign/core/Link';
import { Badge } from '@astryxdesign/core/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHeaderCell, TableCell } from '@astryxdesign/core/Table';

/**
 * Figure 2 and Table 2: the package pinout and pin functions.
 *
 * A ten-pin package, five pins a side, drawn top view with the pin-1 notch.
 * Every connected pin is a link: the ways in and out of the part. The pin
 * table beside it is the same list, as a datasheet prints it.
 */
const PITCH = 28;
const BODY = { x: 120, y: 16, w: 120, h: PITCH * 5 + 8 };
const W = 360;
const H = BODY.y * 2 + BODY.h;
const SIDE = PINS.length / 2;

const TYPES = { I: 'Input', O: 'Output', NC: 'No connect' };

export default function Pinout() {
  return (
    <Grid columns={{ minWidth: 300, repeat: 'fit' }} gap={6} align="start">
      <Figure n={2} maxWidth={W} caption="Package, top view. Every connected pin is a link.">
        <svg width="100%" viewBox={`0 0 ${W} ${H}`} role="group" aria-label={`${PART} pinout, top view, ten pins.`}>
          <rect style={S.body} x={BODY.x} y={BODY.y} width={BODY.w} height={BODY.h} rx="2" />
          <path style={S.notch} d={`M${BODY.x + BODY.w / 2 - 10} ${BODY.y} a10 10 0 0 0 20 0`} />
          <circle style={S.dot} cx={BODY.x + 14} cy={BODY.y + 14} r="3" />
          <text style={S.part} x={BODY.x + BODY.w / 2} y={BODY.y + BODY.h / 2 + 4} textAnchor="middle">
            {PART}
          </text>
          {PINS.map((pin, i) => {
            const left = i < SIDE;
            const row = left ? i : PINS.length - 1 - i;
            const y = BODY.y + 18 + row * PITCH;
            const x = left ? BODY.x - 20 : BODY.x + BODY.w;
            const nc = !pin.href;
            const content = (
              <>
                <rect style={nc ? S.pinNc : S.pin} x={x} y={y - 5} width="20" height="10" />
                <text style={S.n} x={left ? BODY.x + 8 : BODY.x + BODY.w - 8} y={y + 4} textAnchor={left ? 'start' : 'end'}>
                  {pin.n}
                </text>
                <text style={nc ? S.nameNc : S.name} x={left ? x - 8 : x + 28} y={y + 4} textAnchor={left ? 'end' : 'start'}>
                  {pin.name}
                </text>
              </>
            );
            return nc ? (
              <g key={pin.n}>{content}</g>
            ) : (
              <a key={pin.n} href={pin.href} aria-label={`Pin ${pin.n}, ${pin.name}: ${pin.description}`}>
                {content}
              </a>
            );
          })}
        </svg>
      </Figure>

      <TableBlock n={2} caption="Pin functions" note="I = input, O = output, NC = no connect.">
        <Table density="compact" dividers="rows">
          <TableHeader>
            <TableRow isHeaderRow>
              <TableHeaderCell scope="col">Pin</TableHeaderCell>
              <TableHeaderCell scope="col">Name</TableHeaderCell>
              <TableHeaderCell scope="col">Type</TableHeaderCell>
              <TableHeaderCell scope="col">Description</TableHeaderCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {PINS.map((pin) => (
              <TableRow key={pin.n}>
                <TableCell><Text type="code" hasTabularNumbers>{pin.n}</Text></TableCell>
                <TableHeaderCell scope="row">
                  {pin.href ? (
                    <Link href={pin.href} type="code">{pin.name}</Link>
                  ) : (
                    <Text type="code" color="secondary">{pin.name}</Text>
                  )}
                </TableHeaderCell>
                <TableCell>
                  <Badge variant="neutral" label={pin.type} aria-label={TYPES[pin.type]} />
                </TableCell>
                <TableCell><Text type="supporting">{pin.description}</Text></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableBlock>
    </Grid>
  );
}

// SVG presentation from theme tokens only.
const code = { fontFamily: 'var(--font-family-code)', fontSize: 'var(--text-supporting-size)' };
const S = {
  body: { fill: 'var(--color-background-muted)', stroke: 'var(--color-text-primary)', strokeWidth: 1.5 },
  notch: { fill: 'var(--color-background-surface)', stroke: 'var(--color-text-primary)', strokeWidth: 1.5 },
  dot: { fill: 'var(--color-text-primary)' },
  part: { ...code, fill: 'var(--color-text-secondary)' },
  pin: { fill: 'var(--color-accent)' },
  pinNc: { fill: 'var(--color-border)' },
  n: { ...code, fill: 'var(--color-text-secondary)' },
  name: { ...code, fill: 'var(--color-text-accent)', fontWeight: 'var(--font-weight-semibold)' },
  nameNc: { ...code, fill: 'var(--color-text-secondary)' },
};

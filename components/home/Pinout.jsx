import { PINS, PART } from '@/lib/datasheet';
import { Caption } from '@/components/ui/Section';

/**
 * Figure 2 and Table 2: the package pinout and pin functions.
 *
 * A ten-pin package, five pins a side, drawn top view with the pin-1 notch.
 * Every pin is a link: the ways in and out of the part. The pin table under
 * it is the same list, as a datasheet prints it.
 */
const PITCH = 30;
const BODY = { x: 150, y: 20, w: 140, h: PITCH * 5 + 10 };
const SIDE = PINS.length / 2;

export default function Pinout() {
  return (
    <div className="pinout">
      <figure className="ds-figure pinout-figure">
        <svg
          viewBox={`0 0 440 ${BODY.y * 2 + BODY.h}`}
          className="pinout-svg"
          role="group"
          aria-label={`${PART} pinout, top view, ten pins.`}
        >
          <rect className="pkg-body" x={BODY.x} y={BODY.y} width={BODY.w} height={BODY.h} />
          <path className="pkg-notch" d={`M${BODY.x + BODY.w / 2 - 12} ${BODY.y} a12 12 0 0 0 24 0`} />
          <circle className="pkg-dot" cx={BODY.x + 16} cy={BODY.y + 16} r="4" />
          <text className="pkg-label" x={BODY.x + BODY.w / 2} y={BODY.y + BODY.h / 2 + 4} textAnchor="middle">
            {PART}
          </text>
          {PINS.map((pin, i) => {
            const left = i < SIDE;
            const row = left ? i : PINS.length - 1 - i;
            const y = BODY.y + 20 + row * PITCH;
            const x = left ? BODY.x - 24 : BODY.x + BODY.w;
            const content = (
              <>
                <rect className="pkg-pin" x={x} y={y - 6} width="24" height="12" />
                <text className="pkg-pin-n" x={left ? BODY.x + 8 : BODY.x + BODY.w - 8} y={y + 4} textAnchor={left ? 'start' : 'end'}>
                  {pin.n}
                </text>
                <text className="pkg-pin-name" x={left ? x - 8 : x + 32} y={y + 4} textAnchor={left ? 'end' : 'start'}>
                  {pin.name}
                </text>
              </>
            );
            return pin.href ? (
              <a key={pin.n} href={pin.href} className="pkg-link" aria-label={`Pin ${pin.n}, ${pin.name}: ${pin.description}`}>
                {content}
              </a>
            ) : (
              <g key={pin.n} className="pkg-nc">
                {content}
              </g>
            );
          })}
        </svg>
        <figcaption>
          <Caption n={2} as="span">
            Package, top view. Every pin is a link.
          </Caption>
        </figcaption>
      </figure>

      <div className="ds-table-wrap">
        <table className="ds-table pin-table">
          <caption>
            <Caption kind="Table" n={2} as="span">
              Pin functions
            </Caption>
          </caption>
          <thead>
            <tr>
              <th scope="col" className="ds-num">Pin</th>
              <th scope="col">Name</th>
              <th scope="col">Type</th>
              <th scope="col">Description</th>
            </tr>
          </thead>
          <tbody>
            {PINS.map((pin) => (
              <tr key={pin.n}>
                <td className="ds-num">{pin.n}</td>
                <th scope="row" className="num">
                  {pin.href ? <a href={pin.href}>{pin.name}</a> : pin.name}
                </th>
                <td className="num">{pin.type}</td>
                <td>{pin.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="ds-note">I = input, O = output, NC = no connect.</p>
      </div>
    </div>
  );
}

import { ImageResponse } from 'next/og';

export const alt = 'Blare — systems programming, measured';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// The share card carries the same argument as the hero: one measurement,
// three implementations, on the site's graph-paper ground.
const RUNS = [
  { label: 'du -sk', seconds: 22.7 },
  { label: 'parallel read_dir + lstat', seconds: 3.5 },
  { label: 'storage-manager', seconds: 2.2, mine: true },
];

const SLOWEST = 22.7;

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: 76,
          background: '#eceef0',
          backgroundImage:
            'linear-gradient(to right, rgba(20,24,28,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(20,24,28,0.06) 1px, transparent 1px)',
          backgroundSize: '26px 26px',
          fontFamily: 'monospace',
          color: '#14181c',
        }}
      >
        <div
          style={{
            fontSize: 116,
            fontWeight: 800,
            letterSpacing: '-0.04em',
            lineHeight: 1,
            marginBottom: 18,
          }}
        >
          BLARE
        </div>

        <div style={{ fontSize: 23, color: '#4a545e', marginBottom: 46, maxWidth: 760 }}>
          I build native tools and measure what they cost.
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {RUNS.map((run) => (
            <div key={run.label} style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
              <div style={{ width: 300, fontSize: 18, color: '#14181c' }}>{run.label}</div>
              <div
                style={{
                  display: 'flex',
                  width: 560,
                  height: 12,
                  borderBottom: '1px solid rgba(20,24,28,0.14)',
                }}
              >
                <div
                  style={{
                    width: (run.seconds / SLOWEST) * 560,
                    height: 12,
                    background: run.mine ? '#14181c' : 'rgba(20,24,28,0.28)',
                  }}
                />
              </div>
              <div style={{ fontSize: 19, fontWeight: 600 }}>{`${run.seconds.toFixed(1)}s`}</div>
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size },
  );
}

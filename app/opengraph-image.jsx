import { ImageResponse } from 'next/og';

export const alt = 'BLARE-1 datasheet: systems-software engineer, measured';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// The share card is page 1 of the datasheet in miniature: the manufacturer
// bar, the part number, and the disk-scan benchmark as a timing table.
const RUNS = [
  { label: 'du -sk', seconds: 22.7 },
  { label: 'parallel read_dir + lstat', seconds: 3.5 },
  { label: 'storage-manager', seconds: 2.2, mine: true },
];
const SLOWEST = 22.7;
const ACCENT = '#006670';
const INK = '#111314';

export default function Image() {
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: '#ffffff', color: INK, fontFamily: 'sans-serif' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: ACCENT, color: '#fff', padding: '18px 64px', fontSize: 26, fontWeight: 700 }}>
          <div>BLARE-1</div>
          <div style={{ fontSize: 18, fontWeight: 400 }}>LOUDS-DS-001 · louds.net</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', padding: '48px 64px 0' }}>
          <div style={{ fontSize: 92, color: ACCENT, lineHeight: 1 }}>BLARE-1</div>
          <div style={{ fontSize: 34, fontWeight: 700, marginTop: 14 }}>Systems-Software Engineer, Measured One Layer Below</div>
          <div style={{ display: 'flex', borderTop: `3px solid ${INK}`, marginTop: 40, paddingTop: 18, flexDirection: 'column', gap: 14 }}>
            {RUNS.map((run) => (
              <div key={run.label} style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                <div style={{ width: 330, fontSize: 20, fontWeight: run.mine ? 700 : 400 }}>{run.label}</div>
                <div style={{ display: 'flex', width: 560, height: 18, borderBottom: `2px solid ${run.mine ? ACCENT : INK}` }}>
                  <div style={{ width: (run.seconds / SLOWEST) * 560, height: 18, borderTop: `2px solid ${run.mine ? ACCENT : INK}`, borderRight: `2px solid ${run.mine ? ACCENT : INK}` }} />
                </div>
                <div style={{ fontSize: 22, color: run.mine ? ACCENT : INK }}>{`${run.seconds.toFixed(1)} s`}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}

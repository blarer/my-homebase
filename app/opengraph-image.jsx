import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Blare';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#080808',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        {/* Subtle orb */}
        <div style={{
          position: 'absolute',
          top: '-10%',
          right: '10%',
          width: 500,
          height: 500,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139,92,246,0.18) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }} />

        <div style={{
          fontSize: 11,
          color: 'rgba(255,255,255,0.25)',
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          marginBottom: 28,
        }}>
          blare.lol
        </div>

        <div style={{
          fontSize: 112,
          fontWeight: 700,
          color: '#f0f0f0',
          letterSpacing: '-0.04em',
          lineHeight: 0.88,
          marginBottom: 36,
        }}>
          Blare
        </div>

        <div style={{
          fontSize: 22,
          color: 'rgba(255,255,255,0.4)',
          maxWidth: 520,
          lineHeight: 1.5,
        }}>
          Developer crafting exceptional digital experiences at the intersection of design and code.
        </div>
      </div>
    ),
    { ...size }
  );
}

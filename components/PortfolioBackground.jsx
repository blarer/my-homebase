'use client';

import LiquidChrome from '@/components/react-bits/Backgrounds/LiquidChrome/LiquidChrome';

export default function PortfolioBackground() {
  return (
    <div className="fixed inset-0 z-0 opacity-30 pointer-events-none">
      <LiquidChrome
        baseColor={[0.05, 0.05, 0.05]}
        speed={0.15}
        amplitude={0.4}
        frequencyX={2.5}
        frequencyY={1.8}
        interactive={false}
      />
    </div>
  );
}

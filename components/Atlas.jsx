'use client';

import { useEffect, useRef } from 'react';
import '@/app/motion.css';

/**
 * A small neural network, drifting.
 *
 * This is a CPPN (compositional pattern-producing network): a 4-layer MLP
 * that maps a pixel's coordinates to a colour. Run over every pixel it paints
 * a continuous field; nudge the weights a little each frame and the field
 * flows. Activation atlases and "neural art" demos are the same object. The
 * whole model is ~900 floats seeded from the visit time, so no two visits
 * see the same plate and nothing is downloaded.
 *
 * Output is mapped into the page's own palette (paper, soft ink, accent)
 * read from computed styles, so the plate re-inks itself on a theme flip
 * and its quiet regions are the page's exact paper: with the CSS feather
 * mask on the frame, the field dissolves into the page with no edge.
 *
 * Cost: a 128x128 field, ~1.2k MACs per pixel, ~20M ops per frame, at 12
 * fps. Paused when offscreen or the tab is hidden. Under
 * prefers-reduced-motion it renders exactly one frame. Without JS the
 * <noscript> plate shows a static SVG so the slot is never empty.
 */

const W = 128;
const H = 128;
const FPS = 12;
const HIDDEN = 16;
const LAYERS = 4; // hidden layers; input is (x, y, r, 1), output is 3 channels

// Mulberry32: tiny, deterministic, good enough for weights.
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function gaussian(rand) {
  // Box-Muller, one sample.
  const u = 1 - rand();
  const v = rand();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

/**
 * Builds the weight tensors. Layer shapes:
 *   W0: HIDDEN x 4   (x, y, r, bias)
 *   Wk: HIDDEN x (HIDDEN + 1)   for k in 1..LAYERS-1
 *   Wout: 3 x (HIDDEN + 1)
 * Each weight also gets a drift phase and rate, so the field evolves on a
 * superposition of slow sines rather than a random walk (which would wander
 * off into saturation).
 */
function buildNet(seed) {
  const rand = rng(seed);
  const layers = [];
  let inSize = 4;
  for (let k = 0; k < LAYERS; k++) {
    const outSize = HIDDEN;
    const n = outSize * inSize;
    const base = new Float32Array(n);
    const phase = new Float32Array(n);
    const rate = new Float32Array(n);
    // The first layer sets the spatial frequency: a wider spread of weights
    // on (x, y, r) means more oscillations across the plate, so the field
    // reads as cells and filaments rather than one soft gradient. Deeper
    // layers use a gain slightly above 1/sqrt(n) so sin() stays in its
    // non-linear range and keeps folding the pattern.
    const scale = k === 0 ? 3.2 : 1.35 / Math.sqrt(inSize);
    for (let i = 0; i < n; i++) {
      base[i] = gaussian(rand) * scale;
      phase[i] = rand() * Math.PI * 2;
      rate[i] = 0.05 + rand() * 0.25;
    }
    layers.push({ inSize, outSize, base, phase, rate, w: new Float32Array(n) });
    inSize = outSize + 1;
  }
  const n = 3 * inSize;
  const base = new Float32Array(n);
  const phase = new Float32Array(n);
  const rate = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    base[i] = gaussian(rand) * (1.6 / Math.sqrt(inSize));
    phase[i] = rand() * Math.PI * 2;
    rate[i] = 0.05 + rand() * 0.25;
  }
  layers.push({ inSize, outSize: 3, base, phase, rate, w: new Float32Array(n) });
  return layers;
}

function driftWeights(layers, t, amount) {
  for (const L of layers) {
    const { base, phase, rate, w } = L;
    for (let i = 0; i < w.length; i++) {
      w[i] = base[i] + Math.sin(t * rate[i] + phase[i]) * amount;
    }
  }
}

function parseRgb(s) {
  const m = s.match(/[\d.]+/g);
  if (!m || m.length < 3) return [0, 0, 0];
  return [Number(m[0]), Number(m[1]), Number(m[2])];
}

/**
 * Renders one frame into `img` (ImageData for a W x H canvas), then paints
 * it. The inner loop is plain typed-array arithmetic; no allocation.
 */
function render(ctx, img, layers, coords, palette, bufs) {
  const data = img.data;
  const [paper, ink, accent] = palette;
  const { a, b } = bufs;

  for (let p = 0; p < W * H; p++) {
    const ci = p * 3;
    // Input vector (x, y, r, 1)
    a[0] = coords[ci];
    a[1] = coords[ci + 1];
    a[2] = coords[ci + 2];
    a[3] = 1;
    let inp = a;
    let out = b;
    let inSize = 4;

    for (let k = 0; k < layers.length; k++) {
      const L = layers[k];
      const w = L.w;
      const outSize = L.outSize;
      const last = k === layers.length - 1;
      for (let o = 0; o < outSize; o++) {
        let s = 0;
        const row = o * inSize;
        for (let i = 0; i < inSize; i++) s += w[row + i] * inp[i];
        // sin on the early layers folds space into periodic, cellular
        // structure; tanh on the last hidden layer and the output keeps it
        // bounded and smooth.
        out[o] = last || k === layers.length - 2 ? Math.tanh(s) : Math.sin(s);
      }
      if (!last) out[outSize] = 1; // bias input for next layer
      const tmp = inp;
      inp = out;
      out = tmp;
      inSize = outSize + 1;
    }

    // inp now holds 3 outputs in [-1, 1]. Channel 0 drives paper↔ink with a
    // gentle S-curve so midtones spread; channel 1 gates the accent where it
    // is strongly positive; channel 2 adds a little tonal variation so the
    // plate has depth rather than a flat two-tone.
    const u = (inp[0] + 1) * 0.5;
    const t0 = u * u * (3 - 2 * u);
    const g = Math.max(0, inp[1]) ** 2.2;
    const v = inp[2] * 0.06;

    let r = paper[0] + (ink[0] - paper[0]) * t0;
    let gg = paper[1] + (ink[1] - paper[1]) * t0;
    let bb = paper[2] + (ink[2] - paper[2]) * t0;
    r += (accent[0] - r) * g;
    gg += (accent[1] - gg) * g;
    bb += (accent[2] - bb) * g;
    const shade = 1 + v;
    const di = p * 4;
    data[di] = r * shade;
    data[di + 1] = gg * shade;
    data[di + 2] = bb * shade;
    data[di + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
}

export default function Atlas() {
  const canvasRef = useRef(null);
  const seedRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const seed = (Date.now() ^ (Math.random() * 0xffffffff)) >>> 0;
    seedRef.current = seed;
    canvas.dataset.seed = String(seed);

    const layers = buildNet(seed);
    const img = ctx.createImageData(W, H);
    const bufs = { a: new Float32Array(HIDDEN + 1), b: new Float32Array(HIDDEN + 1) };

    // Coordinate grid, computed once: x, y in [-1, 1] with the plate's
    // aspect folded in, plus radius so the net can make rings.
    const coords = new Float32Array(W * H * 3);
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const i = (y * W + x) * 3;
        const nx = (x / (W - 1)) * 2 - 1;
        const ny = (y / (H - 1)) * 2 - 1;
        coords[i] = nx * 2.2;
        coords[i + 1] = ny * 1.1;
        coords[i + 2] = Math.sqrt(nx * nx * 4 + ny * ny);
      }
    }

    const readPalette = () => {
      const cs = getComputedStyle(document.documentElement);
      const probe = document.createElement('span');
      probe.style.display = 'none';
      document.body.appendChild(probe);
      const resolve = (v) => {
        probe.style.color = v;
        return parseRgb(getComputedStyle(probe).color);
      };
      const pal = [
        resolve(cs.getPropertyValue('--paper').trim() || '#fff'),
        resolve(cs.getPropertyValue('--ink-soft').trim() || '#444'),
        resolve(cs.getPropertyValue('--accent').trim() || '#23408e'),
      ];
      probe.remove();
      return pal;
    };

    let palette = readPalette();
    let frames = 0;
    let raf = 0;
    let timer = 0;
    let visible = true;
    let running = false;
    const t0 = performance.now();

    const frame = () => {
      const t = (performance.now() - t0) / 1000;
      driftWeights(layers, t, 0.3);
      render(ctx, img, layers, coords, palette, bufs);
      frames++;
      canvas.dataset.frames = String(frames);
    };

    const loop = () => {
      if (!running) return;
      frame();
      timer = setTimeout(() => {
        raf = requestAnimationFrame(loop);
      }, 1000 / FPS);
    };

    const start = () => {
      if (running || reduced) return;
      running = true;
      canvas.dataset.running = 'true';
      loop();
    };
    const stop = () => {
      running = false;
      canvas.dataset.running = 'false';
      clearTimeout(timer);
      cancelAnimationFrame(raf);
    };

    // First frame always, so the plate is never blank; reduced motion stops
    // here with a single still.
    frame();
    if (reduced) {
      canvas.dataset.running = 'false';
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible && !document.hidden) start();
        else stop();
      },
      { threshold: 0.05 },
    );
    io.observe(canvas);

    const onVis = () => {
      if (document.hidden) stop();
      else if (visible) start();
    };
    document.addEventListener('visibilitychange', onVis);

    // Re-ink on theme change: watch data-theme on <html>. Always repaint
    // one frame here rather than only when paused: a click on the footer
    // toggle scrolls the plate offscreen in the same task, and the
    // IntersectionObserver that pauses the loop fires *after* this
    // callback, so "if (!running)" would skip the repaint and leave a
    // light-palette frame sitting on a dark page until the next scroll.
    const mo = new MutationObserver(() => {
      palette = readPalette();
      frame();
    });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    return () => {
      stop();
      io.disconnect();
      mo.disconnect();
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);

  return (
    <figure className="atlas-plate">
      <div className="atlas-frame">
        <canvas
          ref={canvasRef}
          className="atlas"
          width={W}
          height={H}
          aria-label="A small neural network painting a slowly changing field"
          role="img"
        />
        <noscript>
          <svg className="atlas atlas-static" viewBox="0 0 128 128" preserveAspectRatio="none" aria-hidden="true">
            <defs>
              <radialGradient id="atlas-g" cx="40%" cy="38%" r="70%">
                <stop offset="0" stopColor="var(--accent)" stopOpacity="0.55" />
                <stop offset="0.45" stopColor="var(--ink-soft)" stopOpacity="0.5" />
                <stop offset="1" stopColor="var(--paper-raised)" />
              </radialGradient>
            </defs>
            <rect width="128" height="128" fill="url(#atlas-g)" />
          </svg>
        </noscript>
      </div>
      <figcaption className="atlas-caption">
        <span className="tag">Fig. 0 — Atlas</span>
        <span className="atlas-note">
          A four-layer network, ~900 weights, seeded by the moment you arrived.
          It drifts; it never repeats.
        </span>
      </figcaption>
    </figure>
  );
}

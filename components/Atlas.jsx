'use client';

import { useEffect, useRef } from 'react';
import '@/app/motion.css';

/**
 * A small neural network, drifting.
 *
 * This is a CPPN (compositional pattern-producing network): a 4-hidden-layer
 * MLP that maps a pixel's coordinates to a colour. Run over every pixel it
 * paints a continuous field; nudge the weights a little each frame and the
 * field flows. The whole model is ~1.2k floats seeded from the visit time,
 * so no two visits see the same plate and nothing is downloaded.
 *
 * Two renderers share one network:
 *
 *   webgl    The MLP runs as a fragment shader, one invocation per pixel in
 *            parallel. The canvas is sized to its CSS box at device pixel
 *            ratio (capped), so the field is sharp at native resolution and
 *            a frame costs almost nothing. Weights are uploaded as uniforms
 *            each frame after drifting on the CPU.
 *   canvas2d Fallback when WebGL is unavailable or the context is lost: the
 *            same network evaluated in a typed-array loop over a 128x128
 *            buffer and upscaled. Identical maths, lower resolution.
 *
 * Output is mapped into the page's own palette (paper, soft ink, accent)
 * read from computed styles, so the plate re-inks itself on a theme flip
 * and its quiet regions are the page's exact paper; with the CSS feather
 * mask on the frame, the field dissolves into the page with no edge.
 *
 * Paused when offscreen or the tab is hidden. Under prefers-reduced-motion
 * it renders exactly one frame. Without JS the <noscript> plate shows a
 * static SVG so the slot is never empty.
 *
 * Measured on an M4 Pro, 1984x850 buffer, with scripts/bench-shader.mjs and
 * the CDP performance counters:
 *
 *   fragment shader      0.020 ms GPU per frame
 *   uniform upload+draw  0.025 ms CPU per frame
 *   weight drift (931)   0.006 ms CPU per frame
 *   whole page, running  ~2.5% of one core, flat from 20fps to 60fps
 *   whole page, paused   ~0.1%
 *
 * The cost is dominated by having a live rAF loop at all, not by the frame
 * rate or the pixel count, which is why this runs at 60 rather than
 * throttling: a lower rate looks worse and measures the same. A mat4-packed
 * shader was benchmarked and rejected (see bench-shader.mjs): it saves
 * 0.006 ms of GPU time and nothing on the CPU.
 */

const HIDDEN = 16;
const LAYERS = 4; // hidden layers; input is (x, y, r, 1), output is 3 channels
const IN0 = 4;
const INH = HIDDEN + 1;

const GL_FPS = 60;
const GL_MAX_DPR = 2;
const GL_MAX_PIXELS = 2.2e6; // ~1480x1480; keeps mobile GPUs comfortable

const CPU_W = 128;
const CPU_H = 128;
const CPU_FPS = 12;

const DRIFT = 0.3;

// ---------------------------------------------------------------- network

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
  const u = 1 - rand();
  const v = rand();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

/**
 * Layer shapes, row-major (out x in):
 *   W0:    HIDDEN x 4          (x, y, r, bias)
 *   W1..3: HIDDEN x (HIDDEN+1)
 *   Wout:  3 x (HIDDEN+1)
 * Each weight carries a drift phase and rate, so the field evolves on a
 * superposition of slow sines rather than a random walk (which would wander
 * into saturation).
 */
function buildNet(seed) {
  const rand = rng(seed);
  const layers = [];
  let inSize = IN0;
  for (let k = 0; k < LAYERS; k++) {
    const n = HIDDEN * inSize;
    const base = new Float32Array(n);
    const phase = new Float32Array(n);
    const rate = new Float32Array(n);
    // The first layer sets the spatial frequency; deeper layers use a gain
    // slightly above 1/sqrt(n) so sin() stays in its non-linear range.
    const scale = k === 0 ? 3.2 : 1.35 / Math.sqrt(inSize);
    for (let i = 0; i < n; i++) {
      base[i] = gaussian(rand) * scale;
      phase[i] = rand() * Math.PI * 2;
      rate[i] = 0.05 + rand() * 0.25;
    }
    layers.push({ inSize, outSize: HIDDEN, base, phase, rate, w: new Float32Array(n) });
    inSize = INH;
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

/**
 * Flattens the per-layer drift inputs into one contiguous view so the
 * per-frame loop is a single pass over three typed arrays with no property
 * lookups or per-layer bookkeeping. `slots` holds, for each layer, the
 * offset into the flat arrays and the layer's own `w` to write back into.
 */
function flattenDrift(layers) {
  const total = layers.reduce((sum, L) => sum + L.w.length, 0);
  const base = new Float32Array(total);
  const phase = new Float32Array(total);
  const rate = new Float32Array(total);
  const out = new Float32Array(total);
  const slots = [];
  let off = 0;
  for (const L of layers) {
    base.set(L.base, off);
    phase.set(L.phase, off);
    rate.set(L.rate, off);
    slots.push({ off, len: L.w.length, w: L.w });
    off += L.w.length;
  }
  return { base, phase, rate, out, slots, total };
}

function driftWeights(flat, t) {
  const { base, phase, rate, out, slots, total } = flat;
  for (let i = 0; i < total; i++) {
    out[i] = base[i] + Math.sin(t * rate[i] + phase[i]) * DRIFT;
  }
  for (const s of slots) {
    s.w.set(out.subarray(s.off, s.off + s.len));
  }
}

// ---------------------------------------------------------------- palette

function parseRgb(s) {
  const m = s.match(/[\d.]+/g);
  if (!m || m.length < 3) return [0, 0, 0];
  return [Number(m[0]), Number(m[1]), Number(m[2])];
}

function readPalette() {
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
}

// ---------------------------------------------------------------- webgl

const VERT = `
attribute vec2 a;
varying vec2 v;
void main() {
  v = a;
  gl_Position = vec4(a, 0.0, 1.0);
}`;

// The MLP, unrolled per layer. Uniform float arrays hold the row-major
// weights; GLSL ES 1.0 needs constant loop bounds, which HIDDEN provides.
// The palette mapping at the end matches the CPU path exactly.
const FRAG = `
precision highp float;
varying vec2 v;
uniform float w0[${HIDDEN * IN0}];
uniform float w1[${HIDDEN * INH}];
uniform float w2[${HIDDEN * INH}];
uniform float w3[${HIDDEN * INH}];
uniform float wo[${3 * INH}];
uniform vec3 paper;
uniform vec3 ink;
uniform vec3 accent;

float tanh_(float x) {
  float e = exp(2.0 * clamp(x, -20.0, 20.0));
  return (e - 1.0) / (e + 1.0);
}

void main() {
  // Same coordinate grid as the CPU path: x stretched for the wide plate,
  // y compressed, radius from the stretched frame.
  float nx = v.x;
  float ny = -v.y;
  float x = nx * 2.2;
  float y = ny * 1.1;
  float r = sqrt(nx * nx * 4.0 + ny * ny);

  float h0[${HIDDEN}];
  float h1[${HIDDEN}];

  // GLSL ES 1.0 only allows uniform-array indices built from constants and
  // loop counters, so the row offset is written inline rather than held in
  // a local. Layer 0: sin(W0 · [x, y, r, 1]).
  for (int o = 0; o < ${HIDDEN}; o++) {
    float s = w0[o * ${IN0}] * x + w0[o * ${IN0} + 1] * y + w0[o * ${IN0} + 2] * r + w0[o * ${IN0} + 3];
    h0[o] = sin(s);
  }
  // Layer 1: sin
  for (int o = 0; o < ${HIDDEN}; o++) {
    float s = w1[o * ${INH} + ${HIDDEN}];
    for (int i = 0; i < ${HIDDEN}; i++) s += w1[o * ${INH} + i] * h0[i];
    h1[o] = sin(s);
  }
  // Layer 2: sin
  for (int o = 0; o < ${HIDDEN}; o++) {
    float s = w2[o * ${INH} + ${HIDDEN}];
    for (int i = 0; i < ${HIDDEN}; i++) s += w2[o * ${INH} + i] * h1[i];
    h0[o] = sin(s);
  }
  // Layer 3: tanh (last hidden layer keeps it bounded and smooth)
  for (int o = 0; o < ${HIDDEN}; o++) {
    float s = w3[o * ${INH} + ${HIDDEN}];
    for (int i = 0; i < ${HIDDEN}; i++) s += w3[o * ${INH} + i] * h0[i];
    h1[o] = tanh_(s);
  }
  // Output: tanh, three channels
  float out0 = wo[${HIDDEN}];
  float out1 = wo[${INH} + ${HIDDEN}];
  float out2 = wo[2 * ${INH} + ${HIDDEN}];
  for (int i = 0; i < ${HIDDEN}; i++) {
    out0 += wo[i] * h1[i];
    out1 += wo[${INH} + i] * h1[i];
    out2 += wo[2 * ${INH} + i] * h1[i];
  }
  out0 = tanh_(out0);
  out1 = tanh_(out1);
  out2 = tanh_(out2);

  // Palette mapping, identical to the CPU path.
  float u = (out0 + 1.0) * 0.5;
  float t0 = u * u * (3.0 - 2.0 * u);
  float g = pow(max(0.0, out1), 2.2);
  float shade = 1.0 + out2 * 0.06;

  vec3 c = mix(paper, ink, t0);
  c = mix(c, accent, g);
  c *= shade;
  gl_FragColor = vec4(c / 255.0, 1.0);
}`;

function compile(gl, type, src) {
  const sh = gl.createShader(type);
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(sh);
    gl.deleteShader(sh);
    throw new Error(`shader: ${log}`);
  }
  return sh;
}

/**
 * Sets up the GL program and returns { render(layers, palette), resize(),
 * destroy() }, or null if WebGL is unavailable. The canvas is sized to its
 * CSS box times DPR, capped by GL_MAX_PIXELS so no device is asked to draw
 * more than it can comfortably.
 */
function makeGl(canvas) {
  // A canvas can only ever hold one kind of context. If the shader fails to
  // compile on this GPU, the fallback still needs a 2D context on the same
  // canvas, so probe the program on a scratch canvas first and only touch
  // the real one once the program is known to link.
  const probe = document.createElement('canvas');
  const pg = probe.getContext('webgl');
  if (!pg) return null;
  try {
    const vs = compile(pg, pg.VERTEX_SHADER, VERT);
    const fs = compile(pg, pg.FRAGMENT_SHADER, FRAG);
    const pp = pg.createProgram();
    pg.attachShader(pp, vs);
    pg.attachShader(pp, fs);
    pg.linkProgram(pp);
    if (!pg.getProgramParameter(pp, pg.LINK_STATUS)) return null;
  } catch {
    return null;
  } finally {
    pg.getExtension('WEBGL_lose_context')?.loseContext();
  }

  // preserveDrawingBuffer is off: keeping the last frame around costs a
  // copy every frame and is only needed to read pixels after the fact. The
  // acceptance suite instead draws and reads in the same task, via the
  // redraw hook exposed on the canvas below.
  const gl = canvas.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power' });
  if (!gl) return null;

  const vs = compile(gl, gl.VERTEX_SHADER, VERT);
  const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
  const program = gl.createProgram();
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null;
  gl.useProgram(program);

  // Two triangles covering clip space.
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
  const aLoc = gl.getAttribLocation(program, 'a');
  gl.enableVertexAttribArray(aLoc);
  gl.vertexAttribPointer(aLoc, 2, gl.FLOAT, false, 0, 0);

  const u = {
    w: ['w0', 'w1', 'w2', 'w3', 'wo'].map((n) => gl.getUniformLocation(program, n)),
    paper: gl.getUniformLocation(program, 'paper'),
    ink: gl.getUniformLocation(program, 'ink'),
    accent: gl.getUniformLocation(program, 'accent'),
  };

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, GL_MAX_DPR);
    let w = Math.max(1, Math.round(rect.width * dpr));
    let h = Math.max(1, Math.round(rect.height * dpr));
    const px = w * h;
    if (px > GL_MAX_PIXELS) {
      const s = Math.sqrt(GL_MAX_PIXELS / px);
      w = Math.round(w * s);
      h = Math.round(h * s);
    }
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    gl.viewport(0, 0, w, h);
  };

  const render = (layers, palette) => {
    for (let k = 0; k < layers.length; k++) gl.uniform1fv(u.w[k], layers[k].w);
    gl.uniform3fv(u.paper, palette[0]);
    gl.uniform3fv(u.ink, palette[1]);
    gl.uniform3fv(u.accent, palette[2]);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  };

  const destroy = () => {
    try {
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    } catch {}
  };

  return { gl, render, resize, destroy };
}

// ---------------------------------------------------------------- canvas2d

function makeCpu(canvas) {
  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) return null;
  canvas.width = CPU_W;
  canvas.height = CPU_H;
  const img = ctx.createImageData(CPU_W, CPU_H);
  const a = new Float32Array(INH);
  const b = new Float32Array(INH);

  const coords = new Float32Array(CPU_W * CPU_H * 3);
  for (let y = 0; y < CPU_H; y++) {
    for (let x = 0; x < CPU_W; x++) {
      const i = (y * CPU_W + x) * 3;
      const nx = (x / (CPU_W - 1)) * 2 - 1;
      const ny = (y / (CPU_H - 1)) * 2 - 1;
      coords[i] = nx * 2.2;
      coords[i + 1] = ny * 1.1;
      coords[i + 2] = Math.sqrt(nx * nx * 4 + ny * ny);
    }
  }

  const render = (layers, palette) => {
    const data = img.data;
    const [paper, ink, accent] = palette;
    for (let p = 0; p < CPU_W * CPU_H; p++) {
      const ci = p * 3;
      a[0] = coords[ci];
      a[1] = coords[ci + 1];
      a[2] = coords[ci + 2];
      a[3] = 1;
      let inp = a;
      let out = b;
      let inSize = IN0;
      for (let k = 0; k < layers.length; k++) {
        const L = layers[k];
        const w = L.w;
        const outSize = L.outSize;
        const last = k === layers.length - 1;
        for (let o = 0; o < outSize; o++) {
          let s = 0;
          const row = o * inSize;
          for (let i = 0; i < inSize; i++) s += w[row + i] * inp[i];
          out[o] = last || k === layers.length - 2 ? Math.tanh(s) : Math.sin(s);
        }
        if (!last) out[outSize] = 1;
        const tmp = inp;
        inp = out;
        out = tmp;
        inSize = outSize + 1;
      }
      const u = (inp[0] + 1) * 0.5;
      const t0 = u * u * (3 - 2 * u);
      const g = Math.max(0, inp[1]) ** 2.2;
      const shade = 1 + inp[2] * 0.06;
      let r = paper[0] + (ink[0] - paper[0]) * t0;
      let gg = paper[1] + (ink[1] - paper[1]) * t0;
      let bb = paper[2] + (ink[2] - paper[2]) * t0;
      r += (accent[0] - r) * g;
      gg += (accent[1] - gg) * g;
      bb += (accent[2] - bb) * g;
      const di = p * 4;
      data[di] = r * shade;
      data[di + 1] = gg * shade;
      data[di + 2] = bb * shade;
      data[di + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
  };

  return { render, resize: () => {}, destroy: () => {} };
}

// ---------------------------------------------------------------- component

export default function Atlas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const seed = (Date.now() ^ (Math.random() * 0xffffffff)) >>> 0;
    canvas.dataset.seed = String(seed);
    const layers = buildNet(seed);

    // ?atlas=cpu forces the fallback, for testing the path a WebGL-less
    // browser would take.
    const forceCpu = new URLSearchParams(location.search).get('atlas') === 'cpu';
    let renderer = forceCpu ? null : makeGl(canvas);
    let mode = renderer ? 'webgl' : 'canvas2d';
    if (!renderer) renderer = makeCpu(canvas);
    if (!renderer) return;
    canvas.dataset.renderer = mode;
    const fps = mode === 'webgl' ? GL_FPS : CPU_FPS;

    let palette = readPalette();
    let frames = 0;
    let raf = 0;
    let visible = true;
    let running = false;
    // The element being painted. Swapped for a fresh canvas if the GL
    // context is lost, see onLost below.
    let activeCanvas = canvas;
    const flat = flattenDrift(layers);
    const t0 = performance.now();

    renderer.resize();

    const frame = () => {
      const t = (performance.now() - t0) / 1000;
      driftWeights(flat, t);
      renderer.render(layers, palette);
      frames++;
      activeCanvas.dataset.frames = String(frames);
    };

    // Pacing is rAF alone: one scheduler entry per frame, aligned to the
    // compositor. The previous version nested a setTimeout inside a rAF,
    // which cost two wakeups per frame and landed draws mid-frame. At
    // GL_FPS 60 the interval is below one frame, so this draws every tick;
    // the check keeps the loop honest if the rate is ever lowered.
    const interval = 1000 / fps;
    let last = -Infinity;
    const loop = (now) => {
      if (!running) return;
      if (now - last >= interval - 1) {
        last = now;
        frame();
      }
      raf = requestAnimationFrame(loop);
    };

    // Lets a test draw and read in the same task, which is what removing
    // preserveDrawingBuffer requires: without it the backbuffer is cleared
    // once the frame is presented.
    canvas.__atlasRedraw = frame;

    const start = () => {
      if (running || reduced) return;
      running = true;
      activeCanvas.dataset.running = 'true';
      raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      running = false;
      activeCanvas.dataset.running = 'false';
      cancelAnimationFrame(raf);
    };

    // First frame always, so the plate is never blank; reduced motion stops
    // here with a single still.
    frame();
    if (reduced) activeCanvas.dataset.running = 'false';

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

    // Re-ink on theme change. Always repaint one frame: the footer toggle
    // scrolls the plate offscreen in the same task, and the pause observer
    // fires after this callback, so a conditional repaint would be skipped.
    const mo = new MutationObserver(() => {
      palette = readPalette();
      frame();
    });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    // Resize follows the CSS box so the GL buffer stays at native pixels.
    const ro = new ResizeObserver(() => {
      renderer.resize();
      if (!running) frame();
    });
    ro.observe(canvas);

    // If the GL context is lost (GPU reset, tab backgrounded on mobile), fall
    // back to the CPU path for the rest of the visit rather than go blank. A
    // canvas that has held a WebGL context cannot hand out a 2D one, so the
    // fallback paints to a fresh canvas swapped into the same slot.
    const onLost = (e) => {
      e.preventDefault();
      stop();
      renderer.destroy();
      const fresh = canvas.cloneNode(false);
      fresh.removeAttribute('width');
      fresh.removeAttribute('height');
      canvas.replaceWith(fresh);
      activeCanvas = fresh;
      fresh.__atlasRedraw = frame;
      renderer = makeCpu(fresh);
      mode = 'canvas2d';
      fresh.dataset.renderer = mode;
      fresh.dataset.seed = canvas.dataset.seed;
      if (renderer) {
        frame();
        if (visible && !document.hidden) start();
      }
    };
    canvas.addEventListener('webglcontextlost', onLost);

    return () => {
      stop();
      io.disconnect();
      mo.disconnect();
      ro.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      canvas.removeEventListener('webglcontextlost', onLost);
      renderer.destroy();
    };
  }, []);

  return (
    <figure className="atlas-plate">
      <div className="atlas-frame">
        <canvas
          ref={canvasRef}
          className="atlas"
          width={CPU_W}
          height={CPU_H}
          aria-label="A small neural network painting a slowly changing field"
          role="img"
        />
        <noscript>
          <svg className="atlas atlas-static" viewBox="0 0 128 128" preserveAspectRatio="none" aria-hidden="true">
            <defs>
              <radialGradient id="atlas-g" cx="40%" cy="38%" r="70%">
                <stop offset="0" stopColor="var(--accent)" stopOpacity="0.55" />
                <stop offset="0.45" stopColor="var(--ink-soft)" stopOpacity="0.5" />
                <stop offset="1" stopColor="var(--paper)" />
              </radialGradient>
            </defs>
            <rect width="128" height="128" fill="url(#atlas-g)" />
          </svg>
        </noscript>
      </div>
      <figcaption className="atlas-caption">
        <span className="tag">Fig. 0 — Atlas</span>
        <span className="atlas-note">
          A four-layer network, ~1,200 weights, seeded by the moment you
          arrived. It drifts; it never repeats.
        </span>
      </figcaption>
    </figure>
  );
}

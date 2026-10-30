// Benchmarks the atlas fragment shader against a mat4-packed variant that
// computes the identical network, using EXT_disjoint_timer_query for real
// GPU time rather than wall clock (drawArrays returns before the GPU runs).
//
// Verdict, measured on an M4 Pro at 1984x850:
//
//   current  0.0203 ms GPU, 0.0248 ms CPU per frame
//   mat4     0.0140 ms GPU, 0.0248 ms CPU per frame
//
// The mat4 packing saves ~0.006 ms of GPU time per frame, which at 60fps is
// 0.02% of one core, and saves nothing on the CPU side (the cost there is
// uniform upload, which both variants do identically). The scalar shader
// stays: it is the one a reader can follow against the CPU fallback, and
// the win does not pay for a second implementation of the network.
//
// Usage: node scripts/bench-shader.mjs
import { createRequire } from 'module';
import { readFileSync } from 'fs';
const require = createRequire(import.meta.url);
// PLAYWRIGHT_PATH points at any playwright install; CHROME_PATH at any
// Chromium build (default: the installed Chrome channel).
const pwPath = process.env.PLAYWRIGHT_PATH ?? '/Users/blare/.npm/_npx/e41f203b7505f1fb/node_modules/playwright';
const { chromium } = require(pwPath);

const HIDDEN = 16;
const IN0 = 4;
const INH = HIDDEN + 1;

// Pull the live shader out of the component so the benchmark can never drift
// from what ships.
const src = readFileSync(new URL('../components/Atlas.jsx', import.meta.url), 'utf8');
const VERT = src.match(/const VERT = `([\s\S]*?)`;/)[1];
const FRAG = eval('`' + src.match(/const FRAG = `([\s\S]*?)`;/)[1] + '`');

/**
 * mat4 variant computing the identical network.
 *
 * A 16x16 hidden layer is four output quarters, each needing all four input
 * quarters: 16 mat4 products per layer, not four. (An earlier draft computed
 * one quarter and swizzled it into the other three, which is a different and
 * much smaller network; it benchmarked 15x faster for exactly that reason.)
 * GLSL ES 1.0 has no tanh, so it is polyfilled.
 */
const FRAG_MAT = `
precision highp float;
varying vec2 v;
// Layer 0: 16 outputs from (x, y, r, 1) -> four mat4 rows.
uniform mat4 L0[4];
// Layers 1..3: each 16x16 needs 16 mat4 blocks (4 out quarters x 4 in
// quarters), plus a bias vec4 per out quarter.
uniform mat4 W1[48];
uniform vec4 B1[12];
// Output: 3 rows of 16 + bias.
uniform vec4 WO[12];
uniform vec4 BO;
uniform vec3 paper;
uniform vec3 ink;
uniform vec3 accent;

vec4 tanh4(vec4 x) {
  vec4 e = exp(2.0 * clamp(x, -20.0, 20.0));
  return (e - 1.0) / (e + 1.0);
}

void main() {
  float nx = v.x;
  float ny = -v.y;
  vec4 inp = vec4(nx * 2.2, ny * 1.1, sqrt(nx * nx * 4.0 + ny * ny), 1.0);

  vec4 h0 = sin(L0[0] * inp);
  vec4 h1 = sin(L0[1] * inp);
  vec4 h2 = sin(L0[2] * inp);
  vec4 h3 = sin(L0[3] * inp);

  for (int L = 0; L < 3; L++) {
    vec4 o0 = W1[L * 16 + 0] * h0 + W1[L * 16 + 1] * h1 + W1[L * 16 + 2] * h2 + W1[L * 16 + 3] * h3 + B1[L * 4 + 0];
    vec4 o1 = W1[L * 16 + 4] * h0 + W1[L * 16 + 5] * h1 + W1[L * 16 + 6] * h2 + W1[L * 16 + 7] * h3 + B1[L * 4 + 1];
    vec4 o2 = W1[L * 16 + 8] * h0 + W1[L * 16 + 9] * h1 + W1[L * 16 + 10] * h2 + W1[L * 16 + 11] * h3 + B1[L * 4 + 2];
    vec4 o3 = W1[L * 16 + 12] * h0 + W1[L * 16 + 13] * h1 + W1[L * 16 + 14] * h2 + W1[L * 16 + 15] * h3 + B1[L * 4 + 3];
    if (L == 2) {
      h0 = tanh4(o0); h1 = tanh4(o1); h2 = tanh4(o2); h3 = tanh4(o3);
    } else {
      h0 = sin(o0); h1 = sin(o1); h2 = sin(o2); h3 = sin(o3);
    }
  }

  vec3 o;
  o.x = dot(WO[0], h0) + dot(WO[1], h1) + dot(WO[2], h2) + dot(WO[3], h3) + BO.x;
  o.y = dot(WO[4], h0) + dot(WO[5], h1) + dot(WO[6], h2) + dot(WO[7], h3) + BO.y;
  o.z = dot(WO[8], h0) + dot(WO[9], h1) + dot(WO[10], h2) + dot(WO[11], h3) + BO.z;
  o = tanh4(vec4(o, 0.0)).xyz;

  float u = (o.x + 1.0) * 0.5;
  float t0 = u * u * (3.0 - 2.0 * u);
  float g = pow(max(0.0, o.y), 2.2);
  vec3 c = mix(paper, ink, t0);
  c = mix(c, accent, g);
  c *= 1.0 + o.z * 0.06;
  gl_FragColor = vec4(c / 255.0, 1.0);
}`;

const browser = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH, args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] } : { channel: 'chrome' });
const page = await browser.newPage();
await page.goto('about:blank');

const out = await page.evaluate(
  async ([fragA, fragB, vert, H, I0, IH]) => {
    const results = {};

    const build = (frag, W, Ht) => {
      const c = document.createElement('canvas');
      c.width = W;
      c.height = Ht;
      const gl = c.getContext('webgl', { antialias: false, alpha: false });
      const mk = (t, s) => {
        const sh = gl.createShader(t);
        gl.shaderSource(sh, s);
        gl.compileShader(sh);
        if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh));
        return sh;
      };
      const pr = gl.createProgram();
      gl.attachShader(pr, mk(gl.VERTEX_SHADER, vert));
      gl.attachShader(pr, mk(gl.FRAGMENT_SHADER, frag));
      gl.linkProgram(pr);
      if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(pr));
      gl.useProgram(pr);
      const buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
      const al = gl.getAttribLocation(pr, 'a');
      gl.enableVertexAttribArray(al);
      gl.vertexAttribPointer(al, 2, gl.FLOAT, false, 0, 0);
      gl.viewport(0, 0, W, Ht);
      return { gl, pr, c };
    };

    const rnd = (n) => Float32Array.from({ length: n }, () => Math.random() * 2 - 1);

    const setA = (gl, pr) => {
      const u = (n) => gl.getUniformLocation(pr, n);
      gl.uniform1fv(u('w0'), rnd(H * I0));
      gl.uniform1fv(u('w1'), rnd(H * IH));
      gl.uniform1fv(u('w2'), rnd(H * IH));
      gl.uniform1fv(u('w3'), rnd(H * IH));
      gl.uniform1fv(u('wo'), rnd(3 * IH));
      gl.uniform3fv(u('paper'), [243, 241, 236]);
      gl.uniform3fv(u('ink'), [77, 72, 64]);
      gl.uniform3fv(u('accent'), [35, 64, 142]);
    };

    const setB = (gl, pr) => {
      const u = (n) => gl.getUniformLocation(pr, n);
      gl.uniformMatrix4fv(u('L0'), false, rnd(16 * 4));
      gl.uniformMatrix4fv(u('W1'), false, rnd(16 * 48));
      gl.uniform4fv(u('B1'), rnd(4 * 12));
      gl.uniform4fv(u('WO'), rnd(4 * 12));
      gl.uniform4fv(u('BO'), rnd(4));
      gl.uniform3fv(u('paper'), [243, 241, 236]);
      gl.uniform3fv(u('ink'), [77, 72, 64]);
      gl.uniform3fv(u('accent'), [35, 64, 142]);
    };

    // Real GPU time. drawArrays is asynchronous, so wall clock around it
    // measures the CPU submit, not the shader. The timer query brackets the
    // work on the GPU itself.
    const gpuTime = async (ctx, setU, draws) => {
      const { gl, pr } = ctx;
      const ext = gl.getExtension('EXT_disjoint_timer_query');
      if (!ext) return null;
      setU(gl, pr);
      for (let i = 0; i < 10; i++) gl.drawArrays(gl.TRIANGLES, 0, 6);
      gl.finish();
      const q = ext.createQueryEXT();
      ext.beginQueryEXT(ext.TIME_ELAPSED_EXT, q);
      for (let i = 0; i < draws; i++) gl.drawArrays(gl.TRIANGLES, 0, 6);
      ext.endQueryEXT(ext.TIME_ELAPSED_EXT);
      gl.flush();
      for (let i = 0; i < 400; i++) {
        if (ext.getQueryObjectEXT(q, ext.QUERY_RESULT_AVAILABLE_EXT)) break;
        await new Promise((r) => setTimeout(r, 5));
      }
      if (gl.getParameter(ext.GPU_DISJOINT_EXT)) return null;
      if (!ext.getQueryObjectEXT(q, ext.QUERY_RESULT_AVAILABLE_EXT)) return null;
      return ext.getQueryObjectEXT(q, ext.QUERY_RESULT_EXT) / 1e6 / draws;
    };

    // CPU submit cost: how long the main thread spends uploading + issuing.
    const cpuTime = (ctx, setU, n) => {
      const { gl, pr } = ctx;
      for (let i = 0; i < 20; i++) { setU(gl, pr); gl.drawArrays(gl.TRIANGLES, 0, 6); }
      const t = performance.now();
      for (let i = 0; i < n; i++) { setU(gl, pr); gl.drawArrays(gl.TRIANGLES, 0, 6); }
      return (performance.now() - t) / n;
    };

    for (const [W, Ht, label] of [[1984, 850, '1984x850 (2x dpr)'], [992, 425, '992x425 (1x dpr)']]) {
      for (const [name, frag, setU] of [['current', fragA, setA], ['mat4', fragB, setB]]) {
        try {
          const ctx = build(frag, W, Ht);
          const gpu = await gpuTime(ctx, setU, 200);
          const cpu = cpuTime(ctx, setU, 500);
          results[`${label} / ${name}`] = {
            gpuMsPerFrame: gpu === null ? 'n/a' : +gpu.toFixed(4),
            cpuMsPerFrame: +cpu.toFixed(4),
            pctOfCoreAt60fps: +(cpu * 60 / 10).toFixed(3),
          };
          ctx.gl.getExtension('WEBGL_lose_context')?.loseContext();
        } catch (e) {
          results[`${label} / ${name}`] = { error: String(e.message || e).slice(0, 200) };
        }
      }
    }
    return results;
  },
  [FRAG, FRAG_MAT, VERT, HIDDEN, IN0, INH],
);

console.log(JSON.stringify(out, null, 1));
await browser.close();

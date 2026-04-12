'use client';

import { useEffect, useState } from 'react';

/**
 * Detects if hardware-accelerated GPU is available.
 * Returns: { hasGpu: boolean, mobile: boolean }
 * Falls back to true on SSR to avoid layout shift.
 */
export function useGpu() {
  const [result, setResult] = useState({ hasGpu: true, mobile: false });

  useEffect(() => {
    const mobile = window.innerWidth < 768;
    let hasGpu = true;

    try {
      const canvas = document.createElement('canvas');
      const gl =
        canvas.getContext('webgl2') ||
        canvas.getContext('webgl') ||
        canvas.getContext('experimental-webgl');

      if (!gl) {
        hasGpu = false;
      } else {
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
          const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL).toLowerCase();
          // Software renderers: SwiftShader, llvmpipe, Mesa, Microsoft Basic Render
          if (
            renderer.includes('swiftshader') ||
            renderer.includes('llvmpipe') ||
            renderer.includes('software') ||
            renderer.includes('microsoft basic')
          ) {
            hasGpu = false;
          }
        }
        // Clean up WebGL context
        const ext = gl.getExtension('WEBGL_lose_context');
        if (ext) ext.loseContext();
      }
    } catch {
      hasGpu = false;
    }

    setResult({ hasGpu, mobile });
  }, []);

  return result;
}

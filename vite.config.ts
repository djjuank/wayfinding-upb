import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

// Modos:
//  - build normal (PWA, para GitHub Pages / Cloudflare Pages / kiosco): dist/
//  - build --mode single: un único HTML autocontenido (sin service worker)
export default defineConfig(({ mode }) => {
  const single = mode === 'single';
  return {
    base: './',
    define: { __SINGLE__: JSON.stringify(single), __MOBILE_BASE__: JSON.stringify(process.env.MOBILE_BASE ?? '') },
    plugins: single ? [viteSingleFile()] : [],
    build: {
      target: 'es2020',
      outDir: single ? 'dist-single' : 'dist',
      assetsInlineLimit: single ? 100_000_000 : 4096,
    },
  };
});

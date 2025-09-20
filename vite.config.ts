import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, loadEnv } from 'vite';


export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    const __dirname = dirname(fileURLToPath(import.meta.url));
    const isGhPages = mode === 'gh-pages';

    return {
      // Use repo base only for GitHub Pages builds; '/' elsewhere (local, Netlify, Vercel, etc.)
      base: isGhPages ? '/SPOTTY/' : '/',
      plugins: [],
      // No client-side secret injection; app is fully static.
      resolve: {
        alias: {
          '@': resolve(__dirname, '.'),
        }
      },
      build: {
        outDir: 'dist',
        assetsDir: 'assets',
        // Ensure proper asset handling for GitHub Pages
        rollupOptions: {
          output: {
            manualChunks: undefined,
          }
        }
      },
      esbuild: {
        // Disable type checking during build to avoid TS errors causing build failures
        logOverride: { 'this-is-undefined-in-esm': 'silent' }
      }
    };
});

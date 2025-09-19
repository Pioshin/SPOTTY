import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, loadEnv } from 'vite';


export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  const __dirname = dirname(fileURLToPath(import.meta.url));
    return {
  // Base public path for GitHub Pages project site: https://pioshin.github.io/SPOTTY/
  // If you fork/rename the repo, update this to match your repo name (leading and trailing slashes required).
  base: '/SPOTTY/',
      plugins: [],
  // No client-side secret injection; app is fully static.
      resolve: {
        alias: {
      '@': resolve(__dirname, '.'),
        }
      }
    };
});

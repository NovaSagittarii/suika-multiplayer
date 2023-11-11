import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import wasm from 'vite-plugin-wasm';
import topLevelAwait from 'vite-plugin-top-level-await';

// https://dkd4pk-24678.sse.codesandbox.io/
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), wasm(), topLevelAwait()],
  server: {
    hmr: {
      port: +process.env.APP_PORT || 3010,
      // clientPort: 443,
      // path: "/vite-hmr"
    },
  },
});

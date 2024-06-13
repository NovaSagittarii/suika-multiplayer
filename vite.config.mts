import { defineConfig } from 'vite';
import { resolve } from 'path';
import react from '@vitejs/plugin-react';
import wasm from 'vite-plugin-wasm';
import topLevelAwait from 'vite-plugin-top-level-await';

// https://dkd4pk-24678.sse.codesandbox.io/
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), wasm(), topLevelAwait()],
  server: {
    hmr: {
      port: process.env.APP_PORT ? +process.env.APP_PORT : 3010,
      // clientPort: 443,
      // path: "/vite-hmr"
    },
    cors: {
      origin: [/^http:\/\/localhost/],
    }
  },
  resolve: {
    alias: [
      {
        find: '@/build',
        replacement: resolve(__dirname, 'build'),
      },
      {
        find: '@/proto',
        replacement: resolve(__dirname, 'build/bundle_proto'),
      },
      {
        find: '@/server',
        replacement: resolve(__dirname, 'src/server'),
      },
      {
        find: '@/lib',
        replacement: resolve(__dirname, 'src/lib'),
      },
      {
        find: '@/constants',
        replacement: resolve(__dirname, 'src/constants'),
      },
      {
        find: '@/suika',
        replacement: resolve(__dirname, 'src/suika'),
      },
    ],
  },
});
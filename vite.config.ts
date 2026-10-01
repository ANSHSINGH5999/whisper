/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import wasm from 'vite-plugin-wasm';

export default defineConfig({
  // Serves managed/whisper/{keys,zkir} at the site root for FetchZkConfigProvider.
  publicDir: 'managed/whisper',
  plugins: [react(), wasm()],
  build: {
    target: 'esnext',
    chunkSizeWarningLimit: 12000,
    // isomorphic-ws has no named WebSocket export in browsers; graphql-ws falls back to the native one.
    rolldownOptions: { checks: { importIsUndefined: false } },
  },
  optimizeDeps: {
    include: ['@midnight-ntwrk/compact-runtime'],
    exclude: ['@midnight-ntwrk/onchain-runtime-v3'],
  },
  test: { include: ['tests/**/*.test.ts'] },
});

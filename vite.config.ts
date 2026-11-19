/// <reference types="vitest/config" />
import { execSync } from 'node:child_process';
import { fileURLToPath, URL } from 'node:url';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

/** The commit this build was made from, or 'dev' where git can't say (a copied folder). */
function buildCommit(): string {
  try {
    return execSync('git rev-parse --short HEAD', { stdio: ['ignore', 'pipe', 'ignore'] })
      .toString()
      .trim();
  } catch {
    return 'dev';
  }
}

export default defineConfig({
  // Which build this is, shown on the title screen and in Settings (`game/buildStamp.ts`).
  define: {
    __BUILD_COMMIT__: JSON.stringify(buildCommit()),
    __BUILD_DATE__: JSON.stringify(new Date().toISOString().slice(0, 10)),
  },
  // Relative base so the build works from any static host sub-path (e.g. GitHub Pages).
  base: './',
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg', 'apple-touch-icon.png'],
      // Fonts are precached too, or the game falls back to system fonts offline. The game is one
      // bundle of code and content (both packs in a personal build), past workbox's 2 MiB default;
      // anything not precached is missing offline, so the limit sits well above it.
      workbox: {
        globPatterns: ['**/*.{js,css,html,woff2}'],
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
      },
      manifest: {
        name: 'Shinobi RPG — Lantern Village',
        short_name: 'Shinobi RPG',
        description: 'A text-based shinobi life RPG you can play offline.',
        theme_color: '#14121a',
        background_color: '#14121a',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.{ts,tsx}', 'electron/**/*.test.ts'],
    setupFiles: ['src/test/setup.ts'],
    // Whole fights and UI rounds take seconds each, and a busy CI runner can double that: the
    // default 5s failed tests that run in under 3s locally.
    testTimeout: 20_000,
  },
});

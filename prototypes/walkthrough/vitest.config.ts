import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vitest/config';

/** The fight walkthrough runs on its own: `npx vitest run --config prototypes/walkthrough/vitest.config.ts`. */
export default defineConfig({
  resolve: { alias: { '@': fileURLToPath(new URL('../../src', import.meta.url)) } },
  test: {
    include: ['prototypes/walkthrough/**/*.test.ts'],
    root: fileURLToPath(new URL('../..', import.meta.url)),
    globals: true,
    testTimeout: 3_600_000,
  },
});

import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vitest/config';

/** The cue prototype runs on its own: `npx vitest run --config prototypes/cues/vitest.config.ts`. */
export default defineConfig({
  resolve: { alias: { '@': fileURLToPath(new URL('../../src', import.meta.url)) } },
  test: {
    include: ['prototypes/cues/**/*.test.ts'],
    root: fileURLToPath(new URL('../..', import.meta.url)),
    globals: true,
    testTimeout: 1_200_000,
  },
});

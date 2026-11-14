import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vitest/config';

/**
 * The timing study: `npx vitest run --config prototypes/combat-planner/timing/vitest.config.ts <file>`.
 * Narration is silenced with the perf study's mocks (non-empty constants, outcomes identical).
 */
export default defineConfig({
  resolve: { alias: { '@': fileURLToPath(new URL('../../../src', import.meta.url)) } },
  test: {
    include: ['prototypes/combat-planner/timing/*.test.ts'],
    root: fileURLToPath(new URL('../../..', import.meta.url)),
    setupFiles: [
      fileURLToPath(new URL('../perf/silent/setup.ts', import.meta.url)),
      fileURLToPath(new URL('./silence.ts', import.meta.url)),
    ],
    globals: true,
    testTimeout: 7_200_000,
  },
});

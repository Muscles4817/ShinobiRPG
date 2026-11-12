import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vitest/config';

/** The planner prototype runs on its own: `npx vitest run --config prototypes/combat-planner/vitest.config.ts`. */
export default defineConfig({
  resolve: { alias: { '@': fileURLToPath(new URL('../../src', import.meta.url)) } },
  test: {
    include: ['prototypes/combat-planner/**/*.test.ts'],
    // The perf comparison has its own configs (`perf/vitest.config.ts`, `perf/silent/`).
    exclude: ['**/node_modules/**', 'prototypes/combat-planner/perf/**'],
    root: fileURLToPath(new URL('../..', import.meta.url)),
    globals: true,
    testTimeout: 600_000,
  },
});

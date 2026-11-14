import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vitest/config';

/** The perf comparison: `npx vitest run --config prototypes/combat-planner/perf/vitest.config.ts <file>`. */
export default defineConfig({
  resolve: { alias: { '@': fileURLToPath(new URL('../../../src', import.meta.url)) } },
  test: {
    include: ['prototypes/combat-planner/perf/*.test.ts'],
    root: fileURLToPath(new URL('../../..', import.meta.url)),
    globals: true,
    testTimeout: 3_600_000,
  },
});

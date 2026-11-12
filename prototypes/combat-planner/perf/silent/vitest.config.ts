import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vitest/config';

/** The silent-exchange measurement: `npx vitest run --config prototypes/combat-planner/perf/silent/vitest.config.ts`. */
export default defineConfig({
  resolve: { alias: { '@': fileURLToPath(new URL('../../../../src', import.meta.url)) } },
  test: {
    include: ['prototypes/combat-planner/perf/silent/**/*.test.ts'],
    root: fileURLToPath(new URL('../../../..', import.meta.url)),
    setupFiles: [fileURLToPath(new URL('./setup.ts', import.meta.url))],
    globals: true,
    testTimeout: 1_800_000,
  },
});

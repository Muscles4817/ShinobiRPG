import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vitest/config';

/** The planner diagnosis runs on its own: `npx vitest run --config prototypes/planner-diag/vitest.config.ts`. */
export default defineConfig({
  resolve: { alias: { '@': fileURLToPath(new URL('../../src', import.meta.url)) } },
  test: {
    include: ['prototypes/planner-diag/**/*.test.ts'],
    root: fileURLToPath(new URL('../..', import.meta.url)),
    globals: true,
    testTimeout: 7_200_000,
  },
});

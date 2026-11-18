import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vitest/config';

/** The jutsu audit runs on its own: `npx vitest run --config prototypes/jutsu-audit/vitest.config.ts`. */
export default defineConfig({
  resolve: { alias: { '@': fileURLToPath(new URL('../../src', import.meta.url)) } },
  test: {
    include: ['prototypes/jutsu-audit/**/*.test.ts'],
    root: fileURLToPath(new URL('../..', import.meta.url)),
    globals: true,
    testTimeout: 7_200_000,
  },
});

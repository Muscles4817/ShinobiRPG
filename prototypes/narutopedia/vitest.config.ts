import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vitest/config';

/** The pack dump runs on its own: `npx vitest run --config prototypes/narutopedia/vitest.config.ts`. */
export default defineConfig({
  resolve: { alias: { '@': fileURLToPath(new URL('../../src', import.meta.url)) } },
  test: {
    include: ['prototypes/narutopedia/**/*.test.ts'],
    root: fileURLToPath(new URL('../..', import.meta.url)),
    globals: true,
  },
});

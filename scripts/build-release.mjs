// Builds the release game (the `original` pack only) into dist-release. A script rather than an
// inline `VAR=value vite build` so it runs the same in a Windows shell as anywhere else.
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const vite = fileURLToPath(new URL('../node_modules/vite/bin/vite.js', import.meta.url));
const result = spawnSync(process.execPath, [vite, 'build', '--outDir', 'dist-release'], {
  stdio: 'inherit',
  env: { ...process.env, VITE_EXCLUDE_FAN_PACKS: 'true' },
});
process.exit(result.status ?? 1);

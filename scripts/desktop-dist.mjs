// Packages the desktop app from the release build, then checks what was packed. Any arguments
// go to electron-builder (`npm run desktop:dist -- --linux`); without them it builds for this OS.
import { spawnSync } from 'node:child_process';

function run(command, args) {
  const result = spawnSync(command, args, {
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const npx = process.platform === 'win32' ? 'npx.cmd' : 'npx';

run(npm, ['run', 'check:release']);
run(npm, ['run', 'desktop:build']);
run(npx, [
  'electron-builder',
  '--config',
  'electron-builder.json',
  '--publish',
  'never',
  ...process.argv.slice(2),
]);
run(process.execPath, ['scripts/check-package.mjs', 'release']);

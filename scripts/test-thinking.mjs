// Runs the tests with foes thinking ahead, as the game plays them. The pipeline (and plain
// `npm test`) plays every fight by instinct, since thinking costs about eight times as much a
// fight; this is for a machine with the compute to spare. The benches are the point:
//   npm run test:thinking                       every test
//   npm run test:thinking -- src/test/bench     the benches only
// The default time limit is lifted; a test with a limit of its own keeps it.
import { spawn } from 'node:child_process';

const NO_LIMIT_MS = '3600000';

const run = spawn(
  'npx',
  ['vitest', 'run', `--testTimeout=${NO_LIMIT_MS}`, ...process.argv.slice(2)],
  {
    stdio: 'inherit',
    shell: process.platform === 'win32',
    env: { ...process.env, VITE_BENCH_THINKING: 'true' },
  },
);
run.on('exit', (code) => process.exit(code ?? 1));

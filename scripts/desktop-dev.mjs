// The desktop app in development: starts the Vite dev server, then Electron pointed at it,
// and stops the server when the app closes. Hot reload works as in the browser; saves go to
// the app's data folder as in the packaged app.
import { spawn } from 'node:child_process';

import electron from 'electron';
import { createServer } from 'vite';

const server = await createServer();
await server.listen();
const url = server.resolvedUrls?.local[0];
if (!url) throw new Error('The dev server has no local address.');

const app = spawn(electron, ['.'], {
  stdio: 'inherit',
  env: { ...process.env, SHINOBI_DEV_SERVER: url },
});
app.on('exit', (code) => {
  void server.close().then(() => process.exit(code ?? 0));
});

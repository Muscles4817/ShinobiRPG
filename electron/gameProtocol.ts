/**
 * Serves the built game from `app://game/`, a secure standard scheme of its own, rather than
 * `file://`: module scripts, relative paths and the page's origin behave as on a web host. Only
 * files inside the game's folder are served, each under the strict policy in `gameFiles.ts`.
 */
import { readFile } from 'node:fs/promises';

import { protocol } from 'electron';

import { CONTENT_SECURITY_POLICY, GAME_SCHEME, gameFileFor, mimeTypeOf } from './gameFiles.js';

/** Must run before the app is ready: the scheme's privileges are fixed at start-up. */
export function registerGameScheme(): void {
  protocol.registerSchemesAsPrivileged([
    {
      scheme: GAME_SCHEME,
      privileges: { standard: true, secure: true, supportFetchAPI: true },
    },
  ]);
}

function notFound(): Response {
  return new Response('Not found', { status: 404, headers: { 'content-type': 'text/plain' } });
}

export function serveGame(gameFolder: string): void {
  protocol.handle(GAME_SCHEME, async (request) => {
    const file = gameFileFor(request.url, gameFolder);
    if (!file) return notFound();
    try {
      const body = await readFile(file);
      return new Response(body, {
        headers: {
          'content-type': mimeTypeOf(file),
          'content-security-policy': CONTENT_SECURITY_POLICY,
          'x-content-type-options': 'nosniff',
        },
      });
    } catch {
      return notFound();
    }
  });
}

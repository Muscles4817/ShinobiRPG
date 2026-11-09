/**
 * Where the game is served from (`app://game/`), the policy every page is served under, and
 * which file a URL names: never one outside the game's folder.
 */
import { extname, join, resolve, sep } from 'node:path';

export const GAME_SCHEME = 'app';
export const GAME_HOST = 'game';
export const GAME_ORIGIN = `${GAME_SCHEME}://${GAME_HOST}`;
export const GAME_ENTRY = `${GAME_ORIGIN}/index.html`;

/**
 * The game's own scripts, styles and fonts, and nothing from anywhere else. Styles allow inline:
 * React sets `style` attributes. Images allow `data:` for the paper grain, fonts for the small
 * font subsets the build inlines. Nothing may connect out, frame anything, start a worker or
 * post a form.
 */
export const CONTENT_SECURITY_POLICY = [
  "default-src 'none'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self' data:",
  "media-src 'self'",
  "connect-src 'self'",
  "manifest-src 'self'",
  "worker-src 'none'",
  "object-src 'none'",
  "frame-src 'none'",
  "base-uri 'none'",
  "form-action 'none'",
].join('; ');

const MIME_TYPES: Readonly<Record<string, string>> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
};

/** The file a game URL names, or null if it isn't the game's or is outside its folder. */
export function gameFileFor(url: string, gameFolder: string): string | null {
  const { protocol, host, pathname } = new URL(url);
  if (protocol !== `${GAME_SCHEME}:` || host !== GAME_HOST) return null;
  const root = resolve(gameFolder);
  let relative: string;
  try {
    relative = decodeURIComponent(pathname === '/' ? '/index.html' : pathname);
  } catch {
    return null;
  }
  const file = resolve(join(root, relative));
  return file.startsWith(root + sep) ? file : null;
}

/**
 * Where a URL is served from: scheme and host. Not `URL.origin`, which Node gives as "null" for
 * a scheme it doesn't know, such as the game's own.
 */
export function siteOf(url: string): string | null {
  try {
    const { protocol, host } = new URL(url);
    return `${protocol}//${host}`;
  } catch {
    return null;
  }
}

/** Whether a URL is served from the same place as the game's entry page. */
export function onSite(url: string, entry: string): boolean {
  const site = siteOf(entry);
  return site !== null && siteOf(url) === site;
}

/** The content type to serve a file as. */
export function mimeTypeOf(file: string): string {
  return MIME_TYPES[extname(file).toLowerCase()] ?? 'application/octet-stream';
}

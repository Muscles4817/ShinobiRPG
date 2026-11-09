import { join, resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import {
  CONTENT_SECURITY_POLICY,
  GAME_ENTRY,
  gameFileFor,
  mimeTypeOf,
  onSite,
} from './gameFiles.js';

const folder = resolve('/games/shinobi/dist-release');

describe('serving the game from its own scheme', () => {
  it('maps the game’s URLs to files in its folder', () => {
    expect(gameFileFor('app://game/', folder)).toBe(join(folder, 'index.html'));
    expect(gameFileFor('app://game/assets/index-abc.js', folder)).toBe(
      join(folder, 'assets', 'index-abc.js'),
    );
    expect(gameFileFor('app://game/icon%20big.png', folder)).toBe(join(folder, 'icon big.png'));
  });

  it('never serves a file outside the folder, or for another host', () => {
    expect(gameFileFor('app://game/..%2F..%2Fsecrets.txt', folder)).toBeNull();
    expect(gameFileFor('app://game/%E0%A4%A', folder)).toBeNull();
    expect(gameFileFor('app://elsewhere/index.html', folder)).toBeNull();
    expect(gameFileFor('https://game/index.html', folder)).toBeNull();
  });

  it('knows the game’s own pages from anything else', () => {
    expect(onSite('app://game/index.html', GAME_ENTRY)).toBe(true);
    expect(onSite('app://game/assets/a.js', GAME_ENTRY)).toBe(true);
    expect(onSite('app://elsewhere/index.html', GAME_ENTRY)).toBe(false);
    expect(onSite('https://wa.me/?text=hi', GAME_ENTRY)).toBe(false);
    expect(onSite('not a url', GAME_ENTRY)).toBe(false);
    expect(onSite('http://localhost:5173/', 'http://localhost:5173/')).toBe(true);
    expect(onSite('http://localhost:5174/', 'http://localhost:5173/')).toBe(false);
  });

  it('serves scripts as modules can load them', () => {
    expect(mimeTypeOf('a/index-abc.js')).toBe('text/javascript; charset=utf-8');
    expect(mimeTypeOf('a/font.woff2')).toBe('font/woff2');
    expect(mimeTypeOf('a/unknown.bin')).toBe('application/octet-stream');
  });

  it('lets nothing reach the network', () => {
    expect(CONTENT_SECURITY_POLICY).toContain("default-src 'none'");
    expect(CONTENT_SECURITY_POLICY).toContain("connect-src 'self'");
    expect(CONTENT_SECURITY_POLICY).not.toMatch(/https?:|\*/);
  });
});

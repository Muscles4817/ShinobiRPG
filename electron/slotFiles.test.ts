import { mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { SLOTS as GAME_SLOTS } from '../src/platform/storageBackend.js';
import { SAVES_FOLDER, slotFiles } from './slotFiles.js';
import { MAX_SLOT_BYTES, SLOTS, slotDataFrom, slotFrom } from './slots.js';

let dataFolder = '';
const saves = () => join(dataFolder, SAVES_FOLDER);

beforeEach(async () => {
  dataFolder = await mkdtemp(join(tmpdir(), 'shinobi-slots-'));
});
afterEach(async () => {
  await rm(dataFolder, { recursive: true, force: true });
});

describe('the desktop app’s save files', () => {
  it('keeps each slot as a file and reads it back', async () => {
    const files = slotFiles(dataFolder);
    expect(await files.read('save')).toBeNull();
    await files.write('save', '{"day":1}');
    await files.write('prefs', '{"music":0.5}');
    expect(await files.read('save')).toBe('{"day":1}');
    expect(await files.read('prefs')).toBe('{"music":0.5}');
    expect(await readFile(join(saves(), 'save.json'), 'utf8')).toBe('{"day":1}');
  });

  it('keeps the save before the last one, and leaves no temp files behind', async () => {
    const files = slotFiles(dataFolder);
    await files.write('save', '{"day":1}');
    await files.write('save', '{"day":2}');
    expect(await readFile(join(saves(), 'save.json.bak'), 'utf8')).toBe('{"day":1}');
    expect((await readdir(saves())).sort()).toEqual(['save.json', 'save.json.bak']);
  });

  it('reads the copy back when the save itself is broken', async () => {
    const files = slotFiles(dataFolder);
    await files.write('save', '{"day":1}');
    await files.write('save', '{"day":2}');
    await writeFile(join(saves(), 'save.json'), '{"day":');
    expect(await files.read('save')).toBe('{"day":1}');
  });

  it('never backs a broken save up over a good copy', async () => {
    const files = slotFiles(dataFolder);
    await files.write('save', '{"day":1}');
    await files.write('save', '{"day":2}');
    await writeFile(join(saves(), 'save.json'), 'broken');
    await files.write('save', '{"day":3}');
    expect(await readFile(join(saves(), 'save.json.bak'), 'utf8')).toBe('{"day":1}');
  });

  it('removes a save with its copy, so a deleted game stays deleted', async () => {
    const files = slotFiles(dataFolder);
    await files.write('save', '{"day":1}');
    await files.write('save', '{"day":2}');
    await files.remove('save');
    expect(await files.read('save')).toBeNull();
    expect(await readdir(saves())).toEqual([]);
  });

  it('writes a slot in the order asked, and settles once all are done', async () => {
    const files = slotFiles(dataFolder);
    void files.write('edits', '{"n":1}');
    void files.write('edits', '{"n":2}');
    void files.write('edits', '{"n":3}');
    expect(files.busy()).toBe(true);
    await files.settled();
    expect(files.busy()).toBe(false);
    expect(await files.read('edits')).toBe('{"n":3}');
  });
});

describe('what a page may ask for', () => {
  it('matches the game’s own slots', () => {
    expect([...SLOTS]).toEqual([...GAME_SLOTS]);
  });

  it('refuses any slot but the game’s, so a page never names a path', () => {
    expect(slotFrom('save')).toBe('save');
    for (const bad of ['../secrets', 'save.json', '', null, 3, { slot: 'save' }]) {
      expect(() => slotFrom(bad)).toThrow();
    }
  });

  it('takes only text of a sane size', () => {
    expect(slotDataFrom('{}')).toBe('{}');
    expect(() => slotDataFrom(42)).toThrow();
    expect(() => slotDataFrom('x'.repeat(MAX_SLOT_BYTES + 1))).toThrow();
  });
});

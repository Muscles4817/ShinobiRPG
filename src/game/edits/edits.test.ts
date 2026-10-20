import { CONTENT_PACKS } from '@/content';
import { enemyStatLine } from '@/game/enemyStats';
import { deserialize, serialize } from '@/game/persistence/save';
import { versusRoster } from '@/game/versus/roster';
import { draft } from '@/test/gameFixtures';

import { contextForPack } from '../context';
import { createNewGame } from '../creation';
import { withEdits } from './apply';
import { readEditBook, withPackEdits, writeEditBook, EMPTY_BOOK, packEdits } from './book';
import { editStat, editTechniques, EDIT_STAT_MAX, resetFighter } from './edit';
import { NO_EDITS, type ContentEdits } from './state';
import { fighterEditor } from './view';

/** The content editor: fighters changed over the pack, kept on the device and in new games. */

const naruto = contextForPack('naruto')!;
const pack = CONTENT_PACKS.find((p) => p.id === 'naruto')!;
const KAKASHI = 'person:kakashi';
const ZABUZA = 'enemy:zabuza';

function edited(edits: ContentEdits) {
  return contextForPack('naruto', edits)!;
}

describe('fighter edits', () => {
  it('leave the pack as written when there are none', () => {
    expect(withEdits(pack, NO_EDITS)).toBe(pack);
  });

  it('change a person’s stat, and setting it back clears the edit', () => {
    const was = naruto.content.people.require('kakashi').stats.speed;
    const faster = editStat(naruto, KAKASHI, 'speed', was + 10);
    expect(faster.fighters[KAKASHI]?.stats).toEqual({ speed: was + 10 });
    const ctx = edited(faster);
    expect(ctx.content.people.require('kakashi').stats.speed).toBe(was + 10);
    expect(editStat(ctx, KAKASHI, 'speed', was)).toEqual(NO_EDITS);
  });

  it('keep stats within the editor’s range', () => {
    const edits = editStat(naruto, KAKASHI, 'strength', 500);
    expect(edits.fighters[KAKASHI]?.stats?.strength).toBe(EDIT_STAT_MAX);
  });

  it('write a foe’s edited line back as its own stats, chakra included', () => {
    const was = enemyStatLine(naruto.content.enemies.require('zabuza'));
    const one = editStat(naruto, ZABUZA, 'kenjutsu', was.kenjutsu + 5);
    const two = editStat(edited(one), ZABUZA, 'reserves', was.reserves + 6);
    const line = enemyStatLine(edited(two).content.enemies.require('zabuza'));
    expect(line.kenjutsu).toBe(was.kenjutsu + 5);
    expect(line.reserves).toBeCloseTo(was.reserves + 6, 0);
    expect(line.speed).toBe(was.speed);
  });

  it('replace what someone fights with, never with nothing', () => {
    const original = fighterEditor(naruto, ZABUZA)!;
    const kept = original.techniques.slice(0, 1).map((t) => t.id);
    const fewer = editTechniques(naruto, ZABUZA, kept);
    expect(edited(fewer).content.enemies.require('zabuza').techniqueIds).toEqual(kept);
    expect(editTechniques(naruto, ZABUZA, [])).toBe(naruto.edits);
    const back = original.techniques.map((t) => t.id);
    expect(editTechniques(edited(fewer), ZABUZA, back)).toEqual(NO_EDITS);
  });

  it('give a person without an arsenal one built from the kit they were given', () => {
    const IBIKI = 'person:ibiki';
    expect(naruto.content.people.require('ibiki').arsenal).toBeUndefined();
    const editor = fighterEditor(naruto, IBIKI)!;
    const kit = editor.techniques.map((t) => t.id);
    expect(kit.length).toBeGreaterThan(0);
    const extra = editor.choices.find((t) => t.ready)!;
    const ctx = edited(editTechniques(naruto, IBIKI, [...kit, extra.id]));
    expect(ctx.content.people.require('ibiki').arsenal?.techniqueIds).toEqual([...kit, extra.id]);
    expect(fighterEditor(ctx, IBIKI)?.techniques.map((t) => t.id)).toContain(extra.id);
  });

  it('reset one fighter back to the pack', () => {
    const edits = editStat(naruto, KAKASHI, 'speed', 40);
    const both = editStat(edited(edits), ZABUZA, 'speed', 40);
    expect(Object.keys(resetFighter(both, KAKASHI).fighters)).toEqual([ZABUZA]);
  });

  it('show in versus at once', () => {
    const power = (ctx: typeof naruto) => versusRoster(ctx).find((f) => f.id === KAKASHI)?.power;
    const ctx = edited(editStat(naruto, KAKASHI, 'ninjutsu', 55));
    expect(power(ctx)).toBeGreaterThan(power(naruto)!);
  });
});

describe('the fighter editor', () => {
  it('reads each stat beside the pack’s, at any grade for any rank', () => {
    const ctx = edited(editStat(naruto, KAKASHI, 'genjutsu', 50));
    const editor = fighterEditor(ctx, KAKASHI)!;
    const genjutsu = editor.stats.find((s) => s.id === 'genjutsu')!;
    expect(genjutsu).toMatchObject({ value: 50, grade: 'S', edited: true });
    expect(genjutsu.original).toBe(naruto.content.people.require('kakashi').stats.genjutsu);
    expect(editor.edited).toBe(true);
  });

  it('offers no other clan’s techniques and nothing that summons', () => {
    const editor = fighterEditor(naruto, ZABUZA)!;
    const offered = editor.choices.map((t) => naruto.content.techniques.require(t.id));
    expect(offered.every((t) => t.clan === undefined)).toBe(true);
    expect(offered.some((t) => t.effects.some((e) => e.verb === 'summon'))).toBe(false);
  });
});

describe('edits and games', () => {
  it('are copied into a new game and come back with its save', () => {
    const edits = editStat(naruto, KAKASHI, 'speed', 45);
    const ctx = edited(edits);
    const game = createNewGame({ draft: draft({}, ctx), seed: 3 }, ctx);
    expect(game.edits).toEqual(edits);
    const loaded = deserialize(serialize(game));
    if (!loaded.ok) throw new Error(loaded.error);
    const again = contextForPack(loaded.value.packId, loaded.value.edits)!;
    expect(again.content.people.require('kakashi').stats.speed).toBe(45);
  });

  it('are none in a save from before the editor', () => {
    const game = createNewGame({ draft: draft({}, naruto), seed: 3 }, naruto);
    const { edits: _edits, ...older } = game;
    const loaded = deserialize(JSON.stringify({ version: 58, state: older }));
    if (!loaded.ok) throw new Error(loaded.error);
    expect(loaded.value.edits).toEqual(NO_EDITS);
  });
});

describe('the edit book', () => {
  it('keeps each pack’s edits on the device', () => {
    const edits = editStat(naruto, KAKASHI, 'speed', 45);
    const book = readEditBook(writeEditBook(withPackEdits(EMPTY_BOOK, 'naruto', edits)));
    expect(packEdits(book, 'naruto')).toEqual(edits);
    expect(packEdits(book, 'original')).toEqual(NO_EDITS);
  });

  it('drops whatever doesn’t fit, and reads nothing from nothing', () => {
    expect(readEditBook(null)).toEqual(EMPTY_BOOK);
    expect(readEditBook('not json')).toEqual(EMPTY_BOOK);
    const raw = JSON.stringify({
      version: 1,
      packs: {
        naruto: {
          fighters: {
            [KAKASHI]: { stats: { speed: 30, luck: 9, strength: 'lots' } },
            [ZABUZA]: { techniqueIds: [1, 2] },
          },
        },
      },
    });
    expect(packEdits(readEditBook(raw), 'naruto')).toEqual({
      fighters: { [KAKASHI]: { stats: { speed: 30 } } },
    });
  });
});

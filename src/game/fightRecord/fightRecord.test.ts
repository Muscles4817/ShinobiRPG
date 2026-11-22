import { textOf } from '@/test/fightLines';
import { combatScene } from '@/game';
import { serialize } from '@/game/persistence/save';
import { act, fightOut } from '@/test/gameFixtures';

import { contextForPack } from '../context';
import { createVersus } from '../versus/match';
import { fightRecordDocument, fightRecordFile } from './export';

/** The fight record: the last fight kept whole as it was fought, to download for debugging. */

const naruto = contextForPack('naruto')!;

function watchedBout() {
  const made = createVersus(naruto, {
    side: ['person:kakashi'],
    foes: ['person:guy'],
    seed: 7,
    watch: true,
  });
  if (!made.ok) throw new Error(made.error);
  return made.value;
}

describe('the fight record', () => {
  it('keeps every line of a watched bout in order, with nothing missed', () => {
    const done = fightOut(watchedBout(), naruto);
    const record = done.fightRecord!;
    const finale = done.combatFinale!;
    expect(record.open).toBe(false);
    expect(textOf(record.story)[0]).toBe('Kakashi Hatake against Might Guy.');
    // The whole story: what the engine let go, then the events it still held at the end.
    expect(record.story.length).toBe(finale.storyOffset + finale.story.length);
    expect(record.story.slice(-finale.story.length)).toEqual(finale.story);
    expect(textOf(record.story).some((l) => l.includes('unrecorded'))).toBe(false);
  });

  it('keeps the lines the engine let go over a fight planned round by round', () => {
    const made = createVersus(naruto, {
      side: ['person:hashirama', 'person:tobirama', 'person:hiruzen'],
      foes: ['person:madara', 'person:itachi', 'person:kisame'],
      seed: 7,
    });
    if (!made.ok) throw new Error(made.error);
    const done = fightOut(made.value, naruto);
    const finale = done.combatFinale!;
    expect(finale.storyOffset).toBeGreaterThan(0);
    expect(done.fightRecord?.story.length).toBe(finale.storyOffset + finale.story.length);
    expect(textOf(done.fightRecord!.story).some((l) => l.includes('unrecorded'))).toBe(false);
  });

  it('lays every fighter open at the start and the end, with the choices and their reasons', () => {
    const done = fightOut(watchedBout(), naruto);
    const record = done.fightRecord!;
    expect(record.start?.fighters.map((f) => f.name)).toEqual(['Kakashi', 'Might Guy']);
    expect(record.end?.fighters.length).toBeGreaterThanOrEqual(2);
    expect(record.end?.decisions.length).toBeGreaterThan(record.start?.decisions.length ?? 0);
    expect(record.steps[0]?.choice).toBeNull();
    expect(record.steps.at(-1)?.combatants.some((c) => c.health === 0)).toBe(true);
    expect(record.result?.kind).toBe('fight');
  });

  it('records a fight step by step, the opening once', () => {
    const start = watchedBout();
    const option = combatScene(start, naruto)!.options.find((o) => !o.disabledReason)!;
    const once = act(start, { type: 'combatAct', optionId: option.id }, naruto);
    expect(once.fightRecord?.steps.map((s) => s.choice)).toEqual([null, option.id]);
  });

  it('is one readable document: a guide, the fighters, the story event by event', () => {
    const done = fightOut(watchedBout(), naruto);
    const doc = fightRecordDocument(done, naruto) as Record<string, unknown>;
    expect(doc.format).toBe('shinobi-fight-record');
    expect(doc.guide).toEqual(expect.arrayContaining([expect.stringMatching(/decisions/)]));
    const story = doc.story as { n: number; kind: string; text?: string; by?: string }[];
    expect(story.length).toBe(done.fightRecord!.story.length);
    expect(story.map((e) => e.n)).toEqual(story.map((_, i) => i));
    expect(story.some((e) => e.kind === 'told' && e.text !== undefined)).toBe(true);
    expect(story.some((e) => e.kind === 'health' && e.by !== undefined)).toBe(true);
    const file = fightRecordFile(done, naruto)!;
    expect(file.name).toBe('fight-kakashi-vs-might-guy.json');
    expect(JSON.parse(file.text)).toEqual(JSON.parse(JSON.stringify(doc)));
  });

  it('stays out of saves', () => {
    const done = fightOut(watchedBout(), naruto);
    expect(done.fightRecord).toBeDefined();
    expect(serialize(done)).not.toContain('fightRecord');
    const { fightRecord: _record, ...unfought } = done;
    expect(fightRecordDocument(unfought, naruto)).toBeNull();
  });
});

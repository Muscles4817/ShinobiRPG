import { daysAway } from '@/systems/missions';
import { stock } from '@/systems/inventory';
import { act, ctx, fightOut, newGame, veteran, withAllStats } from '@/test/gameFixtures';

import type { GameState } from './state';
import { missionScene } from './views/missionScene';

/** The reference medium job (`docs/design/missions-plan.md`), played through. */

const NUN = 'pilgrim-nun-escort';

function ready(): GameState {
  const s = withAllStats(veteran(newGame(), 5), 60);
  return { ...s, inventory: stock(s.inventory, 'travel-rations', 6) };
}

/** One step, preferring the first of `prefer` on offer. */
function step(s: GameState, prefer: readonly string[]): GameState {
  if (s.combat) return fightOut(s);
  if (s.mission?.encounter) return act(s, { type: 'encounterApproach', approach: 'head-on' });
  const choices = missionScene(s, ctx)?.choices ?? [];
  const pick = prefer.map((p) => choices.find((c) => c.label === p)).find(Boolean) ?? choices[0];
  if (!pick) throw new Error('Nothing to choose');
  return act(s, pick.action);
}

function playThrough(start: GameState, prefer: readonly string[]): GameState {
  let s = act(start, { type: 'startMission', missionId: NUN });
  for (let i = 0; i < 60 && s.mission; i++) s = step(s, prefer);
  return s;
}

const KIND_ROAD = [
  'Answer warmly',
  'Keep your patience',
  'Sit with Sister Kohaku',
  'Take first watch',
  'Talk them out of it',
];

describe('the Pilgrim Nun', () => {
  it('is days away, and pays for them', () => {
    const def = ctx.content.missions.require(NUN);
    expect(daysAway(def)).toBe(3);
    expect(def.charge?.name).toBe('Sister Kohaku');
  });

  it('a genin walks it with their team', () => {
    const s = act(ready(), { type: 'startMission', missionId: NUN });
    expect(s.mission?.crew.kind).toBe('old-team');
    expect(missionScene(s, ctx)?.prompt).toMatch(/Have you eaten/);
  });

  it('kindness, patience and a night by the fire end with the lantern lit together', () => {
    const start = ready();
    const done = playThrough(start, KIND_ROAD);
    expect(done.time.day - start.time.day).toBeGreaterThanOrEqual(3);
    const report = done.reports.find((r) => r.kind === 'mission-complete');
    expect(report?.kind === 'mission-complete' && report.ending).toMatch(
      /asks you to light it for her brother/,
    );
    expect(report?.kind === 'mission-complete' && report.ryo).toBe(504);
  });

  it('a cold road ends without the lantern', () => {
    const done = playThrough(ready(), [
      'Make a joke of it',
      'Find a clever fix',
      'Sleep properly',
      'Drill by the fire',
      'Treat them as the robbers they are',
    ]);
    const report = done.reports.find((r) => r.kind === 'mission-complete');
    expect(report?.kind === 'mission-complete' && report.ending).not.toMatch(
      /light it for her brother/,
    );
  });
});

describe('the debrief', () => {
  it('tells the road line by line, who went and how it went', () => {
    const done = playThrough(ready(), KIND_ROAD);
    const report = done.reports.find((r) => r.kind === 'mission-complete');
    if (report?.kind !== 'mission-complete') throw new Error('No debrief');
    expect(report.road?.map((l) => l.text)).toContain(
      'Heard why Sister Kohaku makes this journey.',
    );
    expect(report.road?.at(-1)).toEqual({
      text: 'Sister Kohaku pressed a gift on you at the end of the road.',
      tone: 'gain',
      pay: '+20% pay',
    });
    expect(report.crew?.map((c) => c.name).length).toBe(2);
    expect(report.crew?.every((c) => c.bond > 0)).toBe(true);
    expect(report.grade).toBe('clean');
  });
});

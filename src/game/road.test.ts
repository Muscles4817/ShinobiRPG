import { validateContent } from '@/content';
import { stock } from '@/systems/inventory';
import { EXAM_DAY, examDay } from '@/test/examFixtures';
import { act, newGame, withAllStats } from '@/test/gameFixtures';
import { LONG_TEAM_JOB, ROAD_JOB, roadCtx, roadPack } from '@/test/roadFixtures';

import { blockerFor } from './dispatch';
import { CAMP_HEALTH_SHARE, rationDays } from './road';
import type { GameState } from './state';
import { missionBoardView } from './views/boards';
import { missionScene } from './views/missionScene';

const ctx = roadCtx;
const RATION = 'travel-rations';

function packed(state: GameState, rations: number): GameState {
  return { ...state, inventory: stock(state.inventory, RATION, rations) };
}

function onTheRoad(state: GameState, missionId = ROAD_JOB.id): GameState {
  return act(state, { type: 'startMission', missionId }, ctx);
}

describe('days on the road', () => {
  it('says how long a job keeps you away, on the notice and at the road', () => {
    const state = packed(newGame({}, ctx), 2);
    const notice = missionBoardView(state, ctx)!.notices.find((n) => n.id === ROAD_JOB.id);
    expect(notice?.away).toBe('Three days away');
    const scene = missionScene(onTheRoad(state), ctx)!;
    expect(scene.choices[0]).toMatchObject({
      label: 'Travel on',
      detail: 'Three days on the road, food for 2 in your pack',
    });
  });

  it('passes the days, a meal from your pack each evening and a night in camp', () => {
    const start = onTheRoad(packed(newGame({}, ctx), 5));
    const day = start.time.day;
    const s = act(start, { type: 'missionContinue' }, ctx);
    expect(s.time).toEqual({ day: day + 3, slot: 0 });
    expect(rationDays(s, ctx)).toBe(2);
    expect(s.character.vitals.energy).toBe(100);
    const road = s.journal.entries.find((e) => e.heading === 'On the road');
    expect(road?.text).toBe('Three quiet days along the coast road.');
    expect(road?.chips?.map((c) => c.label)).toEqual(['3 days on the road', '3 from your pack']);
  });

  it('goes hungry without food, and says so', () => {
    const start = onTheRoad(newGame({}, ctx));
    const s = act(start, { type: 'missionContinue' }, ctx);
    expect(s.character.vitals.satiety).toBeLessThan(start.character.vitals.satiety);
    const road = s.journal.entries.find((e) => e.heading === 'On the road');
    expect(road?.tone).toBe('warning');
    expect(road?.chips?.some((c) => c.tone === 'harm')).toBe(true);
  });

  it('rests you less in a bedroll than in your own bed', () => {
    expect(CAMP_HEALTH_SHARE).toBeLessThan(1);
    const start = onTheRoad(packed(newGame({}, ctx), 5));
    const hurt: GameState = {
      ...start,
      character: { ...start.character, vitals: { ...start.character.vitals, health: 40 } },
    };
    const s = act(hurt, { type: 'missionContinue' }, ctx);
    expect(s.character.vitals.health).toBeGreaterThan(40);
  });

  it('lets the village carry on: peers keep training while you’re away', () => {
    const start = onTheRoad(packed(newGame({}, ctx), 5));
    const s = act(start, { type: 'missionContinue' }, ctx);
    const grown = Object.values(s.people.progress).map((p) => p.lastGrownDay);
    // Each genin's training is caught up to the last full day: yesterday.
    expect(grown.length).toBeGreaterThan(0);
    expect(Math.max(...grown)).toBe(s.time.day - 1);
    expect(s.time.day - start.time.day).toBe(3);
  });
});

describe('the sensei on the road', () => {
  it('gives the week’s lesson by the fire, once', () => {
    const start = onTheRoad(packed(withAllStats(newGame({}, ctx), 5), 9), LONG_TEAM_JOB.id);
    expect(start.mission?.crew.leaderId).toBe(start.people.team?.senseiId);
    const s = act(start, { type: 'missionContinue' }, ctx);
    const lessons = s.reports.filter((r) => r.kind === 'lesson');
    expect(lessons.length).toBe(1);
  });
});

describe('an exam while you’re away', () => {
  it('warns that you’d miss it', () => {
    const state = packed({ ...newGame({}, ctx), time: { day: EXAM_DAY - 1, slot: 0 } }, 3);
    const notice = missionBoardView(state, ctx)!.notices.find((n) => n.id === ROAD_JOB.id);
    expect(notice?.examClash).toBe('The Lantern Trials: tomorrow. You’d be away.');
    expect(notice?.blocker).toBeNull();
  });

  it('is one your sensei won’t let you miss once they’d nominate you', () => {
    const state = { ...examDay(ctx, newGame({}, ctx)), time: { day: EXAM_DAY - 1, slot: 0 } };
    const blocker = blockerFor(state, { type: 'startMission', missionId: ROAD_JOB.id }, ctx);
    expect(blocker).toMatch(/won’t sign you out/);
  });
});

describe('road validation', () => {
  it('wants whole days and pay that covers them', () => {
    const cheap = { ...ROAD_JOB, reward: { ryo: 10, reputation: 1 } };
    const odd = { ...ROAD_JOB, id: 'odd', stages: [{ kind: 'leg' as const, text: '', days: 1.5 }] };
    const pack = { ...roadPack, missions: [...roadPack.missions.slice(0, -2), cheap, odd] };
    const problems = validateContent(pack);
    expect(problems).toContain(`mission "${ROAD_JOB.id}" pays too little for 3 days away`);
    expect(problems).toContain('mission "odd" has a leg that isn’t a whole number of days');
  });
});

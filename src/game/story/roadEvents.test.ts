import { CONTENT_PACKS } from '@/content';
import type { Danger, RoadEventDef } from '@/systems/missions';
import { DAYS_PER_SEASON, seasonOf } from '@/systems/time';
import { act, newGame } from '@/test/gameFixtures';

import { createGameContext } from '../context';
import type { GameState } from '../state';
import { ROAD_EVENT_CHANCE, roadEventOn } from './roadEvents';

/** What the road brings: by its danger and the season, by rarity, and not the same again soon. */

const original = CONTENT_PACKS.find((p) => p.id === 'original')!;
const event = (id: string, more: Partial<RoadEventDef> = {}): RoadEventDef => ({
  id,
  regions: ['coast-road'],
  text: 'Something on the road.',
  options: [{ label: 'Walk on', tone: 'quiet', reply: 'You walk on.' }],
  ...more,
});
const ctx = createGameContext({
  ...original,
  roadEvents: [
    event('everyday'),
    event('winter-only', { seasons: ['Winter'] }),
    event('bandits', { danger: 'armed' }),
    event('once-in-a-life', { once: true, rarity: 'rare' }),
  ],
});

function onTheCoastRoad(): GameState {
  const game = newGame({}, ctx);
  const jonin = { ...game, standing: { ...game.standing, rank: 'jonin' as const } };
  return act(jonin, { type: 'travel', locationId: 'port-shiomachi' }, ctx);
}

/** What the coast road brings on each of a year's days. */
function aYearOf(state: GameState, danger: Danger) {
  return Array.from({ length: DAYS_PER_SEASON * 4 }, (_, i) => {
    const day = i + 1;
    const drawn = roadEventOn({ ...state, time: { day, slot: 0 } }, ctx, {
      region: 'coast-road',
      danger,
    });
    return { day, id: drawn?.id ?? null };
  });
}

describe('road events', () => {
  it('brings a season’s events only in their season', () => {
    const winter = aYearOf(onTheCoastRoad(), 'petty').filter((d) => d.id === 'winter-only');
    expect(winter.length).toBeGreaterThan(0);
    expect(winter.every((d) => seasonOf(d.day) === 'Winter')).toBe(true);
  });

  it('brings bandits only on roads with danger on them', () => {
    const state = onTheCoastRoad();
    expect(aYearOf(state, 'petty').some((d) => d.id === 'bandits')).toBe(false);
    expect(aYearOf(state, 'armed').some((d) => d.id === 'bandits')).toBe(true);
  });

  it('is quieter on a safe road than a deadly one', () => {
    const state = onTheCoastRoad();
    const quiet = (danger: Danger) => aYearOf(state, danger).filter((d) => d.id === null).length;
    expect(quiet('petty')).toBeGreaterThan(quiet('deadly'));
    expect(ROAD_EVENT_CHANCE.petty).toBeLessThan(ROAD_EVENT_CHANCE.deadly);
  });

  it('never brings a once-in-a-life event twice, and passes over what it brought lately', () => {
    const state = onTheCoastRoad();
    const met = { ...state, atlas: { ...state.atlas, roadSeen: ['once-in-a-life'] } };
    expect(aYearOf(met, 'petty').some((d) => d.id === 'once-in-a-life')).toBe(false);
    const lately = { ...state, atlas: { ...state.atlas, recentRoad: ['everyday'] } };
    const spring = aYearOf(lately, 'petty').filter((d) => seasonOf(d.day) === 'Spring');
    expect(spring.some((d) => d.id === 'everyday')).toBe(false);
  });

  it('remembers what it brought', () => {
    let state = onTheCoastRoad();
    for (let step = 0; state.mission && !state.mission.roadEvent && step < 4; step++) {
      state = act(state, { type: 'missionContinue' }, ctx);
    }
    const brought = state.mission?.roadEvent;
    if (brought) expect(state.atlas.recentRoad).toContain(brought);
  });
});

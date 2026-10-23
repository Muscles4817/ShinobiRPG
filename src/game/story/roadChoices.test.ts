import { CONTENT_PACKS } from '@/content';
import type { RoadEventDef } from '@/systems/missions';
import { act, newGame } from '@/test/gameFixtures';

import { createGameContext } from '../context';
import { activeStage } from '../missionFlow';
import { journeyView } from '../views/journeyView';
import type { GameState } from '../state';
import { partyMet, ROUND_THEM_ENERGY } from './roadChoices';
import { roadEventOn } from './roadEvents';

/** The kinds of road event the game plays itself: foes, finds, weather and sights. */

const original = CONTENT_PACKS.find((p) => p.id === 'original')!;
const base = { regions: ['coast-road'], text: 'Something on the road.' };
const FOES: RoadEventDef = {
  ...base,
  kind: 'encounter',
  id: 'dogs-or-worse',
  parties: [['wild-dog', 'wild-dog'], ['bandit-lieutenant']],
  template: 'beast',
  around: 'You go round.',
};
const FIND: RoadEventDef = {
  ...base,
  kind: 'find',
  id: 'weed',
  ingredientIds: ['rock-laver'],
  taken: 'You pick it.',
};
const RAIN: RoadEventDef = {
  ...base,
  kind: 'weather',
  id: 'rain',
  wait: { reply: 'You wait.', slots: 2 },
  push: { reply: 'You push on.', energy: 15, health: 5 },
};
const SIGHT: RoadEventDef = {
  ...base,
  kind: 'sight',
  id: 'heron',
  outcome: 'You watch.',
  reward: { perception: 1 },
};
const ctx = createGameContext({ ...original, roadEvents: [FOES, FIND, RAIN, SIGHT] });

/** A jōnin setting out down the coast road, the first stretch walked and `eventId` come up. */
function metOnTheCoastRoad(eventId: string): GameState {
  const game = newGame({}, ctx);
  const jonin = { ...game, standing: { ...game.standing, rank: 'jonin' as const } };
  const going = act(jonin, { type: 'travel', locationId: 'port-shiomachi' }, ctx);
  return { ...going, mission: { ...going.mission!, roadEvent: eventId } };
}

const choose = (state: GameState, optionIndex: number) =>
  act(state, { type: 'missionDecide', optionIndex }, ctx);

describe('road events of each kind', () => {
  it('puts foes faced in the way, as an encounter played where you stand', () => {
    const met = metOnTheCoastRoad(FOES.id);
    const faced = choose(met, 1);
    expect(faced.mission?.roadEvent).toBeUndefined();
    const stage = activeStage(faced, ctx);
    expect(stage?.kind).toBe('encounter');
    expect(journeyView(faced, ctx)?.waiting).toBe('fight');
    expect(journeyView(faced, ctx)?.walked).toBe(1);
    const sizedUp = act(faced, { type: 'missionContinue' }, ctx);
    expect(sizedUp.mission?.encounter).toBeDefined();
  });

  it('brings only the foes a road’s danger allows, and none on a job', () => {
    const met = metOnTheCoastRoad(FOES.id);
    expect(partyMet(met, ctx, FOES)).toEqual(['wild-dog', 'wild-dog']);
    // A job's run is one without a trip's plan; its road is as rough as you like.
    const { journey: _journey, ...job } = met.mission!;
    const days = Array.from({ length: 40 }, (_, i) =>
      roadEventOn({ ...met, mission: job, time: { day: i + 1, slot: 0 } }, ctx, {
        region: 'coast-road',
        danger: 'elite',
      }),
    );
    expect(days.some((e) => e !== null)).toBe(true);
    expect(days.some((e) => e?.id === FOES.id)).toBe(false);
  });

  it('lets you go round foes for the day’s strength', () => {
    const met = metOnTheCoastRoad(FOES.id);
    const round = choose(met, 0);
    expect(round.mission?.detour).toBeUndefined();
    expect(round.character.vitals.energy).toBe(met.character.vitals.energy - ROUND_THEM_ENERGY);
  });

  it('puts a find in your pack, or leaves it lying', () => {
    const met = metOnTheCoastRoad(FIND.id);
    expect(choose(met, 0).inventory.pantry['rock-laver']).toBe(1);
    expect(choose(met, 0).fieldBook.finds['rock-laver']).toBe(1);
    expect(choose(met, 1).inventory.pantry['rock-laver']).toBeUndefined();
  });

  it('costs part of the day to wait out the weather, or the body to push through it', () => {
    const met = metOnTheCoastRoad(RAIN.id);
    const waited = choose(met, 0);
    expect(waited.time.slot).toBe((met.time.slot + 2) % 4);
    const pushed = choose(met, 1);
    expect(pushed.time).toEqual(met.time);
    expect(pushed.character.vitals.energy).toBeLessThan(met.character.vitals.energy);
    expect(pushed.character.vitals.health).toBeLessThan(met.character.vitals.health);
  });

  it('teaches a little to those who stop and watch', () => {
    const met = metOnTheCoastRoad(SIGHT.id);
    const watched = choose(met, 0);
    expect(watched.character.stats.perception).toBeGreaterThan(met.character.stats.perception);
    expect(choose(met, 1).character.stats.perception).toBe(met.character.stats.perception);
  });
});

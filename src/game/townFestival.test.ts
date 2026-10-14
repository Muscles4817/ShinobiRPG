import { CONTENT_PACKS } from '@/content';
import { newGame } from '@/test/gameFixtures';

import { createGameContext } from './context';
import { festivalNotice, festivalToday, stallsHere } from './village';

const original = CONTENT_PACKS.find((p) => p.id === 'original')!;
const ctx = createGameContext(original);
/** The Night of the Boat Lanterns: summer (the second season), day 20. */
const BOAT_NIGHT = 28 + 20;

describe('a town’s own festival', () => {
  it('is held in the town, with its stall in the town’s market', () => {
    const atPort = {
      ...newGame({}, ctx),
      locationId: 'port-shiomachi',
      time: { day: BOAT_NIGHT, slot: 2 },
    };
    expect(festivalToday(atPort, ctx)?.id).toBe('boat-lanterns');
    expect(stallsHere(atPort, ctx).some((s) => s.festival && s.foodIds.includes('jetty-eel'))).toBe(
      true,
    );
  });

  it('is not the village’s, and the village’s festivals stay at home', () => {
    const atHome = { ...newGame({}, ctx), time: { day: BOAT_NIGHT, slot: 2 } };
    expect(festivalToday(atHome, ctx)).toBeNull();
    expect(festivalNotice(atHome, ctx)?.festival.id).not.toBe('boat-lanterns');
    // Kite Day, the first of spring, is the village's.
    const kiteDay = {
      ...newGame({}, ctx),
      locationId: 'port-shiomachi',
      time: { day: 7, slot: 1 },
    };
    expect(festivalToday(kiteDay, ctx)).toBeNull();
  });
});

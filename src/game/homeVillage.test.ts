import { CONTENT_PACKS } from '@/content';
import { createRng } from '@/core';
import { newGame } from '@/test/gameFixtures';

import { createGameContext } from './context';
import { dispatch } from './dispatch';
import { atHomeVillage, homeVillageId } from './homeVillage';
import { PASS_NEEDED } from './leave';
import { generateGenin } from './people/generator';
import type { GameState } from './state';
import { headerView } from './views/header';

const original = CONTENT_PACKS.find((p) => p.id === 'original')!;
const ctx = createGameContext(original);

/** A save whose home is in the port, as if the pack offered it as a village to start in. */
function portBorn(): GameState {
  const game = newGame({}, ctx);
  return {
    ...game,
    locationId: 'port-shiomachi',
    housing: { ...game.housing, villageId: 'port-shiomachi', placeId: 'gulls-rest' },
  };
}

describe('the village you belong to', () => {
  it('is the pack’s start village for every save that doesn’t say otherwise', () => {
    expect(homeVillageId(newGame({}, ctx), ctx)).toBe('torogakure');
    expect(atHomeVillage(newGame({}, ctx), ctx)).toBe(true);
  });

  it('is where your home is: there you are not visiting, and leaving it needs leave', () => {
    const born = portBorn();
    expect(headerView(born, ctx).visiting).toBe(false);
    expect(dispatch(born, { type: 'travel', locationId: 'torogakure' }, ctx)).toEqual({
      ok: false,
      error: PASS_NEEDED,
    });
    const away = { ...born, locationId: 'torogakure' };
    expect(headerView(away, ctx).visiting).toBe(true);
    expect(dispatch(away, { type: 'travel', locationId: 'port-shiomachi' }, ctx).ok).toBe(true);
  });

  it('is where your classmates live and hang about', () => {
    const [classmate] = generateGenin(ctx, createRng(3), {
      count: 1,
      takenNames: [],
      firstNumber: 1,
      seed: 3,
      villageId: 'port-shiomachi',
    });
    const port = new Set(
      original.locations.find((l) => l.id === 'port-shiomachi')!.places.map((p) => p.id),
    );
    expect(classmate?.homeLocationId).toBe('port-shiomachi');
    expect(Object.values(classmate!.schedule).every((id) => id === null || port.has(id))).toBe(
      true,
    );
  });
});

import { bondWith } from '@/systems/bonds';
import { pantryCount } from '@/systems/inventory';
import { act, ctx, newGame } from '@/test/gameFixtures';

import { blockerFor } from '../dispatch';
import { whereNow, findPerson } from '../people/cast';
import type { GameState } from '../state';
import { furnishView } from '../views/homeFurnish';
import { homeRoomsView } from '../views/homeRooms';
import { keepsakeShelf } from '../views/keepsakes';
import { lettingsView } from '../views/lettings';
import { noteHomeGifts } from './gifts';
import { comfortStep, comforts } from './home';

/** Making a home: furniture, moving up the ladder, the garden, the yard and a guest. */

function wealthy(patch: Partial<GameState['standing']> = {}): GameState {
  const game = newGame({ wallet: { ryo: 8000 } });
  return { ...game, standing: { ...game.standing, ...patch } };
}

const townhouse = (): GameState =>
  act(wealthy({ rank: 'chunin' }), { type: 'moveHome', homeId: 'dyers-townhouse', buy: true });

describe('furniture', () => {
  it('starts with a futon laid out, and a bare room', () => {
    const game = newGame();
    expect(game.housing.placed.bed).toBe('straw-futon');
    expect(comfortStep(game, ctx)).toBe(0);
  });

  it('is bought from the joiner, laid out at once, and paid for', () => {
    const game = wealthy();
    const bought = act(game, { type: 'buyFurnishing', furnishingId: 'cotton-futon' });
    expect(bought.housing.placed.bed).toBe('cotton-futon');
    expect(bought.housing.furniture).toContain('straw-futon');
    expect(bought.wallet.ryo).toBe(game.wallet.ryo - 300);
    expect(
      blockerFor(bought, { type: 'buyFurnishing', furnishingId: 'cotton-futon' }, ctx),
    ).toMatch(/already own/);
    expect(blockerFor(game, { type: 'buyFurnishing', furnishingId: 'silk-futon' }, ctx)).toMatch(
      /doesn’t make/,
    );
  });

  it('does its one thing at home: a better bed, a kettle for naps, a desk for scrolls', () => {
    let game = wealthy();
    for (const id of ['cotton-futon', 'kettle-brazier', 'low-desk']) {
      game = act(game, { type: 'buyFurnishing', furnishingId: id });
    }
    expect(comforts(game, ctx)).toMatchObject({ sleep: 1.1, nap: 10, study: 1.1 });
    expect(comfortStep(game, ctx)).toBeGreaterThan(0);
    const away = { ...game, locationId: 'kiri-ford' };
    expect(comforts(away, ctx)).toMatchObject({ sleep: 1, nap: 0, study: 1 });
  });

  it('can swap back to a piece you own', () => {
    const game = act(wealthy(), { type: 'buyFurnishing', furnishingId: 'cotton-futon' });
    const bed = furnishView(game, ctx).spots.find((s) => s.spot === 'bed')!;
    const straw = bed.options.find((o) => o.id === 'straw-futon')!;
    expect(act(game, straw.place.action).housing.placed.bed).toBe('straw-futon');
  });
});

describe('moving up the ladder', () => {
  it('is sealed until your record or rank earns it, and a home not built yet stays sealed', () => {
    const view = lettingsView(newGame(), ctx)!;
    const flat = view.homes.find((h) => h.id === 'lantern-row-flat')!;
    expect(flat.sealed).toMatch(/jobs on your record/);
    expect(view.homes.find((h) => h.id === 'dyers-townhouse')!.sealed).toMatch(/Chūnin/);
    expect(view.homes.find((h) => h.id === 'river-house')!.sealed).toMatch(/still being built/);
  });

  it('moves you and your furniture, paying the first week’s rent', () => {
    const game = act(wealthy({ missionsCompleted: 3 }), {
      type: 'buyFurnishing',
      furnishingId: 'low-desk',
    });
    const moved = act(game, { type: 'moveHome', homeId: 'lantern-row-flat', buy: false });
    expect(moved.housing).toMatchObject({
      homeId: 'lantern-row-flat',
      rentPerWeek: 70,
      lodging: 'The flat on Lantern Row',
    });
    expect(moved.housing.placed).toMatchObject({ bed: 'straw-futon', desk: 'low-desk' });
    expect(moved.wallet.ryo).toBe(game.wallet.ryo - 70);
    expect(lettingsView(moved, ctx)!.homes.find((h) => h.current)?.id).toBe('lantern-row-flat');
  });

  it('can buy a house outright, and then there is no rent', () => {
    const owned = townhouse();
    expect(owned.housing.rentPerWeek).toBe(0);
    expect(owned.housing.beds).toHaveLength(6);
  });
});

describe('the rooms a bigger home opens', () => {
  it('a garden grows what is in season from seed, and gives it to the pantry when ripe', () => {
    const home = townhouse();
    expect(
      blockerFor(home, { type: 'plantBed', bed: 0, ingredientId: 'winter-radish' }, ctx),
    ).toMatch(/won’t grow this season/);
    const planted = act(home, { type: 'plantBed', bed: 0, ingredientId: 'vegetables' });
    expect(blockerFor(planted, { type: 'pickBed', bed: 0 }, ctx)).toMatch(/isn’t ready/);
    const later = { ...planted, time: { ...planted.time, day: planted.time.day + 3 } };
    expect(homeRoomsView(later, ctx).garden!.beds[0]!.state).toBe('Ready to pick');
    const picked = act(later, { type: 'pickBed', bed: 0 });
    expect(pantryCount(picked.inventory, 'vegetables')).toBe(
      pantryCount(later.inventory, 'vegetables') + 2,
    );
    expect(picked.housing.beds[0]).toBeNull();
  });

  it('a yard’s drills tire you less than the training ground’s', () => {
    const home = townhouse();
    const yard = act(home, { type: 'train', trainingId: 'post-kicks', yard: true });
    const ground = act(home, { type: 'train', trainingId: 'post-kicks' });
    expect(yard.character.vitals.energy).toBeGreaterThan(ground.character.vitals.energy);
    expect(
      blockerFor(wealthy(), { type: 'train', trainingId: 'post-kicks', yard: true }, ctx),
    ).toMatch(/can’t train that here/);
  });

  it('a friend in the guest room is at your home every evening and night', () => {
    const home = townhouse();
    const id = home.people.team!.teammateIds[0]!;
    expect(blockerFor(home, { type: 'inviteGuest', personId: id }, ctx)).toMatch(/well enough/);
    const friendly = {
      ...home,
      people: { ...home.people, bonds: { ...home.people.bonds, [id]: bondWith(40) } },
    };
    const staying = act(friendly, { type: 'inviteGuest', personId: id });
    const evening = { ...staying, time: { ...staying.time, slot: 2 } };
    expect(whereNow(evening, ctx, findPerson(evening, ctx, id)!)).toBe(staying.housing.placeId);
    expect(act(staying, { type: 'sendGuestHome' }).housing.guestId).toBeNull();
  });
});

describe('gifts and keepsakes', () => {
  it('a friend who becomes a close friend brings a piece you can’t buy', () => {
    const game = newGame();
    const id = game.people.team!.teammateIds[0]!;
    const withBond = (points: number) => ({
      ...game,
      people: { ...game.people, bonds: { ...game.people.bonds, [id]: bondWith(points) } },
    });
    const gifted = noteHomeGifts(withBond(50), withBond(60), ctx);
    expect(gifted.housing.furniture).toContain('silk-futon');
    expect(noteHomeGifts(withBond(60), withBond(62), ctx)).toEqual(withBond(62));
  });

  it('keeps what you shared with people, a race won and the vest of each rank', () => {
    const game = newGame();
    const id = game.people.team!.teammateIds[0]!;
    const remembered = {
      ...game,
      standing: { ...game.standing, rank: 'chunin' as const },
      village: { ...game.village, memories: [{ personId: id, text: 'the bells', day: 2 }] },
      rival: { ...game.rival!, races: { you: 1, them: 0 } },
    };
    const names = keepsakeShelf(remembered, ctx).keepsakes.map((k) => k.name);
    expect(names).toEqual(['A chūnin vest, folded', 'A frayed bell rope', 'The bells']);
  });
});

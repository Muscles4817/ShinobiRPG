import { act, ctx, draft, newGame } from '@/test/gameFixtures';

import { playerCombatant } from './combatants';
import { createNewGame } from './creation';
import { blockerFor } from './dispatch';
import { combatGear } from './gear';
import { deserialize, serialize } from './persistence/save';
import type { GameState } from './state';
import { gearShopView, loadoutView } from './views/shops';

/** The save version before gear shaped fights (the gear migration is the latest step). */
const PRE_GEAR = 21;

const rich = (state: GameState = newGame()): GameState => ({ ...state, wallet: { ryo: 5000 } });
const chunin = (state: GameState): GameState => ({
  ...state,
  standing: { ...state.standing, rank: 'chunin' },
});
const at = (placeId: string) => (state: GameState) => gearShopView(state, ctx, placeId)!;

describe('gear', () => {
  it('each piece goes in its own slot and rides into the fight as gear', () => {
    let state = rich();
    for (const gearId of ['forge-wakizashi', 'needle-case', 'lacquered-cuirass', 'ash-ink-brush']) {
      state = act(state, { type: 'buyGear', gearId });
    }
    expect(state.inventory.equipped).toEqual({
      weapon: 'forge-wakizashi',
      thrown: 'needle-case',
      body: 'lacquered-cuirass',
      charm: 'ash-ink-brush',
    });
    expect(combatGear(state, ctx)).toEqual({
      held: { name: 'Forge Wakizashi', shape: 'blade', rank: 'C' },
      thrown: { name: 'Needle Case', shape: 'senbon', rank: 'D' },
      armour: { name: 'Lacquered Cuirass', level: 'heavy', rank: 'C' },
      focus: { name: 'Ash-Ink Sealing Brush', rank: 'C', boosts: { verb: 'seal' } },
    });
    expect(playerCombatant(state, ctx).attributes).toEqual(
      playerCombatant(newGame(), ctx).attributes,
    );
  });

  it('a fighter with nothing equipped still brings known (empty) gear, so blade arts need one', () => {
    expect(playerCombatant(newGame(), ctx).gear).toEqual({});
  });

  it('B-rank gear is sold to chūnin, and the shop says why not', () => {
    const genin = rich();
    expect(blockerFor(genin, { type: 'buyGear', gearId: 'kurogane-katana' }, ctx)).toBe(
      'B-rank gear is sold to chūnin and above.',
    );
    const katana = at('kurogane-forge')(genin)
      .racks.flatMap((r) => r.items)
      .find((i) => i.id === 'kurogane-katana');
    expect(katana?.buy.blocker).toBe('B-rank gear is sold to chūnin and above.');
    expect(blockerFor(chunin(genin), { type: 'buyGear', gearId: 'kurogane-katana' }, ctx)).toBe(
      null,
    );
  });

  it('unique weapons are never sold', () => {
    expect(blockerFor(rich(), { type: 'buyGear', gearId: 'hungry-lantern' }, ctx)).toBe(
      'That isn’t sold here.',
    );
  });

  it('the shop shows each piece’s kind, rank and what it does', () => {
    const items = at('kurogane-forge')(rich()).racks.flatMap((r) => r.items);
    const tanto = items.find((i) => i.id === 'lantern-steel-tanto')!;
    expect(tanto).toMatchObject({ kind: 'Blade', rank: 'D', unique: false });
    expect(tanto.effects.map((c) => c.label)).toEqual([
      'Strike becomes a cut',
      'Needed for kenjutsu',
    ]);
    const wakizashi = items.find((i) => i.id === 'forge-wakizashi')!;
    expect(wakizashi.effects).toContainEqual({ label: 'Cuts +10%', tone: 'gain' });
    const needles = items.find((i) => i.id === 'needle-case')!;
    expect(needles.effects.map((c) => c.tone)).toEqual(['info', 'cost', 'gain']);
    const racks = at('kurogane-forge')(rich()).racks.map((r) => r.label);
    expect(racks).toEqual(['Blades and fists', 'Thrown', 'Focus charms']);
  });

  it('armour shows its weight for you: strength carries it', () => {
    const plate = (state: GameState) =>
      at('outfitter')(state)
        .racks.flatMap((r) => r.items)
        .find((i) => i.id === 'river-lord-plate')!;
    const weak = plate(rich());
    expect(weak.kind).toBe('Full plate');
    const strong = rich();
    const lifted = {
      ...strong,
      character: { ...strong.character, stats: { ...strong.character.stats, strength: 30 } },
    };
    const speed = (item: typeof weak) => item.effects.find((c) => c.tone === 'cost')!.label;
    expect(speed(weak)).not.toBe(speed(plate(lifted)));
  });

  it('the gear chest lists what each slot holds and what it does', () => {
    const state = act(rich(), { type: 'buyGear', gearId: 'padded-jacket' });
    const body = loadoutView(state, ctx).slots.find((s) => s.slot === 'body')!;
    expect(body.label).toBe('Armour');
    expect(body.worn?.effects.map((c) => c.label)).toEqual([
      'Blows and blades −7%',
      'No weight to it',
    ]);
  });
});

describe('a blade art needs a blade in hand', () => {
  it('to study it, and the scroll says how to fix it', () => {
    const bare = newGame();
    expect(blockerFor(bare, { type: 'study', techniqueId: 'lantern-cut' }, ctx)).toBe(
      'Needs a blade in hand. Equip one at home.',
    );
    const armed = act(rich(bare), { type: 'buyGear', gearId: 'lantern-steel-tanto' });
    expect(blockerFor(armed, { type: 'study', techniqueId: 'lantern-cut' }, ctx)).toBeNull();
    const knuckled = act(rich(bare), { type: 'buyGear', gearId: 'wrapped-knuckles' });
    expect(blockerFor(knuckled, { type: 'study', techniqueId: 'lantern-cut' }, ctx)).not.toBeNull();
  });

  it('to use it in a fight: the technique carries its need into the fight', () => {
    const known = { ...newGame().techniques, known: ['lantern-cut'] };
    const fighter = playerCombatant({ ...newGame(), techniques: known }, ctx);
    expect(fighter.techniques[0]?.needs).toEqual({ weapon: 'blade' });
    expect(fighter.gear).toEqual({});
  });
});

describe('the issued blade', () => {
  it('a genin who starts out knowing a blade art is issued a blade, in hand', () => {
    const swordsman = createNewGame({ draft: draft({ clanId: 'kurogane' }), seed: 1 }, ctx);
    expect(swordsman.inventory.gear).toEqual(['lantern-steel-tanto']);
    expect(swordsman.inventory.equipped).toEqual({ weapon: 'lantern-steel-tanto' });
    expect(newGame().inventory.gear).toEqual([]);
  });
});

describe('saves from before gear shaped fights', () => {
  it('a save from before gear shaped fights moves a brush to the charm slot and issues a blade art a blade', () => {
    const state = newGame();
    const old = {
      ...state,
      techniques: { ...state.techniques, known: [...state.techniques.known, 'forge-cut'] },
      inventory: {
        ...state.inventory,
        gear: ['ash-ink-brush', 'padded-jacket'],
        equipped: { weapon: 'ash-ink-brush', body: 'padded-jacket' },
      },
    };
    const raw = JSON.parse(serialize(old)) as { state: unknown };
    const loaded = deserialize(JSON.stringify({ version: PRE_GEAR, state: raw.state }));
    if (!loaded.ok) throw new Error(loaded.error);
    expect(loaded.value.inventory.gear).toEqual([
      'ash-ink-brush',
      'padded-jacket',
      'lantern-steel-tanto',
    ]);
    expect(loaded.value.inventory.equipped).toEqual({
      body: 'padded-jacket',
      charm: 'ash-ink-brush',
      weapon: 'lantern-steel-tanto',
    });
  });

  it('a save from before gear shaped fights that already owns a blade keeps its gear as it was', () => {
    const state = newGame();
    const old = {
      ...state,
      techniques: { ...state.techniques, known: [...state.techniques.known, 'forge-cut'] },
      inventory: { ...state.inventory, gear: ['kurogane-katana'], equipped: {} },
    };
    const raw = JSON.parse(serialize(old)) as { state: unknown };
    const loaded = deserialize(JSON.stringify({ version: PRE_GEAR, state: raw.state }));
    if (!loaded.ok) throw new Error(loaded.error);
    expect(loaded.value.inventory).toEqual(old.inventory);
  });
});

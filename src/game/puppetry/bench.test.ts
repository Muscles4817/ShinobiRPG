import { act, ctx, fightOut, intoFight, newGame, veteran } from '@/test/gameFixtures';
import { blockerFor } from '@/game';
import { slotsUntilNextMorning } from '@/systems/time';

import { playerCombatant } from '../combatants';
import { spendTime } from '../ops';
import type { GameState } from '../state';
import type { BuildOrder } from './bench';
import { builtDef } from './built';
import { withYourPuppets, yourPuppets } from './yours';

/** Building puppets: materials bought by the lot, a frame and mechanisms, days at the bench. */

const nextMorning = (s: GameState) => spendTime(s, slotsUntilNextMorning(s.time), ctx);

const KITE: BuildOrder = {
  frameId: 'frame-light-doll',
  partIds: ['wrist-blades', 'smoke-vent'],
  materialId: 'pine-and-wire',
  name: 'Kite',
};

function apprentice(lots = 2): GameState {
  const game = newGame();
  const known = [...game.techniques.known, 'unseal-lantern-doll'];
  return {
    ...game,
    techniques: { ...game.techniques, known },
    wallet: { ryo: 1000 },
    puppetry: { ...game.puppetry, stock: { 'pine-and-wire': lots } },
  };
}

function built(): GameState {
  let state = act(apprentice(), { type: 'startBuild', order: KITE });
  state = act(state, { type: 'workOnBuild' });
  return act(nextMorning(state), { type: 'workOnBuild' });
}

describe('materials', () => {
  it('are bought by the lot where a shop sells them', () => {
    const buy = { type: 'buyMaterial', placeId: 'outfitter', materialId: 'pine-and-wire' } as const;
    const bought = act({ ...newGame(), wallet: { ryo: 100 } }, buy);
    expect(bought.puppetry.stock['pine-and-wire']).toBe(1);
    const rare = { ...buy, materialId: 'ironwood-and-chakra-wire' };
    expect(blockerFor(newGame(), rare, ctx)).toMatch(/Nobody here sells/);
  });
});

describe('the bench', () => {
  it('asks for the art, the craft, the slots, the stock and a name', () => {
    const order = (o: Partial<BuildOrder>) =>
      ({ type: 'startBuild', order: { ...KITE, ...o } }) as const;
    expect(blockerFor(newGame(), order({}), ctx)).toMatch(/art of the threads/);
    expect(blockerFor(apprentice(), order({ frameId: 'frame-heavy' }), ctx)).toMatch(/more craft/);
    const three = ['wrist-blades', 'smoke-vent', 'ram-fists'];
    expect(blockerFor(apprentice(), order({ partIds: three }), ctx)).toMatch(/holds 2/);
    expect(blockerFor(apprentice(1), order({}), ctx)).toMatch(/2 lots/);
    expect(blockerFor(apprentice(), order({ name: '  ' }), ctx)).toMatch(/short name/);
    expect(blockerFor(apprentice(), order({}), ctx)).toBeNull();
  });

  it('builds a puppet over its days, one session a day, teaching craft', () => {
    const started = act(apprentice(), { type: 'startBuild', order: KITE });
    expect(started.puppetry.stock['pine-and-wire']).toBe(0);
    const once = act(started, { type: 'workOnBuild' });
    expect(blockerFor(once, { type: 'workOnBuild' }, ctx)).toMatch(/today/);
    const done = built();
    expect(done.puppetry.build).toBeNull();
    expect(done.puppetry.puppets[0]).toMatchObject({ id: 'built-1', name: 'Kite', condition: 1 });
    expect(done.puppetry.craft).toBeGreaterThan(0);
  });

  it('makes a puppet as good as the hands and the wood allow', () => {
    const done = built();
    const owned = done.puppetry.puppets[0]!;
    const def = builtDef(owned, owned.built!, ctx);
    expect(def.techniqueIds).toEqual(['part-wrist-blades', 'part-smoke-vent']);
    expect(def.stats.kenjutsu).toBeLessThanOrEqual(owned.built!.craftAt + 10);
    const master = builtDef(owned, { ...owned.built!, craftAt: 40 }, ctx);
    expect(master.stats.kenjutsu).toBeGreaterThan(def.stats.kenjutsu);
  });

  it('rebuilds one of yours in its place, for half the materials', () => {
    const done = { ...built(), puppetry: { ...built().puppetry, stock: { 'pine-and-wire': 1 } } };
    const order = { ...KITE, partIds: ['ram-fists'], puppetId: 'built-1' };
    const rebuilding = act(done, { type: 'startBuild', order });
    expect(rebuilding.puppetry.stock['pine-and-wire']).toBe(0);
    const again = act(rebuilding, { type: 'workOnBuild' });
    expect(again.puppetry.puppets).toHaveLength(1);
    expect(again.puppetry.puppets[0]?.built?.partIds).toEqual(['ram-fists']);
  });

  it('renames a puppet', () => {
    const named = act(built(), { type: 'renamePuppet', puppetId: 'built-1', name: 'Moth' });
    expect(named.puppetry.puppets[0]?.name).toBe('Moth');
  });
});

describe('a built puppet in a fight', () => {
  it('comes with its own unsealing card', () => {
    const state = built();
    const player = withYourPuppets(playerCombatant(state, ctx), state, ctx);
    expect(player.calls?.map((c) => c.id)).toContain('built-1');
    expect(player.techniques.map((t) => t.name)).toContain('Unsealing: Kite');
    expect(yourPuppets(state, ctx)[0]?.built).toBe(true);
  });

  it('unfolds in a job’s fight', () => {
    let state = act(veteran(built(), 2), {
      type: 'startMission',
      missionId: 'tea-merchant-escort',
    });
    state = act(state, { type: 'missionContinue' });
    state = act(state, { type: 'missionChoose', approachIndex: 0 });
    const done = fightOut(intoFight(state));
    expect(done.combatFinale?.log.join(' ')).toMatch(/Kite unfolds/);
  });
});

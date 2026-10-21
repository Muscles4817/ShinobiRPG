import { act, ctx, newGame, withAllStats } from '@/test/gameFixtures';

import type { GameState } from '../state';
import { fightReplay, storyEnd } from './fightReplay';
import { combatScene } from './scene';

/** A spar against Kaen, the cards set and the fight begun. */
function begun(): GameState {
  const sparring = act(withAllStats(newGame(), 7), { type: 'spar', personId: 'kaen' });
  return act(sparring, { type: 'combatAct', optionId: 'begin' });
}

describe('the watch screen’s beats', () => {
  it('stage each line of an exchange: who acted, at whom, where, and everyone’s health', () => {
    const before = begun();
    const seen = combatScene(before, ctx)!.log.length;
    const after = act(before, { type: 'combatAct', optionId: 'next' });
    const view = combatScene(after, ctx)!;
    const beats = fightReplay(view, seen);
    expect(beats[0]).toMatchObject({ kind: 'divider', actorId: null });
    const acted = beats.filter((b) => b.actorId !== null);
    expect(acted.length).toBeGreaterThan(0);
    const ids = view.combatants.map((c) => c.id);
    for (const b of acted) expect(ids).toContain(b.actorId);
    expect(beats.every((b) => b.range !== null)).toBe(true);
    const now = Object.fromEntries(view.combatants.map((c) => [c.id, c.health]));
    expect(beats.at(-1)!.health).toEqual(now);
  });

  it('puts a hit on the fighter it names, so health falls on that beat', () => {
    const base = combatScene(begun(), ctx)!;
    const hurt = base.combatants.map((c) => ({ ...c, health: 60 }));
    const view = {
      ...base,
      combatants: hurt,
      log: [
        '— First exchange — ⟦at:mid⟧',
        "Kaen's Pebble Volley hits Kaito. ⟦-12⟧ ⟦by:person:kaen⟧ ⟦at:mid⟧",
        'Kaito counters! ⟦r:countered⟧ ⟦-5⟧ ⟦by:person:kaen⟧',
      ],
    };
    const [player, kaen] = view.combatants;
    const beats = fightReplay(view, 0);
    expect(beats[1]).toMatchObject({ actorId: 'person:kaen', targetId: 'player', range: 'mid' });
    expect(beats[0]!.health).toMatchObject({
      player: player!.health + 12,
      'person:kaen': kaen!.health + 5,
    });
    expect(beats[1]!.health).toMatchObject({
      player: player!.health,
      'person:kaen': kaen!.health + 5,
    });
    expect(beats[2]!.health).toMatchObject({ 'person:kaen': kaen!.health });
  });

  it('moves pools beat by beat from the lines that say where they stand', () => {
    const base = combatScene(begun(), ctx)!;
    const view = {
      ...base,
      log: [
        '— First exchange — ⟦pl:player=chakra:50,breath:30|person:kaen=chakra:40,breath:20⟧',
        "Kaen's Pebble Volley flies. ⟦by:person:kaen⟧ ⟦pl:person:kaen=chakra:32⟧",
        'Kaito drives in a kick. ⟦by:player⟧ ⟦pl:player=breath:24⟧',
      ],
    };
    const pools = fightReplay(view, 0).map((b) => b.pools);
    expect(pools).toEqual([
      { player: { chakra: 50, breath: 30 }, 'person:kaen': { chakra: 40, breath: 20 } },
      { player: { chakra: 50, breath: 30 }, 'person:kaen': { chakra: 32, breath: 20 } },
      { player: { chakra: 50, breath: 24 }, 'person:kaen': { chakra: 32, breath: 20 } },
    ]);
  });

  it('reads the chakra-only marker a fight saved mid-way may still carry', () => {
    const base = combatScene(begun(), ctx)!;
    const view = { ...base, log: ['— First exchange — ⟦ck:player=50|person:kaen=40⟧'] };
    expect(fightReplay(view, 0)[0]).toMatchObject({
      text: 'First exchange',
      pools: { player: { chakra: 50 }, 'person:kaen': { chakra: 40 } },
    });
  });

  it('says everyone’s chakra and breath at each exchange of a real fight', () => {
    const before = begun();
    const seen = combatScene(before, ctx)!.log.length;
    const after = act(before, { type: 'combatAct', optionId: 'next' });
    const view = combatScene(after, ctx)!;
    const beats = fightReplay(view, seen);
    const ids = view.combatants.map((c) => c.id).sort();
    for (const b of beats) {
      expect(Object.keys(b.pools).sort()).toEqual(ids);
      for (const id of ids) expect(Object.keys(b.pools[id]!)).toEqual(['chakra', 'breath']);
    }
  });

  it('keeps its place in a long fight, after the engine lets its oldest lines go', () => {
    let state = begun();
    let end = storyEnd(combatScene(state, ctx)!);
    let dropped = false;
    for (let i = 0; i < 200 && state.combat; i++) {
      const options = combatScene(state, ctx)!.options;
      const next = options.find((o) => o.id === 'next') ?? options.find((o) => o.id === 'begin');
      state = act(state, { type: 'combatAct', optionId: next!.id });
      const view = combatScene(state, ctx);
      if (!view) break;
      expect(storyEnd(view)).toBeGreaterThan(end);
      expect(fightReplay(view, end)).toHaveLength(storyEnd(view) - end);
      dropped ||= (view.logOffset ?? 0) > 0;
      end = storyEnd(view);
    }
    expect(dropped).toBe(true);
  });
});

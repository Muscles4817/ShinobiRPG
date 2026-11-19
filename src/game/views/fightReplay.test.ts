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

  it('puts a hit on the fighter it names, and moves health on the line that tells it', () => {
    const base = combatScene(begun(), ctx)!;
    const view = {
      ...base,
      log: [
        '— First exchange — ⟦at:mid⟧ ⟦pl:player=health:100|person:kaen=health:100⟧',
        "Kaen's Pebble Volley hits Kaito. ⟦-12⟧ ⟦pl:player=health:88⟧ ⟦by:person:kaen⟧ ⟦at:mid⟧",
        'Kaito counters! ⟦r:countered⟧ ⟦-5⟧ ⟦pl:person:kaen=health:95⟧ ⟦by:person:kaen⟧',
      ],
    };
    const beats = fightReplay(view, 0);
    expect(beats[1]).toMatchObject({ actorId: 'person:kaen', targetId: 'player', range: 'mid' });
    expect(beats.map((b) => b.health)).toEqual([
      { player: 100, 'person:kaen': 100 },
      { player: 88, 'person:kaen': 100 },
      { player: 88, 'person:kaen': 95 },
    ]);
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

  it('changes statuses beat by beat, keeping each fighter’s until a line says otherwise', () => {
    const base = combatScene(begun(), ctx)!;
    const view = {
      ...base,
      log: [
        '— First exchange — ⟦st:player=Clones ×2|person:kaen=⟧',
        "Kaen's blow dazes Kaito. ⟦by:person:kaen⟧ ⟦st:player=Dazed;Clones ×1⟧",
        'Kaen readies a trap. ⟦by:person:kaen⟧ ⟦st:person:kaen=Trap set⟧',
      ],
    };
    expect(fightReplay(view, 0).map((b) => b.statuses)).toEqual([
      { player: ['Clones ×2'], 'person:kaen': [] },
      { player: ['Dazed', 'Clones ×1'], 'person:kaen': [] },
      { player: ['Dazed', 'Clones ×1'], 'person:kaen': ['Trap set'] },
    ]);
  });

  it('says everyone’s chakra, breath and health at each exchange of a real fight', () => {
    const before = begun();
    const seen = combatScene(before, ctx)!.log.length;
    const after = act(before, { type: 'combatAct', optionId: 'next' });
    const view = combatScene(after, ctx)!;
    const beats = fightReplay(view, seen);
    const ids = view.combatants.map((c) => c.id).sort();
    for (const b of beats) {
      expect(Object.keys(b.pools).sort()).toEqual(ids);
      for (const id of ids) {
        expect(Object.keys(b.pools[id]!).sort()).toEqual(['breath', 'chakra', 'health']);
      }
      expect(Object.keys(b.statuses).sort()).toEqual(ids);
    }
  });

  it('shows a hit when the line that dealt it plays, never before', () => {
    const base = combatScene(begun(), ctx)!;
    // The fight as it ends: Kaen hurt by a hit and a burn whose lines the walk back can't place.
    const hurt = base.combatants.map((c) => (c.id === 'person:kaen' ? { ...c, health: 50 } : c));
    const view = {
      ...base,
      combatants: hurt,
      log: [
        '— First exchange — ⟦pl:player=health:100|person:kaen=health:100⟧',
        'Kaito readies a guard. ⟦by:player⟧',
        "Kaito's Ember Breath catches them all. ⟦-30⟧ ⟦by:player⟧ ⟦pl:person:kaen=health:70⟧",
        'The burn bites. ⟦-20⟧',
        '— Second exchange — ⟦pl:player=health:100|person:kaen=health:50⟧',
      ],
    };
    const kaen = fightReplay(view, 0).map((b) => b.health['person:kaen']);
    expect(kaen).toEqual([100, 100, 70, 70, 50]);
  });

  it('brings a fighter called mid-round on stage only from the line that brought them', () => {
    const base = combatScene(begun(), ctx)!;
    const view = {
      ...base,
      log: [
        '— First exchange — ⟦pl:player=health:100|person:kaen=health:100⟧',
        'Kaito steps in. ⟦by:player⟧',
        'Kaito splits into shadow clones. ⟦by:player⟧ ⟦pl:clone-1=chakra:20,health:100⟧',
      ],
    };
    const present = fightReplay(view, 0).map((b) => [...b.present].sort());
    expect(present).toEqual([
      ['person:kaen', 'player'],
      ['person:kaen', 'player'],
      ['clone-1', 'person:kaen', 'player'],
    ]);
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
      // Playing on after a mid-round call tells nothing new until the next exchange.
      if (next!.id === 'next') expect(storyEnd(view)).toBeGreaterThan(end);
      expect(fightReplay(view, end)).toHaveLength(storyEnd(view) - end);
      dropped ||= (view.logOffset ?? 0) > 0;
      end = storyEnd(view);
    }
    expect(dropped).toBe(true);
  });
});

import { toldIn, type CombatEvent } from '@/systems/combat';
import { act, ctx, newGame, withAllStats } from '@/test/gameFixtures';
import { divider, health, said, stand } from '@/test/story';

import type { GameState } from '../state';
import { fightReplay, storyEnd } from './fightReplay';
import { combatScene } from './scene';

/** A spar against Kaen, the cards set and the fight begun. */
function begun(): GameState {
  const sparring = act(withAllStats(newGame(), 7), { type: 'spar', personId: 'kaen' });
  return act(sparring, { type: 'combatAct', optionId: 'begin' });
}

function told(story: readonly CombatEvent[]) {
  const base = combatScene(begun(), ctx)!;
  return { ...base, story, storyOffset: 0 };
}

describe('the watch screen’s beats', () => {
  it('stage each line of an exchange: who acted, at whom, where, and everyone’s health', () => {
    const before = begun();
    const seen = storyEnd(combatScene(before, ctx)!);
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
    const view = told([
      stand('player', { health: 100 }),
      stand('person:kaen', { health: 100 }),
      divider(),
      health('player', 88, 'person:kaen'),
      said("Kaen's Pebble Volley hits Kaito.", 'person:kaen', {
        named: ['person:kaen', 'player'],
        range: 'mid',
      }),
      health('person:kaen', 95, 'player'),
      said('Kaito counters!', 'person:kaen', { named: ['player', 'person:kaen'] }),
    ]);
    const beats = fightReplay(view, 0);
    expect(beats[1]).toMatchObject({ actorId: 'person:kaen', targetId: 'player', range: 'mid' });
    expect(beats.map((b) => b.health)).toEqual([
      { player: 100, 'person:kaen': 100 },
      { player: 88, 'person:kaen': 100 },
      { player: 88, 'person:kaen': 95 },
    ]);
  });

  it('moves pools and statuses beat by beat, as the events say', () => {
    const view = told([
      stand('player', { chakra: 50, breath: 30 }, ['Clones ×2']),
      stand('person:kaen', { chakra: 40, breath: 20 }),
      divider(),
      { kind: 'pools', who: 'person:kaen', to: { chakra: 32 } },
      { kind: 'status', who: 'player', statuses: ['Dazed', 'Clones ×1'] },
      said("Kaen's blow dazes Kaito.", 'person:kaen'),
      { kind: 'pools', who: 'player', to: { breath: 24 } },
      said('Kaito drives in a kick.', 'player'),
    ]);
    const beats = fightReplay(view, 0);
    expect(beats.map((b) => b.pools)).toEqual([
      { player: { chakra: 50, breath: 30 }, 'person:kaen': { chakra: 40, breath: 20 } },
      { player: { chakra: 50, breath: 30 }, 'person:kaen': { chakra: 32, breath: 20 } },
      { player: { chakra: 50, breath: 24 }, 'person:kaen': { chakra: 32, breath: 20 } },
    ]);
    expect(beats.map((b) => b.statuses.player)).toEqual([
      ['Clones ×2'],
      ['Dazed', 'Clones ×1'],
      ['Dazed', 'Clones ×1'],
    ]);
  });

  it('says everyone’s chakra, breath and health at each exchange of a real fight', () => {
    const before = begun();
    const seen = storyEnd(combatScene(before, ctx)!);
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
    const view = told([
      stand('player', { health: 100 }),
      stand('person:kaen', { health: 100 }),
      divider(),
      said('Kaito readies a guard.', 'player'),
      health('person:kaen', 70, 'player'),
      said("Kaito's Ember Breath catches them all.", 'player'),
      health('person:kaen', 50),
      said('The burn bites.'),
      stand('player', { health: 100 }),
      stand('person:kaen', { health: 50 }),
      divider('— Second exchange —', false),
    ]);
    const kaen = fightReplay(view, 0).map((b) => b.health['person:kaen']);
    expect(kaen).toEqual([100, 100, 70, 50, 50]);
  });

  it('brings a fighter called mid-round on stage from the event that brought them', () => {
    const view = told([
      stand('player', { health: 100 }),
      stand('person:kaen', { health: 100 }),
      divider(),
      said('Kaito steps in.', 'player'),
      { kind: 'join', who: 'clone-1', pools: { chakra: 20, health: 100 }, statuses: [] },
      said('Kaito splits into shadow clones.', 'player'),
      { kind: 'leave', who: 'clone-1' },
      said('The clone bursts.'),
    ]);
    const present = fightReplay(view, 0).map((b) => [...b.present].sort());
    expect(present).toEqual([
      ['person:kaen', 'player'],
      ['person:kaen', 'player'],
      ['clone-1', 'person:kaen', 'player'],
      ['person:kaen', 'player'],
    ]);
  });

  it('starts a stretch from where the story before it left everyone', () => {
    const story = [
      stand('player', { health: 100 }),
      divider(),
      health('player', 60, 'person:kaen'),
      said('Kaen hits Kaito.', 'person:kaen'),
      said('Kaito staggers.', 'player'),
    ];
    const [first] = fightReplay(told(story), 4);
    expect(first).toMatchObject({ text: 'Kaito staggers.', health: { player: 60 } });
  });

  it('keeps its place in a long fight, after the engine lets its oldest events go', () => {
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
      const start = Math.max(0, end - (view.storyOffset ?? 0));
      expect(fightReplay(view, end)).toHaveLength(toldIn(view.story.slice(start)).length);
      dropped ||= (view.storyOffset ?? 0) > 0;
      end = storyEnd(view);
    }
    expect(dropped).toBe(true);
  });
});

import { act, ctx, newGame, withAllStats } from '@/test/gameFixtures';

import type { GameState } from '../state';
import { fightReplay } from './fightReplay';
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
});

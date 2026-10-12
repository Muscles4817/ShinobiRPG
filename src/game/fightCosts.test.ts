import { createRng } from '@/core';
import type { CombatOpening, CombatOutcome } from '@/systems/combat';
import { ctx, fightOut, newGame, withAllStats } from '@/test/gameFixtures';

import { enemyCombatant, playerCombatant } from './combatants';
import { applyFightCosts } from './fightCosts';
import { startFight } from './fightStyle';
import type { GameState } from './state';
import { combatScene } from './views/scene';

/**
 * Starts a fight against a bandit through `startFight`, with an opening such as recon or an
 * ambush would hand it (nothing in the game makes openings yet).
 */
function openedFight(state: GameState, opening: CombatOpening): GameState {
  const bandit = enemyCombatant(ctx.content.enemies.require('bandit-thug'), 0, ctx);
  const setup = {
    player: playerCombatant(state, ctx),
    allies: [],
    enemies: [bandit],
    canFlee: true,
  };
  return { ...state, combat: startFight(state, ctx, { ...setup, opening }, createRng(5)) };
}

const victory: CombatOutcome = {
  result: 'victory',
  rounds: 3,
  player: { health: 80, chakra: 10 },
};

describe('fight openings', () => {
  it('reach the engine through startFight', () => {
    const state = openedFight(newGame(), { range: 'far', dazed: ['bandit-thug#0'] });
    const scene = combatScene(state, ctx)!;
    expect(scene.range).toBe('far');
    expect(scene.combatants.find((c) => c.id === 'bandit-thug#0')?.statuses).toContain('Dazed');
  });

  it('fights out to the end like any other fight', () => {
    const state = openedFight(withAllStats(newGame(), 20), { firstMover: 'player' });
    expect(fightOut(state).combat).toBeNull();
  });
});

describe('trump costs', () => {
  it('records each cost in the journal, numbers in chips', () => {
    const owed: CombatOutcome = {
      ...victory,
      costs: [
        { techniqueId: 'a', techniqueName: 'Kiln Heart', cost: { kind: 'exhaustion', days: 3 } },
        {
          techniqueId: 'b',
          techniqueName: 'The Last Lantern',
          cost: { kind: 'injury', stat: 'perception', amount: 3, days: 7 },
        },
      ],
    };
    const entries = applyFightCosts(newGame(), owed).journal.entries.slice(-2);
    expect(entries.map((e) => e.heading)).toEqual([
      'Kiln Heart takes its toll',
      'The Last Lantern takes its toll',
    ]);
    expect(entries.map((e) => e.chips?.[0]?.label)).toEqual([
      '3 days of chakra exhaustion',
      'Perception −3 for 7 days',
    ]);
    expect(entries.every((e) => !/\d/.test(e.text))).toBe(true);
  });

  it('records nothing when no trump was used', () => {
    const state = newGame();
    expect(applyFightCosts(state, victory)).toBe(state);
  });

  it('a trump played in a fight leaves its cost in the journal', () => {
    const strong = withAllStats(newGame(), 30);
    const trained = {
      ...strong,
      techniques: { ...strong.techniques, known: ['hibana-kiln-heart'] },
    };
    const done = fightOut(openedFight(trained, { range: 'mid' }));
    const headings = done.journal.entries.map((e) => e.heading);
    expect(headings).toContain('Kiln Heart takes its toll');
  });
});

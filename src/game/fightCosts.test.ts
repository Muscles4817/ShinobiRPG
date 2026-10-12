import { createRng } from '@/core';
import type { CombatCost, CombatOpening, CombatOutcome } from '@/systems/combat';
import { EXHAUSTED_REFILL } from '@/systems/injuries';
import { ctx, fightOut, lastEntry, newGame, withAllStats } from '@/test/gameFixtures';

import { enemyCombatant, playerCombatant } from './combatants';
import { dispatch } from './dispatch';
import { combatStats } from './gear';
import { laidUp } from './injuries';
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

function owing(...costs: CombatCost['cost'][]): CombatOutcome {
  return {
    ...victory,
    costs: costs.map((cost, i) => ({ techniqueId: `t${i}`, techniqueName: 'Kiln Heart', cost })),
  };
}

function pay(state: GameState, ...costs: CombatCost['cost'][]): GameState {
  return applyFightCosts(state, owing(...costs), ctx, createRng(3));
}

/** A character with no stamina, so injuries last their full days. */
function frail(): GameState {
  const state = newGame();
  return {
    ...state,
    character: { ...state.character, stats: { ...state.character.stats, stamina: 0 } },
  };
}

describe('trump costs', () => {
  it('hospital days put you to bed with a collapse injury for those days', () => {
    const state = frail();
    const paid = pay(state, { kind: 'hospital', days: 3 });
    const [injury] = paid.character.injuries;
    const def = ctx.content.injuries.require(injury!.injuryId);
    expect(def.causes).toContain('collapse');
    expect(injury!.until).toBe(state.time.day + 3);
    expect(laidUp(paid, ctx)).not.toBeNull();
    expect(dispatch(paid, { type: 'train', trainingId: 'lake-laps' }, ctx).ok).toBe(false);
  });

  it('exhaustion days leave your chakra slow to come back', () => {
    const state = newGame();
    const paid = pay(state, { kind: 'exhaustion', days: 3 });
    expect(paid.character.exhaustion).toEqual({
      until: state.time.day + 3,
      refill: EXHAUSTED_REFILL,
    });
  });

  it('a stat injury becomes a matching named injury that weakens that stat in fights', () => {
    const state = frail();
    const paid = pay(state, { kind: 'injury', stat: 'perception', amount: 3, days: 7 });
    const [injury] = paid.character.injuries;
    const def = ctx.content.injuries.require(injury!.injuryId);
    expect(def.fight.perception).toBeLessThan(1);
    expect(injury).toMatchObject({
      until: state.time.day + 7,
      strain: { stat: 'perception', amount: 3 },
    });
    expect(combatStats(paid, ctx).perception).toBeLessThan(combatStats(state, ctx).perception - 3);
  });

  it('a permanent cost takes the stat away for good, and says so', () => {
    const state = newGame();
    const paid = pay(state, { kind: 'permanent', stat: 'speed', amount: 1 });
    expect(paid.character.stats.speed).toBeCloseTo(state.character.stats.speed - 1);
    expect(lastEntry(paid)?.chips?.[0]?.label).toBe('Speed −1 for good');
  });

  it('journals each cost under the trump that caused it, numbers in chips', () => {
    const paid = pay(
      newGame(),
      { kind: 'exhaustion', days: 3 },
      { kind: 'injury', stat: 'perception', amount: 3, days: 7 },
    );
    const entries = paid.journal.entries.slice(-2);
    expect(entries.map((e) => e.heading)).toEqual([
      'Kiln Heart takes its toll',
      'Kiln Heart takes its toll',
    ]);
    expect(entries.every((e) => !/\d/.test(e.text))).toBe(true);
  });

  it('costs nothing when no trump was used', () => {
    const state = newGame();
    expect(applyFightCosts(state, victory, ctx, createRng(1))).toBe(state);
  });

  it('a trump played in a fight leaves its cost', () => {
    const strong = withAllStats(newGame(), 30);
    const trained = {
      ...strong,
      techniques: { ...strong.techniques, known: ['hibana-kiln-heart'] },
    };
    const done = fightOut(openedFight(trained, { range: 'mid' }));
    const headings = done.journal.entries.map((e) => e.heading);
    expect(headings).toContain('Kiln Heart takes its toll');
    expect(done.character.exhaustion).not.toBeNull();
  });
});

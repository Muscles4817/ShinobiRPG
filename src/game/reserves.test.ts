import { createRng } from '@/core';
import type { CombatOutcome } from '@/systems/combat';
import { maxChakra } from '@/systems/vitals';
import { act, ctx, fightOut, lastEntry, newGame, withAllStats } from '@/test/gameFixtures';

import { enemyCombatant, enemyStatLine, playerCombatant } from './combatants';
import { growFromFight } from './fightGrowth';
import { startFight } from './fightStyle';
import { deserialize } from './persistence/save';
import type { GameState } from './state';
import { shinobiView } from './views/shinobi';

const fought: CombatOutcome = {
  result: 'victory',
  rounds: 4,
  player: { health: 70, chakra: 5 },
  chakraSpent: 40,
};

/** The max chakra a character had before reserves existed (save version 15). */
function oldMaxChakra(stats: GameState['character']['stats']): number {
  return Math.round(30 + stats.chakraControl * 3 + stats.stamina * 1.5);
}

/** A long fight against a wraith, started through the game's own `startFight`. */
function wraithFight(state: GameState): GameState {
  const wraith = enemyCombatant(ctx.content.enemies.require('storehouse-wraith'), 0, ctx);
  const setup = {
    player: playerCombatant(state, ctx),
    allies: [],
    enemies: [wraith],
    canFlee: false,
  };
  return { ...state, combat: startFight(state, ctx, setup, createRng(4)) };
}

describe('chakra reserves', () => {
  it('are a stat on the Shinobi sheet, with a grade', () => {
    const body = shinobiView(newGame(), ctx).groups.find((g) => g.group === 'body')!;
    const reserves = body.stats.find((s) => s.label === 'Chakra Reserves');
    expect(reserves?.tier.grade).toBe('E');
  });

  it('set max chakra; stamina no longer does', () => {
    const state = newGame();
    const { stats } = state.character;
    const deeper = {
      ...state,
      character: { ...state.character, stats: { ...stats, reserves: 20 } },
    };
    const tougher = {
      ...state,
      character: { ...state.character, stats: { ...stats, stamina: 20 } },
    };
    expect(playerCombatant(deeper, ctx).maxChakra).toBeGreaterThan(maxChakra(stats));
    expect(playerCombatant(tougher, ctx).maxChakra).toBe(maxChakra(stats));
  });

  it('grow alongside stamina training, and not from other drills', () => {
    const before = newGame();
    const swum = act(before, { type: 'train', trainingId: 'lake-laps' });
    expect(swum.character.stats.reserves).toBeGreaterThan(before.character.stats.reserves);
    expect(lastEntry(swum)?.chips?.map((c) => c.label)).toContainEqual(
      expect.stringMatching(/^Chakra Reserves \+/),
    );
    const kicked = act(before, { type: 'train', trainingId: 'post-kicks' });
    expect(kicked.character.stats.reserves).toBe(before.character.stats.reserves);
  });

  it('deepen with the chakra spent in a fight, in a journal line without numbers', () => {
    const before = newGame();
    const lessons = { outcome: fought, foes: [], hurt: 0, reportsBefore: 0 };
    const after = growFromFight(before, lessons, ctx);
    expect(after.character.stats.reserves).toBeGreaterThan(before.character.stats.reserves);
    const entry = lastEntry(after)!;
    expect(entry.heading).toBe('What the fight taught you');
    expect(entry.text).not.toMatch(/\d/);
    expect(entry.chips?.[0]?.label).toMatch(/^Chakra Reserves \+/);
    const spentNothing = { ...lessons, outcome: { ...fought, chakraSpent: 0 } };
    expect(growFromFight(before, spentNothing, ctx)).toBe(before);
  });

  it('a fight fought with jutsu leaves them deeper', () => {
    const strong = withAllStats(newGame(), 12);
    const ended = fightOut(wraithFight(strong));
    expect(ended.combat).toBeNull();
    expect(ended.character.stats.reserves).toBeGreaterThan(strong.character.stats.reserves);
  });

  it('give enemies the chakra they were written with', () => {
    for (const def of ctx.content.enemies.all) {
      const stats = enemyStatLine(def);
      expect(stats.reserves).toBeGreaterThanOrEqual(0);
      // Below the chakra everyone has, there are no reserves to speak of.
      if (stats.reserves > 0) {
        expect(Math.abs(maxChakra(stats) - def.maxChakra)).toBeLessThanOrEqual(1);
      }
      expect(enemyCombatant(def, 0, ctx).maxChakra).toBe(def.maxChakra);
    }
  });

  it('are seeded for a version 15 save so max chakra stays about the same', () => {
    const state = newGame();
    const { reserves: _none, ...old } = { ...state.character.stats, stamina: 12, chakraControl: 8 };
    const v15 = {
      ...state,
      character: { ...state.character, stats: old, startingStats: old },
    };
    const loaded = deserialize(JSON.stringify({ version: 15, state: v15 }));
    if (!loaded.ok) throw new Error(loaded.error);
    const { stats, startingStats } = loaded.value.character;
    const oldMax = oldMaxChakra({ ...stats, reserves: 0 });
    expect(Math.abs(maxChakra(stats) - oldMax)).toBeLessThanOrEqual(1);
    expect(startingStats.reserves).toBe(stats.reserves);
    expect(loaded.value.character.vitals.chakra).toBe(state.character.vitals.chakra);
  });
});

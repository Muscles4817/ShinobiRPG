import { ctx, newGame } from '@/test/gameFixtures';

import { enemyCombatant } from './combatants';
import { poolsSeen } from './retinueSight';
import { scoutOpponents } from './scouting';
import type { GameState } from './state';

/** Foes who carry a hive or dust: full in the fight, and seen or not at a glance. */

function withEyes(perception: number): GameState {
  const state = newGame();
  return {
    ...state,
    character: { ...state.character, stats: { ...state.character.stats, perception } },
  };
}

describe('foes with hives and dust', () => {
  it('bring a full hive or store into the fight', () => {
    const moths = enemyCombatant(ctx.content.enemies.require('rogue-moth-keeper'), 0, ctx);
    expect(moths.swarm?.count).toBe(moths.swarm?.cap);
    expect(moths.swarm?.strain.name).toBe('Lantern Moths');
    const glass = enemyCombatant(ctx.content.enemies.require('glass-sand-rogue'), 0, ctx);
    expect(glass.dust?.kind.name).toBe('Glass Sand');
    expect(glass.dust?.count).toBe(glass.dust?.cap);
  });

  it('a pouch of dust shows at a glance; a hive in the body rarely does', () => {
    const glass = ctx.content.enemies.require('glass-sand-rogue');
    const moths = ctx.content.enemies.require('rogue-moth-keeper');
    expect(poolsSeen(withEyes(1), glass, 'glance').dust).toBe(true);
    expect(poolsSeen(withEyes(1), moths, 'glance').hive).toBe(false);
    expect(poolsSeen(withEyes(1), moths, 'full').hive).toBe(true);
  });

  it('a read names what they carry and what undoes it', () => {
    const reads = scoutOpponents(newGame(), ctx, ['rogue-moth-keeper#0', 'glass-sand-rogue#0']);
    expect(reads['rogue-moth-keeper#0']?.pools[0]?.counter).toMatch(/Fire and wind kill/);
    expect(reads['glass-sand-rogue#0']?.pools[0]).toEqual({
      label: 'Commands glass sand.',
      counter: 'Heavy blows scatter it.',
    });
  });
});

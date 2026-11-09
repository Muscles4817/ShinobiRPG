import { createRng } from '@/core';
import type { EnemyDef } from '@/content';
import { enemyParty } from '@/game/combatants';
import { createPlanEngine } from '@/systems/combat';
import type { Danger } from '@/systems/missions';
import { ctx } from '@/test/gameFixtures';

import { ARCHETYPE_IDS, archetype } from './archetypes';
import { toSetup, type Scale } from './fighters';
import { STALEMATE_EXCHANGES } from './runner';

/**
 * Bestiary fights: a foe and its retinue against every bench archetype at a scale, for the
 * bestiary bench and the foreign shinobi bench, with the bands both hold foes to.
 */

/** The scale a danger is measured at, and the scale below it. */
export const SCALE_OF: Readonly<Record<Danger, Scale>> = {
  petty: 'genin',
  armed: 'genin',
  deadly: 'chunin',
  elite: 'jonin',
};
export const SCALE_BELOW: Readonly<Partial<Record<Danger, Scale>>> = {
  deadly: 'genin',
  elite: 'chunin',
};

/** At its own scale, the archetypes on average beat a foe at least this often. */
export const BEATEN_AT_LEAST: Readonly<Record<Danger, number>> = {
  petty: 0.5,
  armed: 0.4,
  deadly: 0.3,
  elite: 0.3,
};
/** A scale below, the archetypes on average beat a deadly or elite foe no more often than this. */
export const TOO_MUCH_BELOW = 0.3;

/** The archetypes' average win rate against a foe and its retinue, over `seeds` fights each. */
export function beatenAt(def: EnemyDef, scale: Scale, seeds: number): number {
  const engine = createPlanEngine();
  const rates = ARCHETYPE_IDS.map((id) => {
    const spec = archetype(id, scale);
    let wins = 0;
    for (let seed = 1; seed <= seeds; seed++) {
      const rng = createRng(seed * 7919);
      const setup = {
        player: toSetup(spec, 'player'),
        allies: [],
        enemies: enemyParty(def, 0, ctx),
        canFlee: false,
        ...(spec.plan ? { plan: spec.plan } : {}),
      };
      let state = engine.start(setup, rng);
      for (let n = 0; !engine.outcome(state) && n < STALEMATE_EXCHANGES;) {
        const begin = engine.view(state).options.some((o) => o.id === 'begin');
        const next = engine.act(state, { optionId: begin ? 'begin' : 'next' }, rng);
        if (!next.ok) throw new Error(next.error);
        state = next.value;
        if (!begin) n += 1;
      }
      if (engine.outcome(state)?.result === 'victory') wins += 1;
    }
    return wins / seeds;
  });
  return rates.reduce((sum, r) => sum + r, 0) / rates.length;
}

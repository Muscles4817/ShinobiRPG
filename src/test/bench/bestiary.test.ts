import { createRng } from '@/core';
import type { EnemyDef } from '@/content';
import { ORIGINAL_FOE_KIT } from '@/content/packs/original/bestiaryKit';
import { bestiary } from '@/content/shared/bestiary';
import { enemyParty } from '@/game/combatants';
import { createPlanEngine } from '@/systems/combat';
import type { Danger } from '@/systems/missions';
import { ctx } from '@/test/gameFixtures';

import { ARCHETYPE_IDS, archetype } from './archetypes';
import { toSetup, type Scale } from './fighters';
import { STALEMATE_EXCHANGES } from './runner';

/**
 * THE BESTIARY BENCH
 *
 * The shared bestiary is written before any job sends you after it, so nothing else would
 * notice a foe tuned wrong. Each one fights every bench archetype at the career scale its
 * danger means, and must be a fight there: beaten often, never a formality for every style.
 * A deadly or elite foe must also be too much for fighters a scale below, so its danger means
 * something. (Measured when the bestiary was written: the old foes of each danger sit inside
 * these bands, the samurai had to come down two steps to join them.)
 */

/** The scale a danger is measured at, and the scale below it. */
const SCALE_OF: Readonly<Record<Danger, Scale>> = {
  petty: 'genin',
  armed: 'genin',
  deadly: 'chunin',
  elite: 'jonin',
};
const SCALE_BELOW: Readonly<Partial<Record<Danger, Scale>>> = { deadly: 'genin', elite: 'chunin' };

/** At its own scale, the archetypes on average beat a foe at least this often. */
const BEATEN_AT_LEAST: Readonly<Record<Danger, number>> = {
  petty: 0.5,
  armed: 0.4,
  deadly: 0.3,
  elite: 0.3,
};
/** A scale below, the archetypes on average beat a deadly or elite foe no more often than this. */
const TOO_MUCH_BELOW = 0.3;

const SEEDS = 20;

/** The archetypes' average win rate against a foe and its retinue, at a scale. */
function beatenAt(def: EnemyDef, scale: Scale): number {
  const engine = createPlanEngine();
  const rates = ARCHETYPE_IDS.map((id) => {
    const spec = archetype(id, scale);
    let wins = 0;
    for (let seed = 1; seed <= SEEDS; seed++) {
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
    return wins / SEEDS;
  });
  return rates.reduce((sum, r) => sum + r, 0) / rates.length;
}

const FOES = bestiary(ORIGINAL_FOE_KIT).map((e) => ctx.content.enemies.require(e.id));
/** A few thousand fights take a while on a slow runner. */
const TIMEOUT_MS = 30_000;

describe('the bestiary, each foe at the grade its danger means', () => {
  it.each(FOES.map((f) => [f.id, f] as const))(
    '%s is a fight at its own scale',
    (_, def) => {
      expect(beatenAt(def, SCALE_OF[def.danger])).toBeGreaterThanOrEqual(
        BEATEN_AT_LEAST[def.danger],
      );
    },
    TIMEOUT_MS,
  );

  it.each(FOES.filter((f) => SCALE_BELOW[f.danger] !== undefined).map((f) => [f.id, f] as const))(
    '%s is too much for fighters a scale below',
    (_, def) => {
      expect(beatenAt(def, SCALE_BELOW[def.danger]!)).toBeLessThanOrEqual(TOO_MUCH_BELOW);
    },
    TIMEOUT_MS,
  );
});

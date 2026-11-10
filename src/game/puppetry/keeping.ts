import type { CombatOutcome } from '@/systems/combat';
import { afterFight, isBroken, owns, withPuppet } from '@/systems/puppets';
import { knows } from '@/systems/techniques';

import type { GameContext } from '../context';
import { chip, log } from '../ops';
import type { GameState } from '../state';

/**
 * Coming by puppets and keeping them between fights. The art comes with a puppet to work: the
 * first time you learn a technique that unseals one of the pack's puppets, that puppet is yours
 * (a journeyman's doll comes with the first lesson). After a mission fight each puppet you
 * called comes home as whole as it ended it, and one beaten is broken until it is mended.
 */

/** Puppets whose unsealing you learned with this action, given to you once. */
export function notePuppetsLearned(
  before: GameState,
  after: GameState,
  ctx: GameContext,
): GameState {
  return ctx.content.puppets.all
    .filter((p) => !knows(before.techniques, p.techniqueId))
    .filter((p) => knows(after.techniques, p.techniqueId))
    .filter((p) => !owns(after.puppetry, p.id))
    .reduce(
      (state, puppet) =>
        log(
          { ...state, puppetry: withPuppet(state.puppetry, puppet.id, puppet.name) },
          {
            heading: `${puppet.name} is yours`,
            text: `The art comes with a body to work it on. ${puppet.description}`,
            tone: 'success',
            chips: [chip('New puppet', 'gain')],
          },
        ),
      after,
    );
}

/** Your puppets after a mission fight: each called comes home as whole as it ended it. */
export function afterPuppetFight(state: GameState, outcome: CombatOutcome): GameState {
  const shares = outcome.summonHealth ?? {};
  const called = state.puppetry.puppets.filter((p) => shares[p.id] !== undefined);
  if (called.length === 0) return state;
  const puppetry = afterFight(state.puppetry, shares);
  const broken = puppetry.puppets.filter(
    (p) => isBroken(p) && called.some((c) => c.id === p.id && !isBroken(c)),
  );
  const kept = { ...state, puppetry };
  return broken.reduce(
    (now, p) =>
      log(now, {
        text: `${p.name} comes home in pieces. It will need mending before it fights again.`,
        tone: 'warning',
        chips: [chip('Broken', 'harm')],
      }),
    kept,
  );
}

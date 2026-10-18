import { alive } from '../../rules/body';
import { CLONE_RULES, cloneUpkeep, kindOf, type Clones } from '../../rules/verbs';
import { tell } from '../../rules/telling';
import { patch, say, type PlanFighter, type Round } from './state';

/**
 * Keeping clones up in a planned fight (`rules/verbs/cloneKinds.ts`): at the end of each
 * exchange an earth clone that burst rebuilds (one, up to as many as were made, while any
 * stand), then the maker pays each clone's upkeep. Clones the maker can no longer pay for fade.
 * Fire clones feed themselves and illusions cost nothing, so only solid clones of other kinds
 * draw on the maker.
 */

/** One rebuilt, for an earth clone short of what was made and still standing. */
function rebuilt(clones: Clones): Clones {
  const made = clones.made ?? clones.count;
  const rebuilds = CLONE_RULES[kindOf(clones)].rebuilds;
  return rebuilds && clones.count > 0 && clones.count < made
    ? { ...clones, count: clones.count + 1 }
    : clones;
}

/** As many clones as the maker's chakra still pays for. */
function affordable(clones: Clones, chakra: number): number {
  const each = CLONE_RULES[kindOf(clones)].upkeep;
  return each <= 0 ? clones.count : Math.min(clones.count, Math.floor(chakra / each));
}

function keptUp(round: Round, maker: PlanFighter): Round {
  const standing = maker.clones;
  if (!standing || standing.count <= 0 || !alive(maker)) return round;
  const grown = rebuilt(standing);
  const kept = { ...grown, count: affordable(grown, maker.chakra) };
  const chakra = Math.max(0, maker.chakra - cloneUpkeep(kept));
  const fighters = patch(round.fighters, maker.id, { clones: kept, chakra });
  const next = { ...round, fighters };
  if (kept.count < grown.count) {
    return say(next, tell('{a.poss} clones fade as {a.their} chakra thins.', { a: maker }));
  }
  return grown.count > standing.count
    ? say(next, tell('A clone of {a} heaves back up.', { a: maker }))
    : next;
}

/** At the end of an exchange: clones rebuild where they can, and their makers keep them up. */
export function clonesAfter(round: Round): Round {
  return round.fighters.reduce((now, f) => {
    const maker = now.fighters.find((m) => m.id === f.id);
    return maker ? keptUp(now, maker) : now;
  }, round);
}

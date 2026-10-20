import { statTier, type StatGrade } from '@/systems/stats';
import type { Verb } from '@/systems/techniques';

import type { CombatTechnique, RangeBand } from '../contract';
import { isBodyMove } from './breath';
import { inReach, reachOf } from './range';
import { effectsOf, hasVerb, techniquePower } from './verbs';

/**
 * Chains: two or three body moves thrown back to back in one turn, each only if the one before
 * it landed. What a link sets up is what the fight already does to the one it lands on: a daze
 * leaves them open (no slipping the next), a pin holds them (the next is hard to slip), a knock
 * throws them to another distance (the next must reach there, or carry its user in). A chain
 * is a trained fighter's tool, as long as their taijutsu grade allows, and is read as one
 * pattern by its opener.
 */

/** How many links a chain may have, by taijutsu grade (none below C). */
export const CHAIN_LENGTH: Readonly<Record<StatGrade, number>> = {
  E: 0,
  D: 0,
  C: 2,
  B: 2,
  A: 3,
  S: 3,
};

/** How many chains a fighter keeps ready. */
export const CHAINS_KEPT = 3;

/** What leaves a foe set up for the next link. */
const SETS_UP: readonly Verb[] = ['daze', 'pin', 'knock'];

/** The distance a chain opens at: hand to hand. */
export const CHAIN_OPENS_AT: RangeBand = 'close';

/** A move a chain can hold: a body move that strikes, with nothing set aside for it. */
export function fitsChain(t: CombatTechnique): boolean {
  if (!isBodyMove(t) || hasVerb(t, 'counter')) return false;
  return !t.oncePerFight && !t.combo && !t.afterCost && t.swarmCost === undefined;
}

/** How many links a chain may have at this taijutsu. */
export function chainLength(taijutsu: number): number {
  return CHAIN_LENGTH[statTier(taijutsu).grade];
}

/** Whether a move leaves its target set up for another. */
export function setsUp(t: CombatTechnique): boolean {
  return SETS_UP.some((verb) => hasVerb(t, verb));
}

/** Where the fight stands after a link lands: thrown apart by its knock, else where it was. */
export function bandAfter(t: CombatTechnique, band: RangeBand): RangeBand {
  return effectsOf(t, 'knock')[0]?.to ?? band;
}

/** Whether a move can follow from where the last left the fight: it reaches, or carries you in. */
export function reachesAfter(next: CombatTechnique, band: RangeBand): boolean {
  return inReach(reachOf(next), band) || hasVerb(next, 'move');
}

/**
 * What would break a chain before it is thrown, in words, or null when every link follows: a
 * move a chain can't hold, more links than the grade allows, or a link that can't reach where
 * the last one leaves the fight.
 */
export function chainProblem(links: readonly CombatTechnique[], taijutsu: number): string | null {
  const length = chainLength(taijutsu);
  if (length === 0) return 'Chains come at taijutsu grade C.';
  if (links.length < 2) return 'A chain needs two moves at least.';
  if (links.length > length) return `At your taijutsu grade a chain has ${length} moves at most.`;
  const odd = links.find((t) => !fitsChain(t));
  if (odd) return `${odd.name} isn’t a body move a chain can hold.`;
  let band = CHAIN_OPENS_AT;
  for (const [i, link] of links.entries()) {
    if (!reachesAfter(link, band)) {
      const before = links[i - 1]?.name ?? 'The chain';
      return `${before} leaves them at ${band}, and ${link.name} can’t reach there.`;
    }
    band = bandAfter(link, band);
  }
  return null;
}

/** The chain a moveset builds from one opener: the strongest moves that follow, as long as allowed. */
function builtFrom(opener: CombatTechnique, moves: readonly CombatTechnique[], length: number) {
  const chain = [opener];
  let [last, band] = [opener, bandAfter(opener, CHAIN_OPENS_AT)];
  while (chain.length < length && setsUp(last)) {
    const next = moves
      .filter((m) => !chain.includes(m) && reachesAfter(m, band))
      .sort((a, b) => techniquePower(b) - techniquePower(a))[0];
    if (!next) break;
    chain.push(next);
    [last, band] = [next, bandAfter(next, band)];
  }
  return chain;
}

/**
 * The chains a fighter keeps when they haven't built their own: from each move that sets a foe
 * up, the strongest moves that follow it, best first, a few at most.
 */
export function defaultChains(
  techniques: readonly CombatTechnique[],
  taijutsu: number,
): string[][] {
  const length = chainLength(taijutsu);
  if (length < 2) return [];
  const moves = techniques.filter(fitsChain);
  const power = (chain: readonly CombatTechnique[]) =>
    chain.reduce((sum, t) => sum + techniquePower(t), 0);
  return moves
    .filter((t) => setsUp(t) && reachesAfter(t, CHAIN_OPENS_AT))
    .map((opener) => builtFrom(opener, moves, length))
    .filter((chain) => chain.length >= 2)
    .sort((a, b) => power(b) - power(a))
    .slice(0, CHAINS_KEPT)
    .map((chain) => chain.map((t) => t.id));
}

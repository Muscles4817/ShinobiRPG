import { isPinned } from '../../rules/verbs';
import { cardsFor, isOffence, playable, type Card } from './cards';
import { crowdedChance, crowder, signsOf } from './closeQuarters';
import { readsInTheMoment } from './judgement';
import type { Chosen } from './slots';
import type { PlanFighter, Round } from './state';
import { strongestBand } from './stepping';
import { cardWorth } from './worth';

/**
 * Keeping the seals clear of a crowder (with the `handSigns` rule on trial, `closeQuarters.ts`):
 * a mind that reads the fight, about to make hand signs with an able foe close enough to break
 * them, doesn't cast into that. One whose kit is strongest further off steps back to make room
 * (a trapper's game is distance and setup, never trading cuts); one at home up close plays
 * something that needs no signs, if it has something worth throwing, else steps back too. The
 * step may still be kept pace with, and that is the caster's trouble. The player's own plan is theirs (`kitPlay` in
 * `priority.ts`): they meet this only when they only watch.
 */

/** Below this chance of the seals coming apart, a caster casts anyway. */
const WARY_FROM = 0.25;
/** A signless attack worth at least this share of the cast is played in its place. */
const QUIET_SHARE = 0.5;

const STEP_BACK: Card = { kind: 'step', direction: 'back' };

/** Whether a card needs hand signs. */
function needsSigns(card: Card): boolean {
  return card.kind === 'jutsu' && signsOf(card.technique) > 0;
}

/** The best attack here that needs no signs, if it is worth enough beside the cast. */
function quietAttack(round: Round, self: PlanFighter, foe: PlanFighter, cast: Card): Card | null {
  const where = { band: 'close' as const, fighters: round.fighters };
  const worth = (c: Card) => cardWorth(self, foe, c, where) ?? 0;
  const quiet = cardsFor(self, 'close')
    .filter((c) => isOffence(c) && !needsSigns(c) && playable(self, c))
    .sort((a, b) => worth(b) - worth(a))[0];
  if (!quiet) return null;
  return worth(quiet) >= worth(cast) * QUIET_SHARE ? quiet : null;
}

/** What a wary caster plays in place of signs a crowder would break, or null to cast anyway. */
export function crowdWary(round: Round, self: PlanFighter, chosen: Chosen): Chosen | null {
  if (!self.crowdable || (self.isPlayer && round.watching !== true)) return null;
  if (!readsInTheMoment(self) || chosen.card.kind !== 'jutsu') return null;
  const signs = signsOf(chosen.card.technique);
  const foe = signs > 0 ? crowder(round, self) : undefined;
  if (!foe || crowdedChance(self, foe, signs) < WARY_FROM) return null;
  const quiet = strongestBand(self) === 'close' ? quietAttack(round, self, foe, chosen.card) : null;
  if (quiet) return { card: quiet, target: foe, why: 'crowded' };
  return isPinned(self) ? null : { card: STEP_BACK, target: undefined, why: 'crowded' };
}

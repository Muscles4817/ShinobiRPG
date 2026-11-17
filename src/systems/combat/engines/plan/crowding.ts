import { isPinned } from '../../rules/verbs';
import { cardsFor, isOffence, playable, type Card } from './cards';
import { crowdedChance, crowder, signsOf } from './closeQuarters';
import { readsInTheMoment } from './judgement';
import type { Chosen } from './slots';
import type { PlanFighter, Round } from './state';
import { strongestBand } from './stepping';
import { cardWorth } from './worth';

/**
 * Keeping the seals clear of a crowder (with the `handSigns` rule on trial, `closeQuarters.ts`).
 * A mind that reads the fight, about to make hand signs with an able foe close enough to break them,
 * weighs it by what kind of fighter it is and what the cast is for:
 * - a caster whose kit is strongest further off steps back to make room, whatever the cast;
 * - one at home up close throws an attack that needs no signs in place of an attack cast, if it is
 *   worth more than the cast after the chance of losing it; a cast that isn't an attack (a heal,
 *   armour, a trap, an empower) is never swapped for one. Either is cast unless losing it is
 *   likelier than not, and then the fighter steps back.
 * The step may still be kept pace with, and that is the caster's trouble.
 *
 * The player's own plan is theirs (`kitPlay` in `priority.ts`): they meet this only when they only
 * watch.
 */

/** Below this chance of the seals coming apart, a caster casts without a second thought. */
const WARY_FROM = 0.25;
/** From this chance, a cast with nothing better in its place is given up for a step back. */
const STEP_BACK_FROM = 0.5;

const STEP_BACK: Card = { kind: 'step', direction: 'back' };

/** Whether a card needs hand signs. */
function needsSigns(card: Card): boolean {
  return card.kind === 'jutsu' && signsOf(card.technique) > 0;
}

interface Weighing {
  readonly round: Round;
  readonly self: PlanFighter;
  readonly foe: PlanFighter;
  /** The chance the cast's seals come apart. */
  readonly risk: number;
}

/** The best attack that needs no signs, if it is worth more than the cast after its risk. */
function quietAttack({ round, self, foe, risk }: Weighing, cast: Card): Card | null {
  const where = { band: 'close' as const, fighters: round.fighters };
  const worth = (c: Card) => cardWorth(self, foe, c, where) ?? 0;
  const quiet = cardsFor(self, 'close')
    .filter((c) => isOffence(c) && !needsSigns(c) && playable(self, c))
    .sort((a, b) => worth(b) - worth(a))[0];
  if (!quiet) return null;
  return worth(quiet) > worth(cast) * (1 - risk) ? quiet : null;
}

/** What a caster wary of this crowder plays instead, or null to cast anyway. */
function insteadOf(weighing: Weighing, cast: Card): Chosen | null {
  const { self, foe, risk } = weighing;
  const atHome = strongestBand(self) === 'close';
  const quiet = atHome && isOffence(cast) ? quietAttack(weighing, cast) : null;
  if (quiet) return { card: quiet, target: foe, why: 'crowded' };
  const makesRoom = !atHome || risk >= STEP_BACK_FROM;
  return makesRoom && !isPinned(self)
    ? { card: STEP_BACK, target: undefined, why: 'crowded' }
    : null;
}

/** What a wary caster plays in place of signs a crowder would break, or null to cast anyway. */
export function crowdWary(round: Round, self: PlanFighter, chosen: Chosen): Chosen | null {
  if (!self.crowdable || (self.isPlayer && round.watching !== true)) return null;
  if (!readsInTheMoment(self) || chosen.card.kind !== 'jutsu') return null;
  const signs = signsOf(chosen.card.technique);
  const foe = signs > 0 ? crowder(round, self) : undefined;
  const risk = foe ? crowdedChance(self, foe, signs) : 0;
  if (!foe || risk < WARY_FROM) return null;
  return insteadOf({ round, self, foe, risk }, chosen.card);
}

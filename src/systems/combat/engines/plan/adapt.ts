import type { RangeBand } from '../../contract';
import { alive } from '../../rules/body';
import { RANGE_BANDS } from '../../rules/range';
import { cardId, type Card } from './cards';
import { substitutionsReady } from './footwork';
import { reactionAt, reactionChoices } from './readiness';
import { defenceKind as kindOf, readOf, styleOf } from './reads';
import type { AttackStyle, DefenceKind, PlanFighter, Reactions, Reads } from './state';

/**
 * Foes put what they've read to use. In a fight, an attack that beats the defence they've seen
 * you keep at this distance comes first (a guard-breaker or flurry on a Guard, an illusion or a
 * sure technique on a Dodge, anything but a blow on a Counter, an illusion on a substitution),
 * and a blow that walks into a seen Counter is held back. Between rounds, once they've seen
 * enough of your attacks, a foe keeps the defence that best meets them. They only answer with
 * cards they have, and only habits they've seen.
 */

/** Attacks seen before a foe rethinks its defence between rounds. */
export const ADAPT_AFTER = 3;

/** How well each defence meets each style of attack, by the rules in `react.ts`. */
const MEETS: Readonly<Record<DefenceKind, Readonly<Record<AttackStyle, number>>>> = {
  // A guard blunts anything once, but a break smashes it and a flurry gets past after one blow.
  guard: { blow: 1, sure: 1, illusion: 1, jutsu: 0.8, break: 0, flurry: 0.3 },
  // Nothing slips an illusion, and a sure technique is hard to slip.
  dodge: { blow: 0.8, sure: 0.2, illusion: 0, jutsu: 0.8, break: 1, flurry: 1 },
  // A counter answers only hand-to-hand; a Guard still meets plain blows better (the bench says).
  counter: { blow: 0.9, flurry: 0.6, sure: 0, illusion: 0, jutsu: 0, break: 0 },
  // A substitution escapes one hit a round, never an illusion.
  swap: { blow: 0.7, sure: 0.7, break: 0.7, jutsu: 0.7, flurry: 0.4, illusion: 0 },
};

/** A hand-to-hand blow up close: what a Counter answers. */
function handToHand(card: Card): boolean {
  if (card.kind === 'strike') return true;
  if (card.kind !== 'jutsu') return false;
  const art = card.technique.discipline;
  return art === 'taijutsu' || art === 'kenjutsu';
}

/** Whether an attack gets past a defence its target has shown. */
export function beats(card: Card, defence: DefenceKind): boolean {
  const style = styleOf(card);
  if (!style) return false;
  switch (defence) {
    case 'guard':
      return style === 'break' || style === 'flurry';
    case 'dodge':
      return style === 'illusion' || style === 'sure';
    case 'counter':
      return !handToHand(card);
    case 'swap':
      return style === 'illusion';
  }
}

/** Whether an attack walks straight into a defence its target has shown. */
export function walksInto(card: Card, defence: DefenceKind): boolean {
  return defence === 'counter' && handToHand(card);
}

/** The defence a target has been seen to keep at this distance. */
export function seenDefence(
  reads: Reads | undefined,
  target: PlanFighter | undefined,
  band: RangeBand,
): DefenceKind | undefined {
  return target ? readOf(reads, target.id).defences[band] : undefined;
}

/** Every attack the fighter's opponents have been seen to throw, by style. */
function seenAttacks(fighters: readonly PlanFighter[], self: PlanFighter, reads: Reads) {
  const totals: Partial<Record<AttackStyle, number>> = {};
  for (const f of fighters) {
    if (f.side === self.side || !alive(f)) continue;
    for (const [style, n] of Object.entries(readOf(reads, f.id).attacks)) {
      const key = style as AttackStyle; // Object.entries widens the keys it was given.
      totals[key] = (totals[key] ?? 0) + n;
    }
  }
  return totals;
}

function score(kind: DefenceKind, attacks: Partial<Record<AttackStyle, number>>): number {
  return Object.entries(attacks).reduce(
    (sum, [style, n]) => sum + MEETS[kind][style as AttackStyle] * n, // As above.
    0,
  );
}

/** The defence that best meets what has been thrown; the one kept, unless another is better. */
function bestAt(self: PlanFighter, band: RangeBand, attacks: Partial<Record<AttackStyle, number>>) {
  const kept = reactionAt(self, band);
  let best = kept;
  let top = kept ? score(kindOf(kept) ?? 'guard', attacks) : 0;
  for (const card of reactionChoices(self, band)) {
    const kind = kindOf(card);
    const value = kind ? score(kind, attacks) : 0;
    if (value > top) [best, top] = [card, value];
  }
  return best ? cardId(best) : null;
}

function rethink(self: PlanFighter, fighters: readonly PlanFighter[], reads: Reads): PlanFighter {
  const attacks = seenAttacks(fighters, self, reads);
  const total = Object.values(attacks).reduce((sum, n) => sum + n, 0);
  if (total < ADAPT_AFTER) return self;
  const [close = null, mid = null, far = null] = RANGE_BANDS.map((b) => bestAt(self, b, attacks));
  const reactions: Reactions = { close, mid, far };
  return { ...self, reactions };
}

/** Between rounds: substitutions are ready again, and foes rethink their defences. */
export function betweenRounds(
  fighters: readonly PlanFighter[],
  reads: Reads | undefined,
): PlanFighter[] {
  const ready = substitutionsReady(fighters);
  if (!reads) return ready;
  return ready.map((f) => (f.side === 'enemy' && alive(f) ? rethink(f, ready, reads) : f));
}

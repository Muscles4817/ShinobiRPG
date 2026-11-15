import type { RangeBand } from '../../../../contract';
import { RANGE_BANDS } from '../../../../rules/range';
import { fitsBand, type Card } from '../../cards';
import { isOpen } from '../../finishers';
import type { PlanFighter, PlanState } from '../../state';

/**
 * What proposes the planner's chains (`docs/design/combat-ai-plan.md` Part 7, "A with
 * GOAP-generated candidates"): every card gets symbolic preconditions and effects read from its
 * verbs and fields, never its name, and a chain is proposed only where an earlier card makes true
 * a precondition of a later one that isn't true now. Proposing is all it does: every chain is
 * still scored in the real engine (`search.ts`).
 *
 * Facts: `open` (a foe dazed or held), `unseen` (the user hidden), `boosted` (the user
 * strengthened), `at:<band>` (the fight at a distance).
 */

export type Fact = string;

const MAKES: Readonly<Record<string, Fact>> = {
  daze: 'open',
  pin: 'open',
  conceal: 'unseen',
  empower: 'boosted',
  shroud: 'boosted',
  clone: 'boosted',
};

const WOUNDS: ReadonlySet<string> = new Set(['damage', 'area', 'break']);

function stepTo(range: RangeBand, direction: 'in' | 'back'): RangeBand {
  const i = RANGE_BANDS.indexOf(range) + (direction === 'in' ? -1 : 1);
  return RANGE_BANDS[Math.max(0, Math.min(RANGE_BANDS.length - 1, i))] ?? range;
}

/** What a card makes true, from where the fight stands. */
export function makes(card: Card, range: RangeBand): Set<Fact> {
  const out = new Set<Fact>();
  if (card.kind === 'step') out.add(`at:${stepTo(range, card.direction)}`);
  if (card.kind !== 'jutsu') return out;
  for (const e of card.technique.effects) {
    const fact = MAKES[e.verb];
    if (fact) out.add(fact);
  }
  return out;
}

/** The ways a card's precondition can be met: any one set of facts. */
export function needs(card: Card): Fact[][] {
  const ways: Fact[][] = [];
  if (card.kind === 'jutsu') {
    const t = card.technique;
    if (t.needsTarget === 'open') ways.push(['open']);
    if (t.lethal) ways.push(['open'], ['unseen']);
    if (t.effects.some((e) => WOUNDS.has(e.verb))) ways.push(['boosted']);
  }
  const reach = RANGE_BANDS.filter((b) => fitsBand(card, b));
  if (reach.length < RANGE_BANDS.length) for (const b of reach) ways.push([`at:${b}`]);
  return ways;
}

/** What holds now, in the same facts. */
export function holdsNow(
  state: Pick<PlanState, 'range' | 'fighters'>,
  self: PlanFighter,
): Set<Fact> {
  const out = new Set<Fact>([`at:${state.range}`]);
  const foes = state.fighters.filter((f) => f.side !== self.side && f.health > 0);
  if (foes.some(isOpen)) out.add('open');
  if (self.hidden) out.add('unseen');
  return out;
}

/** The new facts a card's precondition uses, when what was made (and what holds) meets it. */
export function enabledBy(
  card: Card,
  made: readonly Fact[],
  now: ReadonlySet<Fact>,
): Fact[] | null {
  for (const way of needs(card)) {
    if (way.every((f) => made.includes(f) || now.has(f)) && way.some((f) => made.includes(f))) {
      return way.filter((f) => made.includes(f));
    }
  }
  return null;
}

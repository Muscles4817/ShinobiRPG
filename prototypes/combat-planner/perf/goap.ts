import { findCard, fitsBand, type Card } from '@/systems/combat/engines/plan/cards';
import { isOpen } from '@/systems/combat/engines/plan/finishers';
import type { CardId, PlanFighter, PlanState } from '@/systems/combat/engines/plan/state';
import { RANGE_BANDS, type RangeBand } from '@/systems/combat/rules/range';

/**
 * GOAP-style candidate generation (design Part 7, "A with GOAP-generated candidates"): every card
 * gets symbolic preconditions and effects read from its data and its verbs, never from its name,
 * and a two-card sequence is proposed only where the first card makes a precondition of the
 * second true that isn't true now. The search still scores every proposal in the real engine;
 * the schema only decides what is worth scoring.
 *
 * Facts:
 *  - `open`: a foe dazed or held (made by the daze and pin verbs; asked by a finisher that needs
 *    an open target, and by a killing blow, which also takes `unseen`);
 *  - `unseen`: the user hidden (made by conceal; asked by a killing blow);
 *  - `boosted`: the user strengthened (made by empower, shroud, clone; asked by any wounding card);
 *  - `at:<band>`: the fight at a distance (made by a step; asked by a card that reaches only some
 *    distances).
 */

type Fact = string;

const MAKES: Readonly<Record<string, Fact>> = {
  daze: 'open',
  pin: 'open',
  conceal: 'unseen',
  empower: 'boosted',
  shroud: 'boosted',
  clone: 'boosted',
};

const WOUNDS = new Set(['damage', 'area', 'break']);

function stepTo(range: RangeBand, direction: 'in' | 'back'): RangeBand {
  const i = RANGE_BANDS.indexOf(range) + (direction === 'in' ? -1 : 1);
  return RANGE_BANDS[Math.max(0, Math.min(RANGE_BANDS.length - 1, i))]!;
}

/** What a card makes true, from where the fight stands. */
export function makes(card: Card, range: RangeBand): Set<Fact> {
  const out = new Set<Fact>();
  if (card.kind === 'step') out.add(`at:${stepTo(range, card.direction)}`);
  if (card.kind === 'jutsu') {
    for (const e of card.technique.effects) if (MAKES[e.verb]) out.add(MAKES[e.verb]!);
  }
  return out;
}

/** Ways a card's precondition can be met: any one set of facts (a disjunction). */
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
export function holdsNow(state: PlanState, self: PlanFighter): Set<Fact> {
  const out = new Set<Fact>([`at:${state.range}`]);
  const foes = state.fighters.filter((f) => f.side !== self.side && f.health > 0);
  if (foes.some(isOpen)) out.add('open');
  if (self.hidden) out.add('unseen');
  return out;
}

/** The two-card sequences where the first enables the second: [first, second] pairs. */
export function enablingPairs(
  state: PlanState,
  selfId: string,
  first: readonly CardId[],
  actions: readonly CardId[],
): [CardId, CardId][] {
  const self = state.fighters.find((f) => f.id === selfId)!;
  const now = holdsNow(state, self);
  const out: [CardId, CardId][] = [];
  for (const a of first) {
    const ca = findCard(self, a);
    if (!ca) continue;
    const made = [...makes(ca, state.range)].filter((f) => !now.has(f));
    if (made.length === 0) continue;
    for (const b of actions) {
      const cb = findCard(self, b);
      if (!cb) continue;
      const met = needs(cb).some((way) => way.every((f) => made.includes(f) || now.has(f)));
      const usedNew = needs(cb).some((way) => way.some((f) => made.includes(f)));
      if (met && usedNew) out.push([a, b]);
    }
  }
  return out;
}

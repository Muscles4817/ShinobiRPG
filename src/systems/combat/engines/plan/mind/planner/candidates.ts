import type { Discipline } from '@/systems/techniques';

import { alive } from '../../../../rules/body';
import { RANGE_BANDS } from '../../../../rules/range';
import { cardId, findCard, isReaction, kitCards, type Card } from '../../cards';
import { bandOf } from '../../distance';
import { asRound } from '../../intent';
import { plannedPlay } from '../../priority';
import { opponentsOf } from '../../senses';
import { fromSlot } from '../../slots';
import type { CardId, PlanFighter, PlanState } from '../../state';
import { cardWorth } from '../../worth';
import { competenceOf, tierFor } from '../competence';
import { enabledBy, holdsNow, makes, type Fact } from './facts';
import { TIERS, type Tier } from './ladder';
import { proposalsFor } from './proposals';

/**
 * What the planner scores (`search.ts`): what the fighter's objective proposes (`proposals.ts`),
 * then single first cards by a prior that costs no exchange (what the fighter would play now
 * first, then attacks by what they are worth against the nearest foe), and pairs where the first card makes true what the second needs (`facts.ts`), proposed as
 * deep as the mind sees: tactical intelligence, lifted by expertise for a pair inside one art.
 */

export interface Candidate {
  readonly sequence: readonly CardId[];
  /** The facts each step relied on that earlier steps made (none for the first). */
  readonly relies: readonly (readonly Fact[])[];
}

/** Every card the fighter could play somewhere (ready defences aside), by id. */
function actionsOf(fighter: PlanFighter): CardId[] {
  const ids = RANGE_BANDS.flatMap((band) =>
    kitCards(fighter, band)
      .filter((c) => !isReaction(c))
      .map(cardId),
  );
  return [...new Set(ids)];
}

function artOf(card: Card): Discipline | null {
  if (card.kind === 'jutsu') return card.technique.discipline;
  if (card.kind === 'strike') return 'taijutsu';
  return card.kind === 'throw' ? 'kenjutsu' : null;
}

/** How deep a pair this mind proposes: its own tier, or its art's for a pair inside one art. */
function pairsFor(self: PlanFighter, cards: readonly Card[], tier: Tier): boolean {
  if (tier.chain >= 1) return true;
  const arts = cards.map(artOf).filter((a): a is Discipline => a !== null);
  if (arts.length < cards.length) return false;
  return TIERS[tierFor(competenceOf(self), arts)].chain >= 1;
}

/** First cards in prior order: what they'd play now, then attacks by worth, then the rest. */
function priorOrder(state: PlanState, self: PlanFighter, first: readonly CardId[]): CardId[] {
  const now = cardId(plannedPlay(self, asRound(state)).card);
  const foe = opponentsOf(state.fighters, self).find(alive);
  const where = { band: bandOf(state, self), fighters: state.fighters };
  const worth = (id: CardId) => {
    const card = findCard(self, id);
    return id === now ? Infinity : card && foe ? (cardWorth(self, foe, card, where) ?? -1) : -1;
  };
  return first
    .map((id, i) => ({ id, i, w: worth(id) }))
    .sort((a, b) => (b.w !== a.w ? b.w - a.w : a.i - b.i))
    .map((s) => s.id);
}

function pairs(
  state: PlanState,
  self: PlanFighter,
  tier: Tier,
  sets: { first: CardId[]; all: CardId[] },
) {
  const now = holdsNow(state, self);
  return sets.first.flatMap((a) => {
    const ca = findCard(self, a);
    const made = ca ? [...makes(ca, state.range)].filter((f) => !now.has(f)) : [];
    if (!ca || made.length === 0) return [];
    return sets.all.flatMap((b): Candidate[] => {
      const cb = findCard(self, b);
      const used = cb ? enabledBy(cb, made, now) : null;
      return cb && used && pairsFor(self, [ca, cb], tier)
        ? [{ sequence: [a, b], relies: [[], used] }]
        : [];
    });
  });
}

/** A single first card at the front, if it isn't among the singles already. */
function withSingle(singles: Candidate[], id: CardId): void {
  if (!singles.some((c) => c.sequence.length === 1 && c.sequence[0] === id)) {
    singles.unshift({ sequence: [id], relies: [[]] });
  }
}

/** What a mind of this tier scores from here, singles first. */
export function candidatesFor(
  state: PlanState,
  self: PlanFighter,
  { tier, keep }: { readonly tier: Tier; readonly keep?: CardId | undefined },
): {
  readonly candidates: Candidate[];
  readonly all: readonly CardId[];
  /** What the fighter would play now without planning, when it can be played. */
  readonly usual: CardId | undefined;
} {
  const all = actionsOf(self);
  const now = asRound(state);
  const first = all.filter((id) => fromSlot(self, now, { card: id }) !== null);
  const singles = priorOrder(state, self, first)
    .slice(0, tier.firstK)
    .map((id): Candidate => ({ sequence: [id], relies: [[]] }));
  // The next step of a plan already held is what it would do anyway; else its plan of cards.
  // What the objective proposes is tried, and the first it can play is what it would do anyway
  // (a held plan's next step still comes first); else its plan of cards, as before.
  const proposed = proposalsFor(state, self).filter((id) => first.includes(id));
  const anyway = keep ?? proposed[0] ?? cardId(plannedPlay(self, now).card);
  const usual = first.includes(anyway) ? anyway : undefined;
  for (const id of [...proposed].reverse()) withSingle(singles, id);
  if (usual !== undefined) withSingle(singles, usual);
  return { candidates: [...singles, ...pairs(state, self, tier, { first, all })], all, usual };
}

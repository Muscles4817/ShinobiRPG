import { alive } from '../../rules/body';
import { clonesLeft, hasVerb, isPinned, isWounding } from '../../rules/verbs';
import { findCard, isOffence, type Card } from './cards';
import { isDazed } from './daze';
import { isOpen } from './finishers';
import { opponentsOf, inSight } from './senses';
import type { CardId, PlanFighter, Round, SlotCondition } from './state';
import { FRESH_RUN, runOf } from '../../rules/familiarity';
import { isBodyMove, maxBreath } from '../../rules/breath';

/**
 * When a slot may play (audit P2.2): one registry the player's plan and every default plan
 * share. Each condition says which foes the slot may then aim at (null when it doesn't hold), and
 * whether it is worth offering in a kit at all, so the "When" list stays short: a hold to wait
 * for only for a kit that holds, clones out only for a kit that makes them, and for a kit of a
 * few techniques only the plainest three.
 */

/** "Below a third of my health." */
const LOW_HEALTH = 1 / 3;
/** "My chakra is low", "my breath is low": below a quarter. */
const LOW_POOL = 1 / 4;

type Foes = readonly PlanFighter[];

function nonEmpty(foes: Foes): Foes | null {
  return foes.length > 0 ? foes : null;
}

function announced(foe: PlanFighter, round: Round): Card | null {
  const id = round.intents[foe.id];
  return id === undefined ? null : findCard(foe, id);
}

function closing(foe: PlanFighter, round: Round): boolean {
  const card = announced(foe, round);
  return card?.kind === 'step' && card.direction === 'in';
}

interface Where {
  readonly self: PlanFighter;
  /** The slot's own card, for a condition about it. */
  readonly card: CardId | undefined;
  readonly round: Round;
  readonly foes: Foes;
  readonly seen: Foes;
}

const ifSo = (holds: boolean, seen: Foes): Foes | null => (holds ? seen : null);

const HOLDS: Readonly<Record<SlotCondition, (at: Where) => Foes | null>> = {
  'foe-dazed': ({ seen }) => nonEmpty(seen.filter((f) => isDazed(f) || f.sealed > 0)),
  'foe-readying': ({ seen, round }) =>
    nonEmpty(seen.filter((f) => announced(f, round)?.kind === 'jutsu')),
  'low-health': ({ self, seen }) => ifSo(self.health < self.maxHealth * LOW_HEALTH, seen),
  'low-chakra': ({ self, seen }) => ifSo(self.chakra < self.maxChakra * LOW_POOL, seen),
  'foe-hidden': ({ foes, seen }) =>
    ifSo(
      foes.some((f) => f.hidden),
      seen,
    ),
  'foe-held': ({ seen }) => nonEmpty(seen.filter(isPinned)),
  'foe-open': ({ seen }) => nonEmpty(seen.filter(isOpen)),
  'foe-closing': ({ seen, round }) => nonEmpty(seen.filter((f) => closing(f, round))),
  'foe-attacking': ({ seen, round }) => {
    const card = (f: PlanFighter) => announced(f, round);
    return nonEmpty(seen.filter((f) => isOffence(card(f) ?? { kind: 'gather' })));
  },
  'self-hidden': ({ self, seen }) => ifSo(self.hidden, seen),
  'bodies-out': ({ self, round, seen }) => ifSo(bodiesOut(self, round), seen),
  'ally-held': ({ self, round, seen }) =>
    ifSo(
      round.fighters.some(
        (f) => f.side === self.side && f.id !== self.id && alive(f) && isPinned(f),
      ),
      seen,
    ),
  'first-exchange': ({ round, seen }) => ifSo(round.opening === true, seen),
  fresh: ({ self, card, seen }) =>
    ifSo(card === undefined || runOfSlot(self, card) < FRESH_RUN, seen),
  'low-breath': ({ self, seen }) =>
    ifSo(self.breath !== undefined && self.breath < maxBreath(self.attributes) * LOW_POOL, seen),
};

/**
 * How many turns running a slot's card has played: for the strike that plays your style, the
 * body move it last became (`repertoire.ts`), since that is what a foe sees again.
 */
function runOfSlot(self: PlanFighter, card: CardId): number {
  if (card !== 'strike') return runOf(self, card);
  const last = self.streak?.card;
  const styled = self.techniques.some((t) => `jutsu:${t.id}` === last && isBodyMove(t));
  return styled || last === 'strike' ? (self.streak?.turns ?? 0) : 0;
}

function bodiesOut(self: PlanFighter, round: Round): boolean {
  if (clonesLeft(self) > 0 || (self.summonsOut ?? []).length > 0) return true;
  return round.fighters.some((f) => f.shadowOf === self.id && alive(f));
}

/**
 * The foes a slot may aim at when its condition holds, or null when it doesn't. A condition
 * about you leaves every foe in sight to aim at.
 */
export function whenHolds(
  self: PlanFighter,
  round: Round,
  slot: { readonly when?: SlotCondition; readonly card?: CardId },
): Foes | null {
  const foes = opponentsOf(round.fighters, self);
  const seen = foes.filter((f) => inSight(self, f));
  const { when, card } = slot;
  return when === undefined ? seen : HOLDS[when]({ self, round, foes, seen, card });
}

/** The kit a slot is set in: the fighter's own techniques, and whether a team fights too. */
export interface KitAt {
  readonly self: PlanFighter;
  readonly team: boolean;
}

const anyone = ({ self }: KitAt, verb: Parameters<typeof hasVerb>[1]) =>
  self.techniques.some((t) => hasVerb(t, verb));

/** Which conditions are worth offering in this kit; the first five always. */
const OFFERED: Readonly<Record<SlotCondition, (kit: KitAt) => boolean>> = {
  'foe-dazed': () => true,
  'foe-readying': () => true,
  'low-health': () => true,
  'low-chakra': () => true,
  'foe-hidden': () => true,
  'foe-held': (kit) => anyone(kit, 'pin'),
  'foe-open': (kit) => anyone(kit, 'pin') || anyone(kit, 'daze'),
  'foe-closing': () => true,
  'foe-attacking': () => true,
  'self-hidden': ({ self }) => self.techniques.some((t) => hasVerb(t, 'conceal')),
  'bodies-out': ({ self }) =>
    self.techniques.some((t) => hasVerb(t, 'clone') || hasVerb(t, 'summon')),
  'ally-held': ({ team }) => team,
  'first-exchange': () => true,
  'low-breath': () => true,
  fresh: ({ self }) => self.techniques.filter(isWounding).length > 1,
};

/** A kit this small sees only the plainest conditions: room to grow into the rest. */
export const FEW_TECHNIQUES = 3;
const PLAIN: readonly SlotCondition[] = ['foe-dazed', 'foe-readying', 'low-health'];

/** The conditions worth offering for a slot in this kit, plainest first. */
export function offeredConditions(all: readonly SlotCondition[], kit: KitAt): SlotCondition[] {
  if (kit.self.techniques.length <= FEW_TECHNIQUES) {
    // Even a small kit with two attacks may say when to change from one to the other.
    return all.filter((c) => PLAIN.includes(c) || (c === 'fresh' && OFFERED.fresh(kit)));
  }
  return all.filter((c) => OFFERED[c](kit));
}

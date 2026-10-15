import type { RangeBand } from '../../contract';
import { alive, chakraCost } from '../../rules/body';
import { homeBand } from '../../rules/kit';
import { RANGE_BANDS } from '../../rules/range';
import {
  areaSize,
  driveOf,
  effectsOf,
  isWounding,
  primaryEffect,
  techniquePower,
} from '../../rules/verbs';
import { holdOffChance, throwingAim } from '../../rules/zoning';
import { strike } from './arms';
import { cardId, findCard, fitsBand, kitCards, playable, type Card } from './cards';
import { isDazed } from './daze';
import type { HoldOff } from './footing';
import { useJutsu } from './jutsu';
import { heldOffLine, throughLine } from './sceneVoice';
import { inSight, opponentsOf, type Turn } from './senses';
import { fighterIn, patch, paying, say, type PlanFighter, type Round } from './state';
import { momentOf } from './voice';

/**
 * Holding a foe off in a planned fight (`rules/zoning.ts`). At mid and far range a fighter may
 * keep a kunai or a wounding technique ready; when someone steps in on them, the first who
 * hasn't acted yet this exchange fires it, spending their turn, and that contest takes the place of the step's own. If it stops
 * them, the step fails and the attack meets them as any attack would; if they slip through,
 * they close in. Either way the holder paid for it. A move technique (a body flicker) is never held off.
 */

export const NO_HOLD_OFF: HoldOff = { close: null, mid: null, far: null };

type JutsuCard = Extract<Card, { kind: 'jutsu' }>;

/** What can hold someone off at a distance: kunai, or a wounding technique that reaches. */
export function holdOffChoices(fighter: PlanFighter, band: RangeBand): Card[] {
  if (band === 'close') return [];
  return kitCards(fighter, band).filter(
    (c) => c.kind === 'throw' || (c.kind === 'jutsu' && isWounding(c.technique)),
  );
}

/** What this fighter holds off with at this distance, if anything. */
export function holdOffAt(fighter: PlanFighter, band: RangeBand): Card | null {
  const id = fighter.holdOff?.[band] ?? null;
  const card = id === null ? null : findCard(fighter, id);
  return card && fitsBand(card, band) && holdOffChoices(fighter, band).length > 0 ? card : null;
}

function strongest(cards: readonly Card[]): JutsuCard | undefined {
  return cards
    .flatMap((c) => (c.kind === 'jutsu' ? [c] : []))
    .sort((a, b) => techniquePower(b.technique) - techniquePower(a.technique))[0];
}

/**
 * A plan's default: someone who fights from range holds off with their strongest area, else
 * their strongest wounding technique there, else kunai; a close fighter holds off with nothing.
 */
export function defaultHoldOff(fighter: PlanFighter): HoldOff {
  if (homeBand(fighter) === 'close') return NO_HOLD_OFF;
  const pick = (band: RangeBand): string | null => {
    const choices = holdOffChoices(fighter, band);
    const areas = choices.filter(
      (c) => c.kind === 'jutsu' && effectsOf(c.technique, 'area').length > 0,
    );
    const best = strongest(areas) ?? strongest(choices) ?? choices[0];
    return best ? cardId(best) : null;
  };
  const [close = null, mid = null, far = null] = RANGE_BANDS.map(pick);
  return { close, mid, far };
}

/** The holder's aim with a card: their throwing, or their skill with the technique. */
function aimWith(holder: PlanFighter, card: Card): number {
  if (card.kind !== 'jutsu') return throwingAim(holder.attributes);
  return driveOf(holder, { technique: card.technique, effect: primaryEffect(card.technique) });
}

function areaOf(card: Card) {
  const [area] = card.kind === 'jutsu' ? effectsOf(card.technique, 'area') : [];
  return area ? areaSize(area) : undefined;
}

/** Someone on the other side ready to hold the closer off, and what with. */
function holderFor(round: Round, closer: PlanFighter): { holder: PlanFighter; card: Card } | null {
  for (const f of opponentsOf(round.fighters, closer)) {
    const card = holdOffAt(f, round.range);
    const ready = alive(f) && f.stunned === 0 && !isDazed(f) && !round.acted?.includes(f.id);
    if (card && ready && playable(f, card) && inSight(f, closer)) return { holder: f, card };
  }
  return null;
}

/** A held-off step: who holds the closer off, with what. */
interface Shot {
  readonly holder: PlanFighter;
  readonly closer: PlanFighter;
  readonly card: Card;
}

/** The holder's attack meeting the closer, as any attack would. */
function fire(round: Round, { holder, closer, card }: Shot, turn: Turn): Round {
  const shot = { actor: holder, target: closer, rng: turn.rng };
  return card.kind === 'jutsu' ? useJutsu(round, shot, card.technique) : strike(round, shot, true);
}

/** Paying for a shot the closer slipped through: chakra for a technique. */
function spent(round: Round, holder: PlanFighter, card: Card): Round {
  if (card.kind !== 'jutsu') return round;
  const cost = chakraCost(holder, card.technique);
  return { ...round, fighters: patch(round.fighters, holder.id, paying(holder, cost)) };
}

/** What a step in meets: nobody holding them off, held off, or slipped through. */
export interface HeldOff {
  readonly round: Round;
  readonly outcome: 'unopposed' | 'stopped' | 'through';
}

/** A step in on someone who may hold the closer off. */
export function holdOff(round: Round, turn: Turn): HeldOff {
  const closer = fighterIn(round, turn.actor.id) ?? turn.actor;
  const found = holderFor(round, closer);
  if (!found) return { round, outcome: 'unopposed' };
  const { holder, card } = found;
  // Holding someone off is the holder's turn this exchange.
  const marked = { ...round, acted: [...(round.acted ?? []), holder.id] };
  const chance = holdOffChance(aimWith(holder, card), closer.attributes.speed, areaOf(card));
  if (!turn.rng.chance(chance)) {
    return {
      round: say(
        spent(marked, holder, card),
        throughLine(momentOf(marked, closer.id), closer.name, holder.name),
      ),
      outcome: 'through',
    };
  }
  const told = say(marked, heldOffLine(momentOf(marked, holder.id), holder.name, closer.name));
  return {
    round: fire(told, { holder: fighterIn(told, holder.id) ?? holder, closer, card }, turn),
    outcome: 'stopped',
  };
}

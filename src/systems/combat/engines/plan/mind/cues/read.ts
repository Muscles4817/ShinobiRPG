import { findCard, type Card } from '../../cards';
import { distanceBetween } from '../../distance';
import { inSight } from '../../senses';
import { playerOf, type PlanFighter, type PlanState } from '../../state';
import { describe, describedLine, saysAnything } from './describe';
import { inferFrom, type Prediction, type Reading } from './infer';
import { observe, type Sighting } from './observe';
import { CLASS_WORDS, cueProfile } from './profile';

/**
 * Your read of what a foe is readying, from the cues it gives off (`docs/design/combat-ai-plan.md`
 * Part 5): shown beside today's telegraph, in shadow, until the owner chooses to let it take the
 * telegraph's place. Said in graded words, never a number: a name only when the evidence carries
 * one, an unfamiliar technique described by what was clearly seen, else the kind of move.
 */

const HEDGE = { sure: '', 'fairly sure': 'Likely ', maybe: 'Perhaps ' } as const;

function capitalised(text: string): string {
  return `${text.charAt(0).toUpperCase()}${text.slice(1)}`;
}

function nameOf(card: Card | null): string | null {
  if (card?.kind === 'jutsu') return card.technique.name;
  return card?.kind === 'item' ? card.item.name : null;
}

/** How often each card of theirs has been used, as habit. */
function habitsOf(actor: PlanFighter): Record<string, number> {
  return Object.fromEntries(Object.entries(actor.uses ?? {}).map(([id, n]) => [`jutsu:${id}`, n]));
}

function words(p: Prediction, actor: PlanFighter, described: string | null): string {
  const hedge = HEDGE[p.confidence];
  const named = p.named ? nameOf(findCard(actor, p.named)) : null;
  if (named) return `${capitalised(`${hedge}${named}`)}: ${p.confidence}.`;
  if (described) return described;
  return `${capitalised(`${hedge}${CLASS_WORDS[p.predicted]}`)}: ${p.confidence}.`;
}

/** Where and when a card is read, and by whom. */
export interface CardRead {
  readonly state: Pick<PlanState, 'range' | 'distances' | 'field' | 'round'>;
  readonly seen: PlanState['seen'];
  readonly at: readonly [number, number, number];
  readonly observer: PlanFighter;
  readonly actor: PlanFighter;
  readonly card: Card;
}

/** What one fighter makes of a card another is readying, from its cues alone. */
export function readCard(r: CardRead): { prediction: Prediction; sighting: Sighting } {
  const { observer, actor, state } = r;
  const reading: Reading = {
    observer,
    actor,
    seenCards: r.seen[actor.id] ?? [],
    habits: habitsOf(actor),
    moment: [...r.at],
    situation: {
      band: distanceBetween(state, observer.id, actor.id),
      exchange: state.round - 1,
      observerHidden: observer.hidden,
      illusionAbout: actor.confused > 0 || state.field !== undefined,
    },
  };
  const sighting = observe(reading, cueProfile(r.card, actor));
  return { prediction: inferFrom(reading, sighting), sighting };
}

/** Your read of what a foe is readying, or nothing when they can't be read at all. */
export function cueReadLine(state: PlanState, actor: PlanFighter): string | undefined {
  const observer = playerOf(state);
  const id = state.intents[actor.id];
  const card = id === undefined ? null : findCard(actor, id);
  if (!card || actor.stunned > 0 || !inSight(observer, actor)) return undefined;
  const moment = { seen: state.seen, at: [state.bout, state.round, state.exchange] as const };
  const { prediction, sighting } = readCard({ ...moment, state, observer, actor, card });
  const unfamiliar = prediction.predicted === 'technique' && sighting.form?.value === 'unfamiliar';
  const seen = describe(sighting);
  const described =
    unfamiliar && !prediction.named && saysAnything(seen)
      ? describedLine(seen, HEDGE[prediction.confidence])
      : null;
  return words(prediction, actor, described);
}

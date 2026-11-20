import { counterOdds, type CounterWaits } from '../../rules/counters';
import { approachOf, tagsOf } from '../../rules/tags';
import { bladeInHand } from '../../rules/blades';
import { DANGER_SHARE } from '../../rules/commitment';
import { strikeDamage } from '../../rules/damage';
import { threatOf } from './avoid';
import { findCard, isOffence, kitCards, playable, type Card } from './cards';
import { bandOf, distanceBetween } from './distance';
import { readsInTheMoment } from './judgement';
import { readCard } from './mind/cues/read';
import { inSight, opponentsOf } from './senses';
import type { Play } from './slots';
import type { PlanFighter, Round } from './state';

/**
 * A fighter who reads the fight slots a counter when it sees one coming (`docs/design/
 * defence-plan.md`, the counter system): from the cues of what a foe is readying, the same read the
 * player gets of a foe (`mind/cues/`), never the card itself. It waits only for what it is fairly
 * sure of, and only where its odds of a clean read are good; the player's plan stays theirs.
 */

/** The clean-read odds a mind wants before it gives its turn to waiting. */
export const COUNTER_READ_FROM = 0.5;
/** Exchanges after a counter that waited for nothing before it waits again. */
const IDLE_WARY = 2;

/** What a foe means to play next: what they announced, else their first slot here that plays. */
function readying(foe: PlanFighter, round: Round): Card | null {
  const announced = round.intents[foe.id];
  if (announced !== undefined) return findCard(foe, announced);
  const slots = foe.loadout[bandOf(round, foe)];
  for (const slot of slots) {
    const card = findCard(foe, slot.card);
    if (card && playable(foe, card)) return card;
  }
  return null;
}

/** The counter a read of this card calls for, if any. */
function waitsFor(
  foe: PlanFighter,
  read: { predicted: string; named?: string },
): CounterWaits | null {
  if (read.predicted === 'blow') return bladeInHand(foe) ? 'blade' : 'blow';
  if (read.predicted === 'throw') return 'thrown';
  if (read.predicted !== 'technique' || !read.named) return null;
  const named = findCard(foe, read.named);
  if (named?.kind !== 'jutsu') return null;
  if (tagsOf(named.technique).delivery.includes('eye-contact')) return 'eyes';
  const came = approachOf(named.technique);
  if (came === 'blow' || came === 'grab') return 'blow';
  return came === 'blade' || came === 'thrown' ? came : null;
}

function opensUser(foe: PlanFighter, named: string | undefined): boolean {
  const card = named ? findCard(foe, named) : null;
  return card?.kind === 'jutsu' && tagsOf(card.technique).execution.opensUser === true;
}

/**
 * Whether what is coming is worth a turn spent waiting: one that would take a good share of their
 * health, or take their turn or their footing from them (a daze, a hold). Kunai aren't.
 */
function worthWaiting(self: PlanFighter, foe: PlanFighter, named: string | undefined): boolean {
  const card = named ? findCard(foe, named) : null;
  if (card?.kind !== 'jutsu') {
    return strikeDamage(foe, self, 0.5) / Math.max(1, self.maxHealth) >= DANGER_SHARE;
  }
  const takes = card.technique.effects.some((e) => e.verb === 'daze' || e.verb === 'pin');
  return takes || threatOf(foe, self, card.technique) >= DANGER_SHARE;
}

/** A counter worth waiting with against this foe now, if any. */
function counterAgainst(self: PlanFighter, foe: PlanFighter, round: Round): Card | null {
  const card = readying(foe, round);
  if (!card || !isOffence(card)) return null;
  const at = [0, round.number, 0] as const;
  const state = {
    range: round.range,
    round: round.number,
    ...(round.distances ? { distances: round.distances } : {}),
    ...(round.field ? { field: round.field } : {}),
  };
  const { prediction } = readCard({
    state,
    seen: round.seen,
    at,
    observer: self,
    actor: foe,
    card,
  });
  // Only what it is sure of: the technique named, or a plain blow or throw read surely.
  if (!prediction.named && prediction.confidence !== 'sure') return null;
  const waits = waitsFor(foe, prediction);
  if (!waits) return null;
  const counter = kitCards(self, distanceBetween(round, self.id, foe.id)).find(
    (c) => c.kind === 'counter' && c.waits === waits,
  );
  if (!counter || !playable(self, counter)) return null;
  const skill = Math.max(foe.attributes.taijutsu, foe.attributes.ninjutsu, foe.attributes.kenjutsu);
  const opens = opensUser(foe, prediction.named);
  if (!opens && waits !== 'eyes' && !worthWaiting(self, foe, prediction.named)) return null;
  const odds = counterOdds({ defender: self, attacker: foe, skill, opens });
  return odds.clean >= COUNTER_READ_FROM ? counter : null;
}

/** Waiting to counter what is coming, for a mind that reads the fight and sees it. */
export function counterPlay(self: PlanFighter, round: Round): Play | null {
  if (!readsInTheMoment(self) || self.committed) return null;
  // A counter that waited for nothing lately makes it wary of waiting again so soon.
  if (self.waitedIdle !== undefined && round.number - self.waitedIdle <= IDLE_WARY) return null;
  for (const foe of opponentsOf(round.fighters, self)) {
    if (!inSight(self, foe)) continue;
    const counter = counterAgainst(self, foe, round);
    if (counter) return { card: counter, target: undefined };
  }
  return null;
}

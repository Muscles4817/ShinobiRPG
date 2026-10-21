import type { Discipline, Element } from '@/systems/techniques';

import type { CombatTechnique, RangeBand } from '../../contract';
import { chakraCost } from '../../rules/body';
import { matchup } from '../../rules/elements';
import { homeBand } from '../../rules/kit';
import { reactionLine } from '../../rules/narration';
import { RANGE_LABEL } from '../../rules/range';
import { hasVerb, isHarmful, isPinned, moveGoal, spins, substitutable } from '../../rules/verbs';
import type { Card } from './cards';
import { movedTo } from './groundPlay';
import { readyDefences } from './readiness';
import { swapLine } from './sceneVoice';
import { fighterIn, patch, paying, say, type PlanFighter, type Round } from './state';
import { momentOf } from './voice';
import { tell } from '../../rules/telling';

/**
 * Move and substitute in a planned fight. A move is footwork no one contests: its user is
 * simply at the distance it takes them to. A substitution is a defence card: slotted, it
 * reacts on its own, swapping its owner out of the first physical or ninjutsu hit in a round
 * that would land (after a Dodge has had its chance), as long as they have the chakra for it.
 * Once a round, not once an exchange: one foe strikes about once an exchange, so more would
 * make its owner untouchable for as long as their chakra lasts. A substitution with an element
 * is a wall (Water Wall): against an attack its element overpowers it swallows the hit and still
 * stands, ready again; against one that overpowers it, it breaks and the hit comes through.
 * A spin (Palm Rotation, `spins`) turns aside every hit it meets, paid in chakra each time, and
 * is never spent: only its owner's chakra, and illusions, get past it.
 */

/** Between rounds, every substitution is ready again. */
export function substitutionsReady(fighters: readonly PlanFighter[]): PlanFighter[] {
  return fighters.map(({ substituteSpent: _spent, ...f }) => f);
}

type JutsuCard = Extract<Card, { kind: 'jutsu' }>;

/** Where a move technique would take this fighter, or null when it isn't one. */
export function moveDestination(fighter: PlanFighter, t: CombatTechnique): RangeBand | null {
  return moveGoal(t, homeBand(fighter));
}

const FLICKER_IN = '{a} {a.is} suddenly right in close.';
const FLICKER = '{a} blink{a.s} out and reappear{a.s} at {where} range.';

export function move(round: Round, actor: PlanFighter, t: CombatTechnique): Round {
  if (isPinned(actor)) return say(round, tell('{a} strain{a.s} against the hold.', { a: actor }));
  const to = moveDestination(actor, t) ?? round.range;
  const where = RANGE_LABEL[to].toLowerCase();
  // An entry carries its user in to strike; a body flicker simply puts them there.
  const told = isHarmful(t)
    ? tell('{a} cross{a.es} the distance in a blink.', { a: actor })
    : tell(to === 'close' ? FLICKER_IN : FLICKER, { a: actor, where });
  return movedTo(round, to, told);
}

const SPUN = '{t} spin{t.s} in place and turn{t.s} {a.poss} {what} aside.';

/**
 * A spin ready where the fight stands turns a hold, a seal or a drain aside too (a coffin of
 * sand, a Gentle Fist's touch), paid in chakra: the round it is turned in, or null.
 */
export function spunAway(round: Round, touch: Swap): Round | null {
  const target = fighterIn(round, touch.target.id) ?? touch.target;
  const card = substitution(readyDefences(target, round));
  if (!card || !spins(card.technique) || !substitutable(touch.discipline)) return null;
  const cost = chakraCost(target, card.technique);
  if (target.chakra < cost) return null;
  const turned = { ...round, fighters: patch(round.fighters, target.id, paying(target, cost)) };
  const line = tell(SPUN, { t: target, a: touch.attacker, what: touch.what });
  return say(turned, reactionLine(line, 'swapped'));
}

/** A substitution among the defences ready to react. */
function substitution(ready: readonly Card[]): JutsuCard | undefined {
  return ready.find(
    (c): c is JutsuCard => c.kind === 'jutsu' && hasVerb(c.technique, 'substitute'),
  );
}

/** What is about to land on whom. */
export interface Swap {
  readonly target: PlanFighter;
  readonly attacker: PlanFighter;
  /** What hits, for the narration. */
  readonly what: string;
  /** The art behind it; none for a plain blow or kunai. */
  readonly discipline: Discipline | undefined;
  /** The attack's element, which an elemental wall meets. */
  readonly element?: Element;
}

/** What a substitution made of a hit: escaped it, or (a broken wall) let it through. */
export interface Swapped {
  readonly round: Round;
  readonly escaped: boolean;
}

/**
 * Swaps the target out of a hit that would land, when a substitution is ready, unspent this
 * round, affordable and the hit isn't an illusion; else null, and the hit lands. An elemental
 * wall meets the attack's element: it holds without being spent when it overpowers it, and
 * breaks, spent, letting the hit through when it is overpowered.
 */
export function substituted(round: Round, ready: readonly Card[], swap: Swap): Swapped | null {
  const { attacker } = swap;
  const target = fighterIn(round, swap.target.id) ?? swap.target;
  const card = substitution(ready);
  const spinning = card !== undefined && spins(card.technique);
  if (!card || (target.substituteSpent === true && !spinning) || !substitutable(swap.discipline)) {
    return null;
  }
  const cost = chakraCost(target, card.technique);
  if (target.chakra < cost) return null;
  if (spinning) {
    const turned = { ...round, fighters: patch(round.fighters, target.id, paying(target, cost)) };
    const line = tell(SPUN, { t: target, a: attacker, what: swap.what });
    return { round: say(turned, reactionLine(line, 'swapped')), escaped: true };
  }
  const wall = matchup(card.technique.element, swap.element);
  const fighters = patch(round.fighters, target.id, {
    ...paying(target, cost),
    ...(wall === 'strong' ? {} : { substituteSpent: true }),
  });
  const paid = { ...round, fighters };
  const name = card.technique.name;
  const swapped = { a: attacker, what: swap.what };
  if (wall === 'weak') {
    return {
      round: say(paid, tell('{a.poss} {what} smashes through {wall}.', { ...swapped, wall: name })),
      escaped: false,
    };
  }
  const line =
    wall === 'strong'
      ? tell('{wall} swallows {a.poss} {what} and still stands.', { ...swapped, wall: name })
      : swapLine(momentOf(paid, target.id), { target, attacker, what: swap.what, jutsu: name });
  return { round: say(paid, reactionLine(line, 'swapped')), escaped: true };
}

import type { CombatSetup, RangeBand } from '../../contract';
import { stepBack, stepIn } from '../../rules/range';
import { causeLine } from '../../rules/causes';
import { isPinned } from '../../rules/verbs';
import { tell } from '../../rules/telling';
import { isFootwork, type Card } from './cards';
import { bandOf, facing, withMoves } from './distance';
import { moveDestination } from './footwork';
import { movesFor } from './pairMoves';
import { isEntry } from './stepping';
import { fighterIn, say, type PlanFighter, type Round } from './state';

/**
 * The teleport, a rule on trial (`CombatExperiments.teleport`; the owner's decision in
 * `docs/design/combat-ai-plan.md` Part 13b): a fighter with the `teleport` perk (the Flying
 * Thunder God) changes distance without spending the turn, once a round. Whatever footwork their
 * turn would have played (a step, a technique that only moves them, or an entry's way in) is a
 * blink instead: sure,
 * through any hold-off, no one keeping pace, straight to the distance they fight at if they keep
 * one. Then they choose their turn again from where they now stand.
 */

const BLINK_LINES: Record<RangeBand, string> = {
  close: '{a} vanish{a.es} and {a.is} beside {b.them}.',
  mid: '{a} vanish{a.es} and {a.is} a few strides from {b.them}.',
  far: '{a} vanish{a.es} and {a.is} across the field from {b.them}.',
};

/** Who blinks in a fight that tries the teleport. */
export function withTeleports(
  fighters: readonly PlanFighter[],
  setup: Pick<CombatSetup, 'experiments'>,
): PlanFighter[] {
  if (!setup.experiments?.teleport) return [...fighters];
  return fighters.map((f) => (f.perks.includes('teleport') ? { ...f, teleports: true } : f));
}

/** As a round opens, everyone's teleport is ready again. */
export function blinksReady(fighters: readonly PlanFighter[], opening: boolean): PlanFighter[] {
  if (!opening || !fighters.some((f) => f.blinked)) return [...fighters];
  return fighters.map((f) => {
    if (!f.blinked) return f;
    const { blinked: _spent, ...ready } = f;
    return ready;
  });
}

/** Where the footwork a turn chose would take its fighter, or null when it isn't footwork. */
function goalOf(actor: PlanFighter, card: Card, at: RangeBand): RangeBand | null {
  // An entry's way in is footwork too: they blink in, then strike from there.
  if (card.kind === 'jutsu' && isEntry(actor, card, at)) {
    return moveDestination(actor, card.technique);
  }
  if (!isFootwork(card)) return null;
  if (actor.keepAt && actor.keepAt !== at) return actor.keepAt;
  if (card.kind === 'step') return card.direction === 'in' ? stepIn(at) : stepBack(at);
  return card.kind === 'jutsu' ? moveDestination(actor, card.technique) : null;
}

/**
 * The round after a blink in place of the footwork chosen, or null when there is none: not a
 * teleporter, already blinked this round, held, or the card isn't footwork that goes anywhere.
 */
export function blinkInstead(round: Round, actor: PlanFighter, card: Card): Round | null {
  if (!actor.teleports || actor.blinked || isPinned(actor)) return null;
  const foe = facing(round, actor);
  if (!foe) return null;
  const at = bandOf(round, actor);
  const to = goalOf(actor, card, at);
  if (to === null || to === at) return null;
  const moved: Round = {
    ...round,
    fighters: round.fighters.map((f) =>
      f.id === actor.id ? { ...f, blinked: true as const, movedAt: round.number } : f,
    ),
    distances: withMoves(round, movesFor(round, actor, foe, to)),
  };
  return say(moved, causeLine(tell(BLINK_LINES[to], { a: actor, b: foe }), 'teleport'));
}

/** The fighter as they stand after a blink. */
export function afterBlink(round: Round, actor: PlanFighter): PlanFighter {
  return fighterIn(round, actor.id) ?? actor;
}

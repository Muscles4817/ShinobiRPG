import { rushedIn } from './closeQuarters';
import { springTraps } from './traps';
import { payFor } from './effort';

import type { RangeBand } from '../../contract';
import { RANGE_BANDS, stepBack, stepIn } from '../../rules/range';
import { withinGround } from '../../rules/ground';
import { isPinned } from '../../rules/verbs';
import type { Card } from './cards';
import type { Turn } from './senses';
import { isEntry } from './stepping';
import { alive } from '../../rules/body';
import { fighterIn, patch, say, type PlanFighter, type Round } from './state';
import { holdOff } from './zoning';
import { blockedStepLine, chargeLine, momentOf, stepLine } from './voice';
import { tell } from '../../rules/telling';
import { bandOf, distanceBetween, sameSpacing, withMoves } from './distance';
import { movesFor } from './pairMoves';
import { causeLine } from '../../rules/causes';
import { stepCause } from './causes';
import { stepChance } from './stepContest';

/**
 * A step: the fighter tries for the next distance in or out, contested by the foe's speed. A
 * step costs the turn, and while on the move they can't set a Guard or a Counter (`movedAt`, read in
 * `react.ts`). Stepping in on someone who holds foes off is their contest instead (`zoning.ts`).
 */

/** A step that can go no further (in at close, back at far) is told as staying put. */
const NO_FURTHER: Readonly<Record<RangeBand, string>> = {
  close: '{a} press{a.es} in, but there is no closer to get.',
  mid: '{a} hold{a.s} at mid range.',
  far: '{a} keep{a.s} well back, as far off as the ground allows.',
};

/** How far the stepper stands from the foe they step on (else from the foe they face). */
function from(round: Round, { actor, target }: Pick<Turn, 'actor' | 'target'>): RangeBand {
  return target ? distanceBetween(round, actor.id, target.id) : bandOf(round, actor);
}

function arrive(
  round: Round,
  { actor, target }: Turn,
  to: RangeBand,
  keptUp: readonly string[] = [],
): Round {
  const closing = RANGE_BANDS.indexOf(to) < RANGE_BANDS.indexOf(from(round, { actor, target }));
  const told = { actor, to, closing, ...(target ? { foe: target } : {}) };
  // Only the pairs the step concerns move (`pairMoves.ts`); the ground was asked by the stride.
  const moves = movesFor(round, actor, target, to).filter((m) => !keptUp.includes(m.b));
  const stepped: Round = {
    ...say(round, stepLine(momentOf(round, actor.id), told)),
    distances: withMoves(round, moves),
  };
  return keptUp.reduce((r, id) => {
    const foe = fighterIn(r, id);
    return foe ? say(r, causeLine(tell(KEPT_UP, { a: actor, b: foe }), 'kept-pace')) : r;
  }, stepped);
}

const KEPT_UP = '{b} keep{b.s} pace with {a.them}.';

/**
 * Drawing back from more than one foe up close, each of the others gets a chance to keep pace
 * (the same contest as the step): one step never shakes off a whole gang.
 */
function keepingPace(round: Round, { actor, target, rng }: Turn, to: RangeBand): string[] {
  const near = movesFor(round, actor, target, to).filter((m) => m.b !== target?.id);
  return near
    .map((m) => fighterIn(round, m.b))
    .filter(
      (f): f is PlanFighter => f !== undefined && !rng.chance(stepChance(round, actor, f, 'back')),
    )
    .map((f) => f.id);
}

/** The step's own contest, when nobody holds the fighter off. */
function stride(round: Round, turn: Turn, direction: 'in' | 'back'): Round {
  const { actor, target: foe, rng } = turn;
  const at = from(round, { actor, target: foe });
  const to = direction === 'in' ? stepIn(at) : stepBack(at);
  if (withinGround(round.ground, to) !== to) {
    const line = '{a} back{a.s} away, but there’s a wall behind {a.them}.';
    return say(round, causeLine(tell(line, { a: actor }), 'no-room'));
  }
  // The roll is made even with no foe to stop them (a sure step), as it always was.
  const made = rng.chance(foe ? stepChance(round, actor, foe, direction) : 1);
  if (!foe) return arrive(round, turn, to);
  if (!made) {
    const blocked = blockedStepLine(momentOf(round, actor.id), actor, to, foe);
    return say(round, causeLine(blocked, stepCause(actor, foe)));
  }
  return arrive(round, turn, to, direction === 'back' ? keepingPace(round, turn, to) : []);
}

export function step(round: Round, turn: Turn, direction: 'in' | 'back'): Round {
  const { actor } = turn;
  if (isPinned(actor)) {
    return say(round, causeLine(tell('{a} strain{a.s} against the hold.', { a: actor }), 'held'));
  }
  const at = from(round, turn);
  const to = direction === 'in' ? stepIn(at) : stepBack(at);
  if (to === at) return say(round, tell(NO_FURTHER[to], { a: actor }));
  const moving = {
    ...round,
    fighters: patch(round.fighters, actor.id, { movedAt: round.number }),
  };
  if (direction === 'back') return stride(moving, turn, direction);
  return steppedIn(round, moving, turn);
}

function steppedIn(round: Round, moving: Round, turn: Turn): Round {
  const met = holdOff(moving, turn);
  switch (met.outcome) {
    case 'stopped':
      return met.round;
    case 'through': {
      // A closer who took a light hit on the way comes in as they now stand.
      const actor = fighterIn(met.round, turn.actor.id) ?? turn.actor;
      return arrive(met.round, { ...turn, actor }, stepIn(from(round, turn)));
    }
    case 'unopposed':
      return stride(met.round, turn, 'in');
  }
}

/** A guarded technique brings its user in braced, with no breath spent on it. */
function guardedFor(round: Round, { actor }: Turn, card: Card): Round {
  if (card.kind !== 'jutsu' || !card.technique.guarded) return round;
  return { ...round, fighters: patch(round.fighters, actor.id, { committed: 'brace' }) };
}

/** Whether the charger is still on their feet after whatever met them. */
function stillUp(round: Round, { actor }: Turn): boolean {
  const now = fighterIn(round, actor.id);
  return now !== undefined && alive(now);
}

/** A charge met: what became of the round, whether it was stopped, and lines told after it. */
export interface Charged {
  readonly round: Round;
  readonly stopped: boolean;
  /** Getting through a hold-off, told once the charge itself has been. */
  readonly after: readonly string[];
}

/**
 * A charge: an entry played from further off meets a hold-off as a step does. Stopped, the
 * technique is lost (`round` is what became of it); otherwise it goes on to land.
 */
export function charge(start: Round, turn: Turn, card: Card): Charged {
  const round = guardedFor(start, turn, card);
  if (!isEntry(turn.actor, card, from(round, turn)) || isPinned(turn.actor)) {
    return { round, stopped: false, after: [] };
  }
  const met = holdOff(round, turn);
  // A guarded entry takes the shot through its guard and rolls on (`TechniqueDef.guarded`).
  const rollsOn = card.kind === 'jutsu' && card.technique.guarded && stillUp(met.round, turn);
  if (met.outcome !== 'stopped' || card.kind !== 'jutsu' || rollsOn) {
    const after = met.round.lines.slice(round.lines.length);
    return { round: { ...met.round, lines: round.lines }, stopped: false, after };
  }
  // Stopped, the charge is told before the fire that met it, and its chakra is spent.
  const { actor } = turn;
  const told = chargeLine(momentOf(round, actor.id), actor, card.technique.name);
  const lines = [...round.lines, told, ...met.round.lines.slice(round.lines.length)];
  const paid = payFor(fighterIn(met.round, actor.id) ?? actor, card.technique);
  const fighters = patch(met.round.fighters, actor.id, paid);
  return { round: { ...met.round, lines, fighters }, stopped: true, after: [] };
}

/** A step that moved the fight springs any foe's trap waiting where it now stands. */
export function afterStep(before: Round, after: Round, turn: Turn, card: Card): Round {
  if (sameSpacing(before, after)) return after;
  const sprung = springTraps(after, turn.actor.id, turn.rng, true);
  // A rusher who got in strikes as they land, once any trap there has sprung (`closeQuarters.ts`).
  return card.kind === 'step' && card.direction === 'in' ? rushedIn(before, sprung, turn) : sprung;
}

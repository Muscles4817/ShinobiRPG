import { numberWord, ordinalWord } from '@/core';

import type { CombatResult } from '../../contract';
import { alive } from '../../rules/body';
import { tell } from '../../rules/telling';
import { splitNarration } from '../../rules/narration';
import { playerOf, type PlanFighter, type PlanState } from './state';

/**
 * A fight in a sentence or two, for its result card: how long it lasted, and then its turning
 * point when it had one (a daze or a smashed guard shortly before the one who decided it went
 * down, or the first of several to fall), else who went down and who was left standing. Read
 * from how the fight ended and what fighters remember of it (`fellAt`, `dazedBy`,
 * `guardBrokenBy`), never from its dice, and in words: story text carries no numbers.
 */

/** Exchanges in a round, to say which round someone fell in (`engine.ts` plays four). */
const EXCHANGES_PER_ROUND = 4;
/** A daze or a smashed guard this many exchanges or fewer before a fall is what swung it. */
const SWING_WINDOW = 3;

function roundsWords(rounds: number): string {
  return rounds <= 1 ? 'a single round' : `${numberWord(rounds)} rounds`;
}

const OPENINGS: Readonly<Record<CombatResult, string>> = {
  victory: '{a} won in {rounds}.',
  defeat: '{a} lasted {rounds} before going down.',
  escaped: '{a} got away after {rounds}.',
};

/** In the order they went down. */
function fallen(fighters: readonly PlanFighter[]): PlanFighter[] {
  return fighters
    .filter((f) => !alive(f))
    .sort((a, b) => (a.fellAt ?? Infinity) - (b.fellAt ?? Infinity));
}

/** Which round of the fight an exchange fell in. */
function roundOf(exchange: number): number {
  return Math.floor((exchange - 1) / EXCHANGES_PER_ROUND) + 1;
}

/** Who on the other side went down, and how: the turning points of a won fight. */
function foesFell(foes: readonly PlanFighter[]): string | null {
  const down = fallen(foes);
  const [first] = down;
  const last = down.at(-1);
  if (!first || !last) return null;
  if (down.length === 1) {
    const when = first.fellAt ? ` in the ${ordinalWord(roundOf(first.fellAt))} round` : '';
    return tell(`{t} went down${when}.`, { t: first });
  }
  return tell('{l} was the last of them to go down.', { l: last });
}

/** Who on the other side was still on their feet when it ended. */
function stillStanding(foes: readonly PlanFighter[]): string | null {
  const standing = foes.filter(alive);
  return standing.length > 0 ? tell('{s} {s.was} still standing.', { s: standing }) : null;
}

/** Teammates who went down along the way. */
function alliesDown(fighters: readonly PlanFighter[]): string | null {
  const down = fallen(fighters.filter((f) => f.side === 'player' && !f.isPlayer));
  return down.length > 0 ? tell('{d} went down along the way.', { d: down }) : null;
}

const SWUNG: Readonly<Record<'dazed' | 'broken', string>> = {
  dazed: '{b} dazed {t} in the {when} round, and {t.they} never found {t.their} feet again.',
  broken: '{b} smashed through {t.poss} guard in the {when} round, and it was over soon after.',
};

/** What swung the fall of the one who decided it: a daze or a smashed guard just before. */
function swungBy(fighters: readonly PlanFighter[], decider: PlanFighter): string | null {
  const fell = decider.fellAt;
  if (fell === undefined) return null;
  const swings = [
    { kind: 'dazed' as const, swing: decider.dazedBy },
    { kind: 'broken' as const, swing: decider.guardBrokenBy },
  ].filter(({ swing }) => swing !== undefined && fell - swing.at <= SWING_WINDOW);
  const latest = swings.sort((x, y) => (y.swing?.at ?? 0) - (x.swing?.at ?? 0))[0];
  const by = latest && fighters.find((f) => f.id === latest.swing?.by);
  if (!latest?.swing || !by || by.side === decider.side) return null;
  const when = ordinalWord(roundOf(latest.swing.at));
  return tell(SWUNG[latest.kind], { b: by, t: decider, when });
}

/** The first of several to go down, when the rest of their side didn't last long after. */
function firstToFall(down: readonly PlanFighter[], foes: boolean): string | null {
  const [first, ...rest] = down;
  const last = down.at(-1)?.fellAt;
  // Within one round, everyone went down together; there was no turn to speak of.
  if (!first?.fellAt || !last || roundOf(first.fellAt) >= roundOf(last)) return null;
  const when = ordinalWord(roundOf(first.fellAt));
  const restTold = rest.length === 1 ? '{r} didn’t last long' : 'the rest didn’t last long';
  const line = foes
    ? `Once {f} went down in the {when} round, ${restTold}.`
    : 'Once {f} went down in the {when} round, it turned against {a}.';
  return tell(line, { f: first, r: rest, when, a: rest.at(-1) ?? first });
}

/** The fight's turning point, when it had one. */
function turningPoint(state: PlanState, result: CombatResult): string | null {
  const player = playerOf(state);
  if (result === 'escaped') return null;
  const won = result === 'victory';
  const losers = fallen(state.fighters.filter((f) => f.side === (won ? 'enemy' : 'player')));
  const decider = won ? losers.at(-1) : player;
  if (!decider) return null;
  // The player falls last on their side's list only if they did; allies after them don't count.
  const before = won ? losers : losers.filter((f) => (f.fellAt ?? 0) < (player.fellAt ?? 0));
  return swungBy(state.fighters, decider) ?? firstToFall(won ? losers : [...before, player], won);
}

/** The fight as its result card tells it. */
export function fightSummary(state: PlanState, result: CombatResult): string {
  const foes = state.fighters.filter((f) => f.side === 'enemy');
  const opening = tell(OPENINGS[result], { a: playerOf(state), rounds: roundsWords(state.bout) });
  const turning = turningPoint(state, result);
  const sentences = turning
    ? [opening, turning]
    : [
        opening,
        result === 'victory' ? foesFell(foes) : stillStanding(foes),
        alliesDown(state.fighters),
      ];
  return sentences.flatMap((s) => (s === null ? [] : [splitNarration(s).text])).join(' ');
}

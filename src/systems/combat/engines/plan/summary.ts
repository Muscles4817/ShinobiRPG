import { numberWord, ordinalWord } from '@/core';

import type { CombatResult } from '../../contract';
import { alive } from '../../rules/body';
import { tell } from '../../rules/telling';
import { splitNarration } from '../../rules/narration';
import { playerOf, type PlanFighter, type PlanState } from './state';

/**
 * A fight in a sentence or two, for its result card: how long it lasted, who went down and in
 * what order, and who was left standing. Read from how the fight ended, never from its dice,
 * and in words: story text carries no numbers.
 */

/** Exchanges in a round, to say which round someone fell in (`engine.ts` plays four). */
const EXCHANGES_PER_ROUND = 4;

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

/** The fight as its result card tells it. */
export function fightSummary(state: PlanState, result: CombatResult): string {
  const foes = state.fighters.filter((f) => f.side === 'enemy');
  const sentences = [
    tell(OPENINGS[result], { a: playerOf(state), rounds: roundsWords(state.bout) }),
    result === 'victory' ? foesFell(foes) : stillStanding(foes),
    alliesDown(state.fighters),
  ];
  return sentences.flatMap((s) => (s === null ? [] : [splitNarration(s).text])).join(' ');
}

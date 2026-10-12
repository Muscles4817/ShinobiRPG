import type { CombatOpening, RangeBand } from '../../contract';
import { RANGE_LABEL } from '../../rules/range';
import { FIELD_RULES, raiseField, type ActiveField } from '../../rules/verbs';
import type { PlanFighter } from './state';

/**
 * How a planned fight begins when what came before shaped it (`CombatSetup.opening`): the
 * starting distance, who starts hidden, who reels through the first exchange (dazed and open,
 * as if struck), which side acts first in it (see `resolveExchange`), and a field already over
 * the ground, lasting from the first exchange as if raised in it.
 */

const HEAD_ON_RANGE: RangeBand = 'mid';
/** The first exchange's number (`PlanState.round` when the fight starts). */
const FIRST_EXCHANGE = 1;

export interface OpenedFight {
  readonly fighters: PlanFighter[];
  readonly range: RangeBand;
  /** What the opening looks like, for the fight log. */
  readonly lines: string[];
  readonly field?: ActiveField;
}

function opened(f: PlanFighter, opening: CombatOpening): PlanFighter {
  const hidden = opening.hidden?.includes(f.id) ?? false;
  const dazed = opening.dazed?.includes(f.id) ?? false;
  return {
    ...f,
    hidden: f.hidden || hidden,
    ...(dazed ? { stunned: 1, openUntil: FIRST_EXCHANGE } : {}),
  };
}

function linesFor(fighters: readonly PlanFighter[], opening: CombatOpening): string[] {
  const named = (ids: readonly string[] | undefined) => fighters.filter((f) => ids?.includes(f.id));
  const lines: string[] = [];
  if (opening.range) lines.push(`It starts at ${RANGE_LABEL[opening.range].toLowerCase()} range.`);
  if (opening.firstMover === 'player') lines.push('Your side moves first.');
  if (opening.firstMover === 'enemy') lines.push('They move first!');
  lines.push(...named(opening.dazed).map((f) => `${f.name} is caught off balance!`));
  lines.push(
    ...named(opening.hidden).map((f) =>
      f.isPlayer ? 'You start out of sight.' : `${f.name} is out of sight.`,
    ),
  );
  if (opening.field) lines.push(FIELD_RULES[opening.field.id].rises);
  return lines;
}

export function openFight(
  fighters: readonly PlanFighter[],
  opening: CombatOpening | undefined,
): OpenedFight {
  if (!opening) return { fighters: [...fighters], range: HEAD_ON_RANGE, lines: [] };
  return {
    fighters: fighters.map((f) => opened(f, opening)),
    range: opening.range ?? HEAD_ON_RANGE,
    lines: linesFor(fighters, opening),
    ...(opening.field ? { field: raiseField(opening.field, FIRST_EXCHANGE) } : {}),
  };
}

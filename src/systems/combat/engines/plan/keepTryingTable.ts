import type { CombatOption, RangeBand } from '../../contract';
import { RANGE_LABEL } from '../../rules/range';
import { hasVerb } from '../../rules/verbs';
import { findCard } from './cards';
import { suggestedKeepTrying } from './keepTrying';
import { KEEP_TRYING, type KeepTrying } from './keepTryingShape';
import type { PlanFighter } from './state';

/**
 * The plan screen's choice of how hard to keep trying to get where you fight (`keepTrying.ts`),
 * shown beside "Fight at" once there is somewhere to get to: the suggestion marked with why,
 * and the way-is-clear choice warning when nothing in the plan ever clears the way.
 */

const TRY_PREFIX = 'try:';
export const TRY_SETTING = 'Keep trying';

const TRY_LABEL: Readonly<Record<KeepTrying, string>> = {
  always: 'Every exchange',
  clear: 'Only when the way is clear',
  odds: 'When the odds are fair',
};

const TRY_DETAIL: Readonly<Record<KeepTrying, string>> = {
  always: 'Every turn goes on getting there until you do',
  clear: 'Only when every foe facing you is dazed or held',
  odds: 'Only while getting there is at least an even chance',
};

/** Whether anything in the plan ever dazes or holds a foe. */
function clearsTheWay(fighter: PlanFighter): boolean {
  return Object.values(fighter.loadout).some((slots) =>
    slots.some((slot) => {
      const card = findCard(fighter, slot.card);
      return (
        card?.kind === 'jutsu' &&
        (hasVerb(card.technique, 'daze') || hasVerb(card.technique, 'pin'))
      );
    }),
  );
}

function detailOf(fighter: PlanFighter, way: KeepTrying): string {
  const suggested = suggestedKeepTrying(fighter);
  if (way === 'clear' && !clearsTheWay(fighter)) {
    return `${TRY_DETAIL.clear}. Nothing in your plan dazes or holds them: you might never go`;
  }
  return suggested.way === way
    ? `${TRY_DETAIL[way]}. Suggested: ${suggested.why}`
    : TRY_DETAIL[way];
}

/** The choices beside "Fight at", once it names a distance. */
export function keepTryingOptions(fighter: PlanFighter, band: RangeBand): CombatOption[] {
  if (fighter.keepAt === undefined) return [];
  const current = fighter.keepTrying ?? suggestedKeepTrying(fighter).way;
  return KEEP_TRYING.map((way) => ({
    id: `${TRY_PREFIX}${band}:${way}`,
    label: TRY_LABEL[way],
    detail: detailOf(fighter, way),
    kind: 'plan',
    group: RANGE_LABEL[band],
    setting: TRY_SETTING,
    selected: current === way,
  }));
}

function isWay(value: string): value is KeepTrying {
  return KEEP_TRYING.some((w) => w === value);
}

/** The fighter with this choice made, or null when the option isn't one. */
export function withKeepTrying(fighter: PlanFighter, optionId: string): PlanFighter | null {
  if (!optionId.startsWith(TRY_PREFIX)) return null;
  const way = optionId.slice(optionId.lastIndexOf(':') + 1);
  return isWay(way) ? { ...fighter, keepTrying: way } : null;
}

import { defaultLoadout, defaultReadiness } from './defaults';
import type { PlanFighter, Round } from './state';

/**
 * A summon called this exchange gets its plan as the exchange ends, against the fighters then on
 * the field, before its first turn (it was called with none, `summons.ts`).
 */

function unplanned(f: PlanFighter): boolean {
  const { close, mid, far } = f.loadout;
  return f.summoner !== undefined && close.length + mid.length + far.length === 0;
}

export function plannedSummons(round: Round): Round {
  if (!round.fighters.some(unplanned)) return round;
  const fighters = round.fighters.map((f) =>
    unplanned(f) ? { ...f, loadout: defaultLoadout(f, round.fighters), ...defaultReadiness(f) } : f,
  );
  return { ...round, fighters };
}

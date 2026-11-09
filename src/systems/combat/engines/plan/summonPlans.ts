import { defaultLoadout, defaultReadiness } from './defaults';
import { stanceLoadout, stanceReadiness } from './team';
import type { PlanFighter, Round } from './state';

/**
 * A summon called (or a shadow clone made) this exchange gets its plan as the exchange ends, against the fighters then on
 * the field, before its first turn (it was called with none, `summons.ts`). A mount covers the
 * one who called it (`team.ts`): a Guard up, and in the way of what is aimed at them.
 */

function planned(f: PlanFighter, fighters: readonly PlanFighter[]): PlanFighter {
  if (f.mount && f.summoner) {
    const stance = { kind: 'cover', covers: f.summoner } as const;
    return {
      ...f,
      stance,
      loadout: stanceLoadout(f, stance, fighters),
      ...stanceReadiness(f, stance),
    };
  }
  return { ...f, loadout: defaultLoadout(f, fighters), ...defaultReadiness(f) };
}

function unplanned(f: PlanFighter): boolean {
  const { close, mid, far } = f.loadout;
  const called = f.summoner !== undefined || f.shadowOf !== undefined;
  return called && close.length + mid.length + far.length === 0;
}

export function plannedSummons(round: Round): Round {
  if (!round.fighters.some(unplanned)) return round;
  const fighters = round.fighters.map((f) => (unplanned(f) ? planned(f, round.fighters) : f));
  return { ...round, fighters };
}

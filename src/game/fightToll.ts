import type { Rng } from '@/core';
import type { CombatOutcome, CombatView } from '@/systems/combat';
import { EXHAUSTED_REFILL, isDrained } from '@/systems/injuries';
import { maxChakra } from '@/systems/vitals';

import type { GameContext } from './context';
import { applyFightCosts } from './fightCosts';
import type { Report } from './reports';
import type { GameState } from './state';
import { exhaust, inflict, rollInjury } from './wounds';
import { chakraBody } from './hives/hive';

/**
 * What a finished fight leaves on your body, once its result has been applied: a real defeat
 * (not a spar) leaves a named injury, worse the more the foes had left; trump cards are paid
 * for; and ending a fight nearly out of chakra leaves you exhausted tonight.
 */

const DEFEAT_STORY = 'The medics patched you up, but this one will take time to mend.';
const DRAINED_STORY = 'You fought down to your last drop of chakra. It will be slow to return.';
/** Ending a fight drained costs this many poor nights. */
const DRAINED_NIGHTS = 1;

export interface FightEnd {
  readonly outcome: CombatOutcome;
  /** The fight as it ended, to read how much the foes had left. */
  readonly view: CombatView;
  /** A spar: nobody is really hurt. */
  readonly sparring: boolean;
}

/** How badly you lost: the share of the foes' health still standing, 0–1. */
export function beatingOf(view: CombatView): number {
  const foes = view.combatants.filter((c) => c.side === 'enemy');
  const max = foes.reduce((sum, c) => sum + c.maxHealth, 0);
  const left = foes.reduce((sum, c) => sum + Math.max(0, c.health), 0);
  return max > 0 ? left / max : 1;
}

/** Names the injury on the defeat card the fight just left. */
function onDefeatCard(reports: readonly Report[], injury: string): readonly Report[] {
  const last = reports.at(-1);
  if (last?.kind !== 'defeat') return reports;
  return [...reports.slice(0, -1), { ...last, injury }];
}

function defeatInjury(state: GameState, end: FightEnd, ctx: GameContext, rng: Rng): GameState {
  if (end.sparring || end.outcome.result !== 'defeat') return state;
  const def = rollInjury(ctx, 'defeat', beatingOf(end.view), rng);
  if (!def) return state;
  const hurt = inflict(state, { def }, { text: DEFEAT_STORY });
  return { ...hurt, reports: onDefeatCard(hurt.reports, def.name) };
}

function drainedExhaustion(state: GameState, outcome: CombatOutcome): GameState {
  const max = maxChakra(chakraBody(state));
  if (!isDrained(outcome.player.chakra, max)) return state;
  const spell = { nights: DRAINED_NIGHTS, refill: EXHAUSTED_REFILL };
  return exhaust(state, spell, { text: DRAINED_STORY });
}

/** Applies a finished fight's toll on the body. */
export function applyFightToll(
  state: GameState,
  end: FightEnd,
  ctx: GameContext,
  rng: Rng,
): GameState {
  const injured = defeatInjury(state, end, ctx, rng);
  return drainedExhaustion(applyFightCosts(injured, end.outcome, ctx, rng), end.outcome);
}

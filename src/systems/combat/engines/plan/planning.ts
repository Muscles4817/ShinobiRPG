import { withoutLoneCombos } from './combo';
import { defaultLoadout, defaultReadiness } from './defaults';
import { foeStances } from './foeTeam';
import { rememberedPlan, type PlanMemory } from './memory';
import { defaultReactions } from './readiness';
import type { PlanFighter } from './state';
import { withStances } from './team';

/**
 * Everyone's plan as a fight starts: your remembered plan (or the default for your kit),
 * teammates by their stance, foes by their default plan, or by stances when they fight as a
 * team; and the plan handed back for next time.
 */

/** Your remembered plan, or the default one: actions, defences and where to fight. */
function planFor(f: PlanFighter, fighters: readonly PlanFighter[], plan: unknown): PlanFighter {
  const remembered = f.isPlayer ? rememberedPlan(plan, f) : null;
  if (remembered) return { ...f, ...remembered };
  const loadout = defaultLoadout(withoutLoneCombos(f, fighters), fighters);
  return { ...f, loadout, ...defaultReadiness(f) };
}

/** Every fighter with their plan for the fight's first round. */
export function plannedFighters(fighters: readonly PlanFighter[], plan: unknown): PlanFighter[] {
  return withStances(foeStances(fighters.map((f) => planFor(f, fighters, plan))));
}

/** The plan to hand back for next time. */
export function planOf(player: PlanFighter): PlanMemory {
  return {
    loadout: player.loadout,
    reactions: player.reactions ?? defaultReactions(player),
    ...(player.keepAt === undefined ? {} : { keepAt: player.keepAt }),
  };
}

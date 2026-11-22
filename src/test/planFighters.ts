import { withHealth } from '@/systems/combat/engines/plan/health';
import type { PlanFighter } from '@/systems/combat/engines/plan/state';

/**
 * Setting up a planned fight's fighters in tests. Health has one writer in the engine
 * (`plan/health.ts`); a test that starts someone hurt sets it the same way.
 */
export function atHealth(
  fighters: readonly PlanFighter[],
  id: string,
  health: number,
): PlanFighter[] {
  return fighters.map((f) => (f.id === id ? withHealth(f, health) : f));
}

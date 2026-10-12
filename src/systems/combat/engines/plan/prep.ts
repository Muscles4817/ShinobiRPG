import type { CombatTechnique, RangeBand } from '../../contract';
import { alive } from '../../rules/body';
import { canAttackFrom } from '../../rules/kit';
import { RANGE_LABEL } from '../../rules/range';
import { clonesLeft, hasVerb } from '../../rules/verbs';
import type { Card } from './cards';
import type { PlanFighter } from './state';

/**
 * Getting ready: empower, clone and trap, the techniques a fighter uses on themselves before
 * the blows land. None is worth using twice over: not while an empower holds, while clones
 * still stand, or while a trap of theirs waits. Foes and allies reach for them on instinct (an
 * empower or clones when there is a foe to fight, a trap to open a round); the player's plan
 * passes over them when they're not needed. The fight screen shows what is in force.
 */

/** What a fighter weighs when reaching for one (the instinct's `Moment`). */
interface Moment {
  readonly band: RangeBand;
  readonly foe: PlanFighter | undefined;
  readonly opening?: boolean;
}

/**
 * Whether a technique would add anything now: no second empower, clones or trap, and no
 * empower or clones with no foe in sight to spend them on.
 */
export function prepNeeded(self: PlanFighter, t: CombatTechnique, foeInSight: boolean): boolean {
  const boosts = hasVerb(t, 'empower') || hasVerb(t, 'clone');
  if (boosts && !foeInSight) return false;
  if (hasVerb(t, 'empower') && self.empowered) return false;
  if (hasVerb(t, 'clone') && clonesLeft(self) > 0) return false;
  return !(hasVerb(t, 'trap') && self.trap);
}

function wants(self: PlanFighter, t: CombatTechnique, moment: Moment): boolean {
  if (!prepNeeded(self, t, moment.foe !== undefined)) return false;
  if (hasVerb(t, 'empower') || hasVerb(t, 'clone')) return canAttackFrom(self, moment.band);
  return hasVerb(t, 'trap') && (moment.opening ?? false);
}

/** A slotted empower, clone or trap the moment calls for. */
export function prepInstinct(
  self: PlanFighter,
  ready: readonly Card[],
  moment: Moment,
): Card | undefined {
  return ready.find((c) => c.kind === 'jutsu' && wants(self, c.technique, moment));
}

/** What the fight screen shows of it: empowered, how many clones, where a trap waits. */
export function prepStatuses(f: PlanFighter): string[] {
  if (!alive(f)) return [];
  const clones = clonesLeft(f);
  return [
    ...(f.empowered ? ['Empowered'] : []),
    ...(clones > 0 ? [`Clones ×${clones}`] : []),
    ...(f.trap ? [`Trap at ${RANGE_LABEL[f.trap.band].toLowerCase()} range`] : []),
  ];
}

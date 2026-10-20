import type { CombatTechnique, RangeBand } from '../../contract';
import { alive } from '../../rules/body';
import { canAttackFrom } from '../../rules/kit';
import { RANGE_LABEL } from '../../rules/range';
import { lastDitch, outmatched } from '../../rules/trumps';
import { canOpen, clonesLeft, hasVerb, opensOf, worthOpening } from '../../rules/verbs';
import { stepStatus } from './ladderWords';
import { SHROUD_STATUS } from './shrouds';
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
  readonly fighters?: readonly PlanFighter[];
}

/** Who a fighter is getting ready against: whether any is in sight, and all of them. */
export interface Facing {
  readonly foeInSight: boolean;
  readonly foes: readonly PlanFighter[];
}

/**
 * An empower worth using now: none in force, or a ladder's next step within reach, and a deep
 * step only when the fight calls for it (`worthOpening`).
 */
function empowerNeeded(self: PlanFighter, t: CombatTechnique, foes: readonly PlanFighter[]) {
  const opens = opensOf(t);
  if (!opens) return !self.empowered;
  if (!canOpen(self, t)) return false;
  const why = {
    outmatched: outmatched(self, foes),
    hurt: self.health < self.maxHealth / 2,
    lastDitch: lastDitch(self),
  };
  return worthOpening(opens.step, why);
}

/**
 * Whether a technique would add anything now: no second empower (but a ladder's next step), clones or trap, and no
 * empower or clones with no foe in sight to spend them on.
 */
export function prepNeeded(self: PlanFighter, t: CombatTechnique, facing: Facing): boolean {
  const boosts = hasVerb(t, 'empower') || hasVerb(t, 'clone') || hasVerb(t, 'shroud');
  if (boosts && !facing.foeInSight) return false;
  if (hasVerb(t, 'shroud') && self.shroud) return false;
  if (hasVerb(t, 'empower') && !empowerNeeded(self, t, facing.foes)) return false;
  if (hasVerb(t, 'clone') && clonesLeft(self) > 0) return false;
  return !(hasVerb(t, 'trap') && self.trap);
}

function wants(self: PlanFighter, t: CombatTechnique, moment: Moment): boolean {
  const foes = (moment.fighters ?? []).filter((f) => f.side !== self.side && alive(f));
  if (!prepNeeded(self, t, { foeInSight: moment.foe !== undefined, foes })) return false;
  // Ready where they can attack, or before a charge to where they can.
  const charging = self.keepAt !== undefined && self.keepAt !== moment.band;
  if (hasVerb(t, 'shroud')) return true;
  if (hasVerb(t, 'empower') || hasVerb(t, 'clone')) {
    return canAttackFrom(self, moment.band) || charging;
  }
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
    ...(f.empowered ? [f.empowered.opened ? stepStatus(f.empowered.opened) : 'Empowered'] : []),
    ...(f.shroud ? [SHROUD_STATUS[f.shroud.kind]] : []),
    ...(clones > 0 ? [`Clones ×${clones}`] : []),
    ...(f.trap ? [`Trap at ${RANGE_LABEL[f.trap.band].toLowerCase()} range`] : []),
  ];
}

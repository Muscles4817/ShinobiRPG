import { foldStory, type CombatEvent, type CombatState } from '@/systems/combat';
import { decode, type PlanState } from '@/systems/combat/engines/plan/state';
import { lastStanding, statusesOf } from '@/systems/combat/engines/plan/storyLevel';
import { poolsNow } from '@/systems/combat/engines/plan/toldPools';

/**
 * The fight's story checked against the fight (`docs/design/event-stream-plan.md`), after every
 * act the benches already play, so it costs a fold per act and no fights of its own:
 *
 * - shown equals told (every few exchanges, and as the fight ends): folding the story gives
 *   exactly the engine's state, everyone's health,
 *   pools and statuses and who is on the field;
 * - nothing hurts untold: within each exchange, every change of health is followed by a line
 *   that tells it, so the watch screen never moves a bar after the story has moved on, and each
 *   was recorded by the writer that made it, never only found by the levelling;
 * - the fight ends on its closing line: nothing moves after it.
 *
 * The levelling (`plan/storyLevel.ts`) says whatever the fold lacks, so the first check alone
 * mostly checks the levelling; the others hold the writers to account.
 *
 * A broken invariant throws, naming the fight's first difference.
 */

/** How many exchanges apart the whole standing is checked (always as the fight ends). */
const STANDING_EVERY = 3;

function fail(what: string, detail: unknown): never {
  throw new Error(`Story invariant broken: ${what}\n${JSON.stringify(detail, null, 1)}`);
}

/** The fight as the engine holds it, in the fold's terms. */
function actual(plan: PlanState) {
  return {
    pools: poolsNow(plan.fighters),
    statuses: statusesOf(plan),
    present: plan.fighters.map((f) => f.id),
  };
}

/** A value as plain text, its keys in order, so two that say the same compare equal. */
function said(value: unknown): string {
  if (typeof value !== 'object' || value === null) return JSON.stringify(value);
  return JSON.stringify(Object.entries(value).sort(([a], [b]) => a.localeCompare(b)));
}

function sameStanding(plan: PlanState): void {
  // From where everyone was last stood in full: the stretch the screen folds from.
  const told = foldStory(plan.story.slice(lastStanding(plan.story)));
  const fight = actual(plan);
  for (const f of plan.fighters) {
    const pools = told.pools[f.id];
    const statuses = told.statuses[f.id];
    if (said(pools) !== said(fight.pools[f.id]))
      fail(`pools of ${f.id}`, { told: pools, fight: fight.pools[f.id] });
    if (JSON.stringify(statuses) !== JSON.stringify(fight.statuses[f.id]))
      fail(`statuses of ${f.id}`, { told: statuses, fight: fight.statuses[f.id] });
  }
  if ([...told.present].sort().join() !== [...fight.present].sort().join())
    fail('who is on the field', { told: told.present, fight: fight.present });
}

/** Each exchange's events, from one full standing (its opening) to the next. */
function exchanges(events: readonly CombatEvent[]): CombatEvent[][] {
  const runs: CombatEvent[][] = [[]];
  events.forEach((e, i) => {
    const opens = e.kind === 'stand' && events[i - 1]?.kind !== 'stand';
    if (opens) runs.push([]);
    runs.at(-1)?.push(e);
  });
  return runs;
}

function healthTold(events: readonly CombatEvent[]): void {
  for (const run of exchanges(events)) {
    const lastLine = run.map((e) => e.kind).lastIndexOf('told');
    const untold = run.findIndex((e, i) => i > lastLine && e.kind === 'health');
    if (lastLine >= 0 && untold >= 0) fail('health moved after the last line', run.slice(lastLine));
  }
}

/**
 * Every health change is recorded by the writer that made it (`plan/health.ts`), with why and by
 * whom: one only the levelling found (`settled`) is a change made out of the writer's sight.
 */
function healthRecorded(events: readonly CombatEvent[]): void {
  const unseen = events.find((e) => e.kind === 'health' && e.cause === 'settled');
  if (unseen) fail('health changed out of its writer’s sight', unseen);
}

/** As the fight ends, the closing line is told last: nothing moves after it. */
function closedLast(plan: PlanState): void {
  const last = plan.story.map((e) => e.kind).lastIndexOf('told');
  const after = plan.story.slice(last + 1);
  if (plan.result !== null && after.length > 0) fail('changes after the closing line', after);
}

/** Checks a planned fight's story after an act; `before` is the state the act was played from. */
export function checkStory(state: CombatState, before?: CombatState): void {
  const plan = decode(state);
  // The whole standing every few exchanges and as the fight ends, to keep the benches quick.
  if (plan.result !== null || plan.round % STANDING_EVERY === 0) sameStanding(plan);
  const from = before ? decode(before) : null;
  const start = from ? (from.storyDropped ?? 0) + from.story.length : 0;
  const offset = plan.storyDropped ?? 0;
  const fresh = plan.story.slice(Math.max(0, start - offset));
  healthTold(fresh);
  healthRecorded(fresh);
  closedLast(plan);
}

import type { CombatEvent } from '../../storyContract';
import { foldStory, type StoryStanding } from '../../storyFold';
import type { PlanState } from './state';
import { statusesShown } from './statusView';
import { poolsMoved, poolsNow } from './toldPools';

/**
 * Bringing the story level with the fight (`docs/design/event-stream-plan.md`): as an exchange
 * ends and as an act hands back, whatever the story hasn't said yet (breath coming back, a daze
 * wearing off, a summons sent home between turns, a new mark) is said as events, so folding the
 * story gives exactly the fight as it stands. What is folded is the story from where everyone was
 * last stood in full (an exchange's opening), so this reads a stretch, never the whole fight.
 */

type Standing = Pick<PlanState, 'fighters' | 'field' | 'mark' | 'foeMark'>;

/** Everyone's statuses, by id, as the screen shows them. */
export function statusesOf(round: Standing): Record<string, string[]> {
  return Object.fromEntries(round.fighters.map((f) => [f.id, statusesShown(round, f)]));
}

/** Where the last full standing (an exchange's opening, or the fight's) begins in a story. */
export function lastStanding(story: readonly CombatEvent[]): number {
  let at = story.length;
  while (at > 0 && story[at - 1]?.kind !== 'stand') at -= 1;
  while (at > 0 && story[at - 1]?.kind === 'stand') at -= 1;
  return at;
}

function sameList(a: readonly string[] | undefined, b: readonly string[]): boolean {
  return a?.join(';') === b.join(';');
}

/** The events that take a folded story to the fight as it stands. */
function levelling(told: StoryStanding, fight: Standing): CombatEvent[] {
  const pools = poolsNow(fight.fighters);
  const statuses = statusesOf(fight);
  const events: CombatEvent[] = [];
  for (const f of fight.fighters) {
    const now = pools[f.id] ?? {};
    const shown = statuses[f.id] ?? [];
    const was = told.pools[f.id];
    if (!told.present.includes(f.id) || !was) {
      events.push({ kind: 'join', who: f.id, pools: now, statuses: shown });
      continue;
    }
    events.push(...poolsMoved(f.id, was, now));
    if (!sameList(told.statuses[f.id], shown))
      events.push({ kind: 'status', who: f.id, statuses: shown });
  }
  const here = new Set(fight.fighters.map((f) => f.id));
  for (const who of told.present) if (!here.has(who)) events.push({ kind: 'leave', who });
  return events;
}

/** The story, with what it hasn't said of the fight as it stands said at its end. */
export function levelled(story: readonly CombatEvent[], fight: Standing): readonly CombatEvent[] {
  const said = levelling(foldStory(story.slice(lastStanding(story))), fight);
  return said.length === 0 ? story : [...story, ...said];
}

/** Where everyone stands, said in full: the opening of a stretch the screen can fold from. */
export function standingNow(fight: Standing): CombatEvent[] {
  const pools = poolsNow(fight.fighters);
  const statuses = statusesOf(fight);
  return fight.fighters.map((f) => ({
    kind: 'stand',
    who: f.id,
    pools: pools[f.id] ?? {},
    statuses: statuses[f.id] ?? [],
  }));
}

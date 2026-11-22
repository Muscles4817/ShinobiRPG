import {
  foldEvent,
  foldStory,
  type CombatView,
  type NarrationForce,
  type RangeBand,
  type StoryPools,
  type StoryStanding,
  type ToldEvent,
} from '@/systems/combat';
import type { JournalChip } from '@/systems/journal';

import { shownLine } from './combatLog';

/**
 * The watch screen's beats: the fight's story from a point on, one beat per line, each saying who
 * acted, on whom, where the fight stood, and everyone's health, pools and statuses once it had
 * played. It is a fold (`foldStory`): the events before the point say where everyone stood, and
 * each line's beat is everything that has happened up to it, in the order the engine recorded it.
 * So what is shown is exactly what has been told, and the last beat is the fight as it stands.
 */

export interface FightBeat {
  /** A divider ("Second exchange") or a line of the fight. */
  readonly kind: 'divider' | 'line';
  readonly text: string;
  readonly chips: readonly JournalChip[];
  readonly actorId: string | null;
  readonly targetId: string | null;
  readonly range: RangeBand | null;
  /** How big the turn the beat belongs to was (who threw it, how wide, what element). */
  readonly force: NarrationForce | null;
  /** Every fighter's health once this beat has played, by combatant id. */
  readonly health: Readonly<Record<string, number>>;
  /** Fighters' health and pools once this beat has played, by id. */
  readonly pools: Readonly<Record<string, StoryPools>>;
  /** Fighters' statuses once this beat has played, by id. */
  readonly statuses: Readonly<Record<string, readonly string[]>>;
  /** Who is on the field once this beat has played, in the order they came onto it. */
  readonly present: readonly string[];
}

/** Health as the story has said it, by fighter. */
function healthOf(pools: StoryStanding['pools']): Record<string, number> {
  return Object.fromEntries(
    Object.entries(pools).flatMap(([id, p]) => (p.health === undefined ? [] : [[id, p.health]])),
  );
}

/** Where the story has reached: its place after the last event, counting events let go. */
export function storyEnd(view: Pick<CombatView, 'story' | 'storyOffset'>): number {
  return (view.storyOffset ?? 0) + view.story.length;
}

/** Whom a line is aimed at: the first fighter it names, other than whose turn it was. */
export function lineTarget(told: ToldEvent): string | null {
  return told.named?.find((id) => id !== told.actor) ?? null;
}

function beatOf(told: ToldEvent, standing: StoryStanding, range: RangeBand | null): FightBeat {
  const shown = shownLine(told);
  return {
    kind: shown.kind === 'round' ? 'divider' : 'line',
    text: shown.text,
    chips: shown.kind === 'story' ? shown.chips : [],
    actorId: told.actor ?? null,
    targetId: lineTarget(told),
    range,
    force: told.force ?? null,
    health: healthOf(standing.pools),
    pools: standing.pools,
    statuses: standing.statuses,
    present: standing.present,
  };
}

/** The beats of the fight from story event `from` on (a place as `storyEnd` counts them). */
export function fightReplay(view: CombatView, from: number): FightBeat[] {
  const start = Math.max(0, from - (view.storyOffset ?? 0));
  const ahead = view.story.slice(start);
  let standing = foldStory(view.story.slice(0, start));
  // Until a line says where the fight stands, it stands where the first such line says.
  const said = ahead.find((e): e is ToldEvent => e.kind === 'told' && e.range !== undefined);
  let range = said?.range ?? view.range ?? null;
  const beats: FightBeat[] = [];
  for (const event of ahead) {
    standing = foldEvent(standing, event);
    if (event.kind !== 'told') continue;
    range = event.range ?? range;
    beats.push(beatOf(event, standing, range));
  }
  return beats;
}

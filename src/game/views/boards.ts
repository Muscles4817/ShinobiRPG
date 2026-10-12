import type { MissionDef } from '@/systems/missions';
import { fightingPower } from '@/systems/stats';

import { INTEL_FEE } from '../actions/intel';
import { availability } from '../board';
import type { GameContext } from '../context';
import { combatStats } from '../gear';
import { placeHere } from '../ops';
import { enemyStats, scout, traitNotes, type Threat, type TraitNote } from '../scouting';
import type { GameState } from '../state';
import { choice, type Choice } from './common';

/** One kind of foe on a job, from the client's report. */
export interface Foe {
  readonly name: string;
  readonly count: number;
  readonly traits: readonly TraitNote[];
}

export interface Notice extends Choice {
  readonly id: string;
  readonly title: string;
  readonly client: string;
  readonly summary: string;
  readonly rank: string;
  readonly ryo: number;
  readonly reputation: number;
  readonly slots: number;
  readonly energyCost: number;
  readonly fightLikely: boolean;
  /** How the toughest opponent on the job compares with you, if there's a fight. */
  readonly opposition: {
    readonly threat: Threat;
    readonly label: string;
    /** Who you'll face and how they fight; null until you've bought the client's report. */
    readonly foes: readonly Foe[] | null;
    /** Buying the report, while you don't have it. */
    readonly intel: (Choice & { readonly fee: number }) | null;
  } | null;
  /** Your teammates come along. */
  readonly withTeam: boolean;
  /** "Standing job" or how long the posting stays up, e.g. "Gone after tomorrow". */
  readonly posted: string;
  readonly standing: boolean;
}

export interface MissionBoardView {
  readonly name: string;
  readonly completed: number;
  readonly notices: readonly Notice[];
}

function foesOf(ctx: GameContext, enemyIds: readonly string[]): Foe[] {
  const counts = new Map<string, number>();
  enemyIds.forEach((id) => counts.set(id, (counts.get(id) ?? 0) + 1));
  return [...counts].flatMap(([id, count]) => {
    const def = ctx.content.enemies.get(id);
    return def ? [{ name: def.name, count, traits: traitNotes(def.traits ?? []) }] : [];
  });
}

/** The toughest enemy a job can throw at you, read against you, and (with the report) who. */
function oppositionOf(
  state: GameState,
  ctx: GameContext,
  mission: MissionDef,
): Notice['opposition'] {
  const enemies = mission.stages.flatMap((s) => (s.kind === 'combat' ? s.enemyIds : []));
  const stats = enemies.flatMap((id) => enemyStats(ctx, id) ?? []);
  const toughest = stats.sort((a, b) => fightingPower(b) - fightingPower(a))[0];
  if (!toughest) return null;
  const read = scout(toughest, combatStats(state, ctx), false);
  const many = enemies.length > 1 ? ` (${enemies.length} foes)` : '';
  const known = state.board.intel.includes(mission.id);
  return {
    threat: read.threat,
    label: `${read.threatLabel}${many}`,
    foes: known ? foesOf(ctx, enemies) : null,
    intel: known
      ? null
      : { ...choice(state, ctx, { type: 'buyIntel', missionId: mission.id }), fee: INTEL_FEE },
  };
}

/** How long a posting stays up, in words. */
function postedFor(daysLeft: number): string {
  if (daysLeft <= 1) return 'Last day';
  if (daysLeft === 2) return 'Gone after tomorrow';
  return `Up for ${daysLeft} days`;
}

export function missionBoardView(state: GameState, ctx: GameContext): MissionBoardView | null {
  const place = placeHere(state, ctx, 'missions');
  if (!place) return null;
  const completed = state.standing.missionsCompleted;
  return {
    name: place.name,
    completed,
    notices: place.missionIds.flatMap((id) => {
      const m = ctx.content.missions.require(id);
      const on = availability(state, ctx, m);
      if (on.kind === 'absent') return [];
      return {
        ...choice(state, ctx, { type: 'startMission', missionId: id }),
        id,
        title: m.title,
        client: m.client,
        summary: m.summary,
        rank: m.rank,
        ryo: m.reward.ryo,
        reputation: m.reward.reputation,
        slots: m.slots,
        energyCost: m.energyCost,
        fightLikely: m.stages.some((s) => s.kind === 'combat'),
        opposition: oppositionOf(state, ctx, m),
        withTeam: m.withTeam ?? false,
        standing: on.kind === 'standing',
        posted: on.kind === 'standing' ? 'Standing job' : postedFor(on.daysLeft),
      };
    }),
  };
}

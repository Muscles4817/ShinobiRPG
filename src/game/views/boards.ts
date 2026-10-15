import { stageFoes, type MissionDef } from '@/systems/missions';

import { INTEL_FEE } from '../actions/intel';
import { awayFor, examClash } from '../awayNotes';
import { availability, crewFor, type Availability } from '../board';
import { asksForYou } from '../clients';
import type { GameContext } from '../context';
import { placeHere } from '../ops';
import { missionThreat, traitNotes, type Threat, type TraitNote } from '../scouting';
import { senseiPick } from '../sensei/pick';
import { mentorOf } from '../sensei/plan';
import type { GameState } from '../state';
import { arcsView, type ArcView } from './arcs';
import { choice, type Choice } from './common';
import { crewWords, type CrewWords } from './crewWords';

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
    /** Why the read is worse than usual (hunger, injuries), or null. */
    readonly handicap: string | null;
    /** Who you'll face and how they fight; null until you've bought the client's report. */
    readonly foes: readonly Foe[] | null;
    /** Buying the report, while you don't have it. */
    readonly intel: (Choice & { readonly fee: number }) | null;
  } | null;
  /** How long it keeps you away ("3 days away"), or null for a job done within a day. */
  readonly away: string | null;
  /** An exam it would make you miss, or null. */
  readonly examClash: string | null;
  /** A client you've worked for before, who asks for you by name. */
  readonly returning: boolean;
  /** Who the village sends with you; null when you go alone. */
  readonly crew: CrewWords | null;
  /** "Gōran’s pick": the job your sensei chose for the team this week, or null. */
  readonly picked: string | null;
  /** "Standing job" or how long the posting stays up, e.g. "Gone after tomorrow". */
  readonly posted: string;
  readonly standing: boolean;
}

export interface MissionBoardView {
  readonly name: string;
  readonly completed: number;
  /** Long stories under way, pinned above the notices. */
  readonly arcs: readonly ArcView[];
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
  const enemies = mission.stages.flatMap(stageFoes);
  const read = missionThreat(state, ctx, mission);
  if (!read) return null;
  const many = enemies.length > 1 ? ` (${enemies.length} foes)` : '';
  const known = state.board.intel.includes(mission.id);
  return {
    threat: read.threat,
    label: `${read.threatLabel}${many}`,
    handicap: read.handicap,
    foes: known ? foesOf(ctx, enemies) : null,
    intel: known
      ? null
      : { ...choice(state, ctx, { type: 'buyIntel', missionId: mission.id }), fee: INTEL_FEE },
  };
}

function crewOf(state: GameState, ctx: GameContext, def: MissionDef): CrewWords | null {
  const crew = crewFor(state, ctx, def);
  return crew ? crewWords(state, ctx, crew) : null;
}

function postedLine(on: Exclude<Availability, { kind: 'absent' }>): string {
  switch (on.kind) {
    case 'standing':
      return 'Standing job';
    case 'arc':
      return `Part of ${on.arc}`;
    case 'posted':
      return postedFor(on.daysLeft);
  }
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
  const pick = senseiPick(state, ctx)?.id;
  const sensei = mentorOf(state, ctx);
  return {
    name: place.name,
    completed,
    arcs: arcsView(state, ctx),
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
        fightLikely: m.stages.some((s) => stageFoes(s).length > 0),
        opposition: oppositionOf(state, ctx, m),
        crew: crewOf(state, ctx, m),
        picked: sensei && pick === id ? `${sensei.name}’s pick for the team` : null,
        returning: asksForYou(state, m),
        away: awayFor(m),
        examClash: examClash(state, ctx, m)?.text ?? null,
        standing: on.kind === 'standing',
        posted: postedLine(on),
      };
    }),
  };
}

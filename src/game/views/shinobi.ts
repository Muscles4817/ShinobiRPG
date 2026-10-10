import { round1 } from '@/core';
import { GRADE_INFO, type Appearance, type Grade, type Pronouns } from '@/systems/profile';
import { RANK_LABELS } from '@/systems/standing';
import {
  fightingPower,
  STAT_IDS,
  STAT_INFO,
  statTier,
  type StatGroup,
  type TierRead,
} from '@/systems/stats';
import { DISCIPLINES, type Discipline } from '@/systems/techniques';
import { formatDate } from '@/systems/time';

import type { GameContext } from '../context';
import type { GameState } from '../state';

export type { StatGrade, TierRead } from '@/systems/stats';

export interface StatLine {
  readonly label: string;
  readonly value: number;
  /** Growth since graduation. */
  readonly growth: number;
  /** What the value means: grade, rank, and how close the next grade is. */
  readonly tier: TierRead;
}

export interface ShinobiView {
  readonly name: string;
  readonly familyName: string;
  readonly pronouns: Pronouns;
  readonly appearance: Appearance;
  readonly rank: string;
  readonly village: string;
  readonly clan: string;
  readonly kekkeiGenkai: { readonly name: string; readonly dormant: boolean } | null;
  readonly nature: string;
  readonly traits: readonly string[];
  readonly talent: string | null;
  readonly nindo: string | null;
  readonly grades: readonly {
    readonly discipline: Discipline;
    readonly label: string;
    readonly grade: Grade;
    /** The academy's word for the grade ("Outstanding"), so it isn't read as a stat grade. */
    readonly mark: string;
  }[];
  readonly registryNo: string;
  readonly issued: string;
  readonly missionsCompleted: number;
  readonly missionsFailed: number;
  readonly reputation: number;
  readonly groups: readonly { readonly group: StatGroup; readonly stats: readonly StatLine[] }[];
  /** Your all-round fighting level and what the next step up takes. */
  readonly overall: TierRead & { readonly power: number };
}

/** A stable registry number derived from the name, so it never changes between visits. */
function registryNumber(name: string): string {
  let hash = 0;
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) % 9000;
  return String(1000 + hash);
}

export function shinobiView(state: GameState, ctx: GameContext): ShinobiView {
  const { character } = state;
  const { content } = ctx;
  const { stats, startingStats } = character;
  const clan = content.clans.get(character.clanId);
  const groups: StatGroup[] = ['discipline', 'body', 'mind'];
  return {
    name: character.name,
    familyName: character.familyName,
    pronouns: character.pronouns,
    appearance: character.appearance,
    rank: RANK_LABELS[state.standing.rank],
    village: content.locations.require(content.startLocationId).name,
    clan: clan?.name ?? 'No clan',
    kekkeiGenkai: clan?.kekkeiGenkai
      ? { name: clan.kekkeiGenkai.name, dormant: clan.kekkeiGenkai.dormant }
      : null,
    nature: character.nature.charAt(0).toUpperCase() + character.nature.slice(1),
    traits: character.traitIds.map((id) => content.traits.get(id)?.name ?? id),
    talent: character.talentId ? (content.talents.get(character.talentId)?.name ?? null) : null,
    nindo: character.nindoId ? (content.nindos.get(character.nindoId)?.name ?? null) : null,
    grades: DISCIPLINES.map((d) => ({
      discipline: d,
      label: STAT_INFO[d].label,
      grade: character.grades[d],
      mark: GRADE_INFO[character.grades[d]].label,
    })),
    registryNo: registryNumber(character.name),
    issued: formatDate({ day: 1, slot: 0 }),
    missionsCompleted: state.standing.missionsCompleted,
    missionsFailed: state.standing.missionsFailed,
    reputation: state.standing.reputation,
    groups: groups.map((group) => ({
      group,
      stats: STAT_IDS.filter((id) => STAT_INFO[id].group === group).map((id) => ({
        label: STAT_INFO[id].label,
        value: stats[id],
        growth: round1(stats[id] - startingStats[id]),
        tier: statTier(stats[id]),
      })),
    })),
    overall: { ...statTier(fightingPower(stats)), power: round1(fightingPower(stats)) },
  };
}

import { listed, round1 } from '@/core';
import {
  GRADE_INFO,
  STANDING_INFO,
  lookOf,
  type Grade,
  type Look,
  type Pronouns,
} from '@/systems/profile';
import { RANK_LABELS } from '@/systems/standing';
import {
  aptitudeBand,
  fightingPower,
  limitRead,
  STAT_KIND,
  STAT_IDS,
  STAT_INFO,
  statTier,
  statTierOf,
  type AptitudeRead,
  type StatGroup,
  type StatId,
  type TierRead,
} from '@/systems/stats';
import { DISCIPLINES, type Discipline } from '@/systems/techniques';
import { formatDate } from '@/systems/time';

import type { GameContext } from '../context';
import { homeVillageId } from '../homeVillage';
import type { GameState } from '../state';
import { naturalLimits } from '../profile';
import { conditionView, type ConditionView } from './condition';
import { weaponsKnown } from './gearWords';

export type { StatGrade, TierRead } from '@/systems/stats';

export interface StatLine {
  readonly label: string;
  readonly value: number;
  /** Growth since graduation. */
  readonly growth: number;
  /** What the value means: grade, rank, and how close the next grade is. */
  readonly tier: TierRead;
  /** What you have found out about your talent for it: a phrase, never a number. */
  readonly talent: { readonly read: AptitudeRead; readonly phrase: string };
  /** Once the talent is read: how close the stat is to its natural limit, in words; else null. */
  readonly limit: string | null;
}

export interface ShinobiView {
  readonly name: string;
  readonly familyName: string;
  readonly pronouns: Pronouns;
  readonly appearance: Look;
  readonly rank: string;
  readonly village: string;
  readonly clan: string;
  readonly kekkeiGenkai: { readonly name: string; readonly dormant: boolean } | null;
  readonly nature: string;
  readonly traits: readonly string[];
  /** The special notes on your file, as a phrase; null when it carries none. */
  readonly notes: string | null;
  /** Where they stood in their academy class. */
  readonly standing: string;
  /** Their frame and how they were raised. */
  readonly build: string | null;
  readonly upbringing: string | null;
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
  /** Injuries and chakra exhaustion you carry. */
  readonly condition: ConditionView;
  /** The weapons you know and how well, in words; null for a save that keeps none. */
  readonly weapons: string | null;
}

/** A stable registry number derived from the name, so it never changes between visits. */
function registryNumber(name: string): string {
  let hash = 0;
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) % 9000;
  return String(1000 + hash);
}

/** "Quick study", "Quick study and Night owl", "A, B and C"; null for none. */
function notesPhrase(names: readonly string[]): string | null {
  return names.length === 0 ? null : listed(names);
}

function talentRead(state: GameState, ctx: GameContext, id: StatId): StatLine['talent'] {
  const { aptitude, aptitudeKnown } = state.character;
  const text = ctx.content.text.aptitude;
  const read = aptitudeKnown[id];
  return {
    read,
    phrase: read === 'unknown' ? text.unknown : text.senses[aptitudeBand(aptitude[id])],
  };
}

function limitPhrase(state: GameState, ctx: GameContext, id: StatId, limit: number): string | null {
  const { character } = state;
  if (character.aptitudeKnown[id] === 'unknown' || character.aptitude[id] <= 0) return null;
  const read = limitRead(character.stats[id], limit);
  if (read === 'open') return null;
  return ctx.content.text.aptitude.limits[STAT_KIND[id]][read];
}

/** Their nature as they know it: named once the chakra paper has shown it. */
function natureLabel(character: GameState['character']): string {
  if (!character.natureKnown) return 'Not yet tested';
  return character.nature.charAt(0).toUpperCase() + character.nature.slice(1);
}

export function shinobiView(state: GameState, ctx: GameContext): ShinobiView {
  const { character } = state;
  const { content } = ctx;
  const { stats, startingStats } = character;
  const clan = content.clans.get(character.clanId);
  const groups: StatGroup[] = ['discipline', 'body', 'mind'];
  const limits = naturalLimits(character, ctx);
  return {
    name: character.name,
    familyName: character.familyName,
    pronouns: character.pronouns,
    // A save from before faces were chosen reads one from the character's name.
    appearance: lookOf(character.appearance, `player:${character.name}`, 'young'),
    rank: RANK_LABELS[state.standing.rank],
    village: content.locations.require(homeVillageId(state, ctx)).name,
    clan: clan?.name ?? 'No clan',
    kekkeiGenkai: clan?.kekkeiGenkai
      ? { name: clan.kekkeiGenkai.name, dormant: clan.kekkeiGenkai.dormant }
      : null,
    nature: natureLabel(character),
    traits: character.traitIds.map((id) => content.traits.get(id)?.name ?? id),
    notes: notesPhrase(character.talentIds.flatMap((id) => content.talents.get(id)?.name ?? [])),
    standing: STANDING_INFO[character.classStanding].label,
    build: content.builds.get(character.buildId)?.name ?? null,
    upbringing: content.upbringings.get(character.upbringingId)?.name ?? null,
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
        tier: statTierOf(id, stats[id]),
        talent: talentRead(state, ctx, id),
        limit: limitPhrase(state, ctx, id, limits[id]),
      })),
    })),
    // Cut, not rounded: a rating just under a grade line never reads as the line itself.
    overall: {
      ...statTier(fightingPower(stats)),
      power: Math.floor(fightingPower(stats) * 10) / 10,
    },
    condition: conditionView(state, ctx),
    weapons: weaponsKnown(character.weaponMastery),
  };
}

import { WORLD } from '@/content';
import { RANK_LABELS } from '@/systems/standing';
import { STAT_IDS, STAT_INFO, type StatGroup } from '@/systems/stats';
import { formatDate, slotName } from '@/systems/time';
import { isHungry, maxChakra, maxHealth, METER_MAX } from '@/systems/vitals';

import type { GameContext } from '../context';
import type { GameState } from '../state';

/**
 * View models: plain, display-ready data derived from GameState. The UI renders these and
 * never reaches into systems itself, so system internals can change freely.
 */

export interface Meter {
  readonly label: string;
  readonly value: number;
  readonly max: number;
}

export interface StatusView {
  readonly name: string;
  readonly rank: string;
  readonly date: string;
  readonly timeOfDay: string;
  readonly ryo: number;
  readonly meters: readonly Meter[];
  readonly warnings: readonly string[];
}

export function statusView(state: GameState): StatusView {
  const { stats, vitals } = state.character;
  const warnings: string[] = [];
  if (isHungry(vitals)) warnings.push('Hungry');
  if (vitals.energy < 20) warnings.push('Exhausted');
  if (vitals.health < maxHealth(stats) * 0.3) warnings.push('Badly hurt');

  const slot = slotName(state.time);
  return {
    name: state.character.name,
    rank: RANK_LABELS[state.standing.rank],
    date: formatDate(state.time),
    timeOfDay: slot.charAt(0).toUpperCase() + slot.slice(1),
    ryo: state.wallet.ryo,
    meters: [
      { label: 'Health', value: Math.round(vitals.health), max: maxHealth(stats) },
      { label: 'Chakra', value: Math.round(vitals.chakra), max: maxChakra(stats) },
      { label: 'Energy', value: Math.round(vitals.energy), max: METER_MAX },
      { label: 'Fullness', value: Math.round(vitals.satiety), max: METER_MAX },
    ],
    warnings,
  };
}

export interface CharacterView {
  readonly name: string;
  readonly aptitude: string;
  readonly village: string;
  readonly rank: string;
  readonly reputation: number;
  readonly missionsCompleted: number;
  readonly missionsFailed: number;
  readonly statGroups: readonly {
    readonly group: string;
    readonly stats: readonly { readonly label: string; readonly value: number }[];
  }[];
}

const GROUP_LABELS: Readonly<Record<StatGroup, string>> = {
  body: 'Body',
  mind: 'Mind',
  discipline: 'Disciplines',
};

export function characterView(state: GameState, ctx: GameContext): CharacterView {
  const groups = Object.keys(GROUP_LABELS) as StatGroup[];
  return {
    name: state.character.name,
    aptitude: ctx.content.aptitudes.get(state.character.aptitudeId)?.name ?? 'Unknown',
    village: `${WORLD.village}, ${WORLD.villageEpithet}`,
    rank: RANK_LABELS[state.standing.rank],
    reputation: state.standing.reputation,
    missionsCompleted: state.standing.missionsCompleted,
    missionsFailed: state.standing.missionsFailed,
    statGroups: groups.map((group) => ({
      group: GROUP_LABELS[group],
      stats: STAT_IDS.filter((id) => STAT_INFO[id].group === group).map((id) => ({
        label: STAT_INFO[id].label,
        value: state.character.stats[id],
      })),
    })),
  };
}

export interface JournalLine {
  readonly id: number;
  readonly day: number;
  readonly text: string;
  readonly tone: 'info' | 'success' | 'warning' | 'danger';
}

/** Newest first. */
export function journalView(state: GameState): readonly JournalLine[] {
  return [...state.journal.entries].reverse();
}

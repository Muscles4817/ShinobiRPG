import type { IconId } from '@/content';
import { STAT_INFO, trainingGain, type StatId } from '@/systems/stats';

import type { GameContext } from '../context';
import { placeHere } from '../ops';
import type { GameState } from '../state';
import { choice, type Choice } from './common';

export type DrillGroup = 'taijutsu' | 'ninjutsu' | 'genjutsu' | 'body' | 'mind';

export interface StatPreview {
  readonly label: string;
  readonly now: number;
  readonly after: number;
}

export interface Drill extends Choice {
  readonly id: string;
  readonly name: string;
  readonly spot: string;
  readonly icon: IconId;
  readonly group: DrillGroup;
  readonly energyCost: number;
  readonly previews: readonly StatPreview[];
  /** The drill you did last, offered as "Again". */
  readonly isLast: boolean;
}

export interface TrainingView {
  readonly name: string;
  readonly energy: number;
  /** How many more drills of typical cost today's energy covers. */
  readonly drillsLeft: number;
  readonly drills: readonly Drill[];
}

const DISCIPLINES: readonly StatId[] = ['taijutsu', 'ninjutsu', 'genjutsu'];

function groupOf(stats: readonly StatId[]): DrillGroup {
  const discipline = stats.find((s) => DISCIPLINES.includes(s));
  if (discipline) return discipline as DrillGroup;
  return stats.some((s) => STAT_INFO[s].group === 'body') ? 'body' : 'mind';
}

export function trainingView(state: GameState, ctx: GameContext): TrainingView | null {
  const place = placeHere(state, ctx, 'training');
  if (!place) return null;
  const { stats, vitals } = state.character;
  const lastHeading = state.journal.entries.at(-1)?.heading;
  const drills = place.trainingIds.map((id): Drill => {
    const def = ctx.content.training.require(id);
    const gained = Object.keys(def.gains) as StatId[];
    return {
      ...choice(state, ctx, { type: 'train', trainingId: id }),
      id,
      name: def.name,
      spot: def.spot,
      icon: def.icon,
      group: groupOf(gained),
      energyCost: def.energyCost,
      isLast: lastHeading === def.name,
      previews: gained.map((stat) => ({
        label: STAT_INFO[stat].label,
        now: stats[stat],
        after: stats[stat] + trainingGain(stats[stat], def.gains[stat] ?? 0),
      })),
    };
  });
  const typical = drills.reduce((sum, d) => sum + d.energyCost, 0) / Math.max(1, drills.length);
  return {
    name: place.name,
    energy: Math.round(vitals.energy),
    drillsLeft: Math.floor(vitals.energy / typical),
    drills,
  };
}

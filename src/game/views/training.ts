import type { IconId } from '@/content';
import { applyTraining, STAT_INFO, type StatId } from '@/systems/stats';
import { DISCIPLINES, type Discipline } from '@/systems/techniques';

import type { GameContext } from '../context';
import { placeHere } from '../ops';
import { assumedAptitude } from '../growth';
import { growthFor } from '../profile';
import type { GameState } from '../state';
import { choice, type Choice } from './common';
import { sparOptions, type SparOption } from './team';
import { teacherOffers, type TeacherOffer } from './teachers';

export type DrillGroup = Discipline | 'body' | 'mind';

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
  /** What the drill grows, biggest gain first: the board headlines the first. */
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
  /** People here who could train with you: your sensei first. */
  readonly teachers: readonly TeacherOffer[];
  readonly sparring: readonly SparOption[];
}

function groupOf(stats: readonly StatId[]): DrillGroup {
  const discipline = stats.find((s): s is Discipline =>
    (DISCIPLINES as readonly string[]).includes(s),
  );
  if (discipline) return discipline;
  return stats.some((s) => STAT_INFO[s].group === 'body') ? 'body' : 'mind';
}

export function trainingView(state: GameState, ctx: GameContext): TrainingView | null {
  const place = placeHere(state, ctx, 'training');
  if (!place) return null;
  const { stats, vitals } = state.character;
  const lastHeading = state.journal.entries.at(-1)?.heading;
  const growth = growthFor({ ...state.character, aptitude: assumedAptitude(state.character) }, ctx);
  const drills = place.trainingIds.map((id): Drill => {
    const def = ctx.content.training.require(id);
    const gained = Object.keys(def.gains) as StatId[];
    const after = applyTraining(stats, def.gains, growth);
    return {
      ...choice(state, ctx, { type: 'train', trainingId: id }),
      id,
      name: def.name,
      spot: def.spot,
      icon: def.icon,
      group: groupOf(gained),
      energyCost: def.energyCost,
      isLast: lastHeading === def.name,
      previews: gained
        .map((stat) => ({
          label: STAT_INFO[stat].label,
          now: stats[stat],
          after: after[stat],
        }))
        .sort((a, b) => b.after - b.now - (a.after - a.now)),
    };
  });
  const typical = drills.reduce((sum, d) => sum + d.energyCost, 0) / Math.max(1, drills.length);
  return {
    name: place.name,
    energy: Math.round(vitals.energy),
    drillsLeft: Math.floor(vitals.energy / typical),
    drills,
    teachers: teacherOffers(state, ctx),
    sparring: sparOptions(state, ctx),
  };
}

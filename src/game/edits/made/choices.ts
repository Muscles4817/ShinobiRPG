import { STAT_GRADES, STAT_INFO, type StatGrade } from '@/systems/stats';
import {
  ACCURACIES,
  DISCIPLINES,
  ELEMENTS,
  type Accuracy,
  type Discipline,
  type Element,
  type FightStat,
  type MoveDistance,
} from '@/systems/techniques';

import { BOOSTABLE } from './verbFields';

/**
 * What the forge's form offers, with the words it says them in: the arts, elements, ranks,
 * how surely it lands, the distances and the stats a power-up raises.
 */

export interface ForgeChoice<T extends string> {
  readonly id: T;
  readonly label: string;
}

const ART_LABEL: Readonly<Record<Discipline, string>> = {
  taijutsu: 'Taijutsu',
  ninjutsu: 'Ninjutsu',
  genjutsu: 'Genjutsu',
  kenjutsu: 'Kenjutsu',
  fuuinjutsu: 'Fūinjutsu',
};

const LANDS_LABEL: Readonly<Record<Accuracy, string>> = {
  sure: 'Sure: hard to slip',
  steady: 'Steady',
  wild: 'Wild: easy to slip, hits harder',
};

const BAND_LABEL: Readonly<Record<MoveDistance, string>> = {
  close: 'Close',
  mid: 'Mid',
  far: 'Far',
};

/** A value's word with its first letter raised: "wide" → "Wide". */
export function choiceLabel(value: string): string {
  return `${value[0]?.toUpperCase() ?? ''}${value.slice(1)}`;
}

export interface ForgeChoices {
  readonly arts: readonly ForgeChoice<Discipline>[];
  readonly elements: readonly ForgeChoice<Element>[];
  readonly ranks: readonly StatGrade[];
  readonly lands: readonly ForgeChoice<Accuracy>[];
  readonly bands: readonly ForgeChoice<MoveDistance>[];
  readonly boosts: readonly ForgeChoice<FightStat>[];
}

export const FORGE_CHOICES: ForgeChoices = {
  arts: DISCIPLINES.map((id) => ({ id, label: ART_LABEL[id] })),
  elements: ELEMENTS.map((id) => ({ id, label: choiceLabel(id) })),
  ranks: STAT_GRADES,
  lands: ACCURACIES.map((id) => ({ id, label: LANDS_LABEL[id] })),
  bands: (['close', 'mid', 'far'] as const).map((id) => ({ id, label: BAND_LABEL[id] })),
  boosts: BOOSTABLE.map((id) => ({ id, label: STAT_INFO[id].label })),
};

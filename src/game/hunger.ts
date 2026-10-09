import { DISCIPLINES, type Discipline } from '@/systems/techniques';
import { describeSpec, type EffectLine, type ModifierSpec } from '@/systems/modifiers';
import { hungerLevel, type HungerLevel, type Vitals } from '@/systems/vitals';

import type { GameState } from './state';

/**
 * What hunger does to you. Each stage is a ModifierSpec (slower training and study) plus how
 * much weaker you fight; starving also leaves you too weak for hard work until you eat.
 */

interface HungerEffect {
  readonly label: string;
  readonly spec: ModifierSpec;
  /** Your stats in a fight are multiplied by this. */
  readonly fightStrength: number;
  /** Too weak to train, spar or take jobs. */
  readonly tooWeak: boolean;
}

function allStudy(multiplier: number): Partial<Record<Discipline, number>> {
  return Object.fromEntries(DISCIPLINES.map((d) => [d, multiplier]));
}

const HUNGER_EFFECTS: Readonly<Record<HungerLevel, HungerEffect>> = {
  satisfied: { label: 'Satisfied', spec: {}, fightStrength: 1, tooWeak: false },
  peckish: { label: 'Peckish', spec: { training: 0.9 }, fightStrength: 1, tooWeak: false },
  hungry: {
    label: 'Hungry',
    spec: { training: 0.6, studyDiscipline: allStudy(0.75) },
    fightStrength: 0.85,
    tooWeak: false,
  },
  starving: {
    label: 'Starving',
    spec: { training: 0.4, studyDiscipline: allStudy(0.5) },
    fightStrength: 0.7,
    tooWeak: true,
  },
};

export const TOO_WEAK_FROM_HUNGER = 'Too weak from hunger. Eat something first.';

export function hungerEffect(vitals: Pick<Vitals, 'satiety'>): HungerEffect {
  return HUNGER_EFFECTS[hungerLevel(vitals)];
}

/** Why hunger stops you doing hard work right now, or null. */
export function weakFromHunger(state: GameState): string | null {
  return hungerEffect(state.character.vitals).tooWeak ? TOO_WEAK_FROM_HUNGER : null;
}

/** Everything hunger is doing to you, worded for chips. Empty when you're satisfied. */
export function hungerLines(vitals: Pick<Vitals, 'satiety'>): EffectLine[] {
  const effect = hungerEffect(vitals);
  const weaker = Math.round((1 - effect.fightStrength) * 100);
  return [
    ...describeSpec(effect.spec),
    ...(weaker > 0 ? [{ label: `${weaker}% weaker in fights`, tone: 'cost' as const }] : []),
    ...(effect.tooWeak
      ? [
          { label: 'Health drains', tone: 'cost' as const },
          { label: 'Can’t train, spar or take jobs', tone: 'cost' as const },
        ]
      : []),
  ];
}

import { INJURY_SITE_LABELS, type InjuryDef } from '@/content';
import { daysLeft, isExhausted, type Injury } from '@/systems/injuries';
import { describeSpec, type EffectLine } from '@/systems/modifiers';
import { STAT_INFO, type StatId } from '@/systems/stats';

import type { GameContext } from '../context';
import { injuriesOf } from '../injuries';
import type { GameState } from '../state';

/** Your injuries and chakra exhaustion, worded for the Shinobi screen and the hospital. */

export interface InjuryLine {
  readonly id: string;
  readonly name: string;
  /** Where it hurts, e.g. "Ribs". */
  readonly where: string;
  readonly description: string;
  /** "3 days left", for a chip. */
  readonly left: string;
  readonly treated: boolean;
  /** What it does, for chips. */
  readonly effects: readonly EffectLine[];
}

export interface ConditionView {
  readonly injuries: readonly InjuryLine[];
  /** Chakra exhaustion, or null when you're rested. */
  readonly exhaustion: { readonly left: string; readonly effects: readonly EffectLine[] } | null;
}

function count(n: number, one: string, many: string): string {
  return n === 1 ? `1 ${one}` : `${n} ${many}`;
}

function fightLines(def: InjuryDef, injury: Injury): EffectLine[] {
  const weaker = (Object.entries(def.fight) as [StatId, number][]).map(([stat, m]) => ({
    label: `${STAT_INFO[stat].label} ${Math.round((1 - m) * 100)}% weaker in fights`,
    tone: 'cost' as const,
  }));
  const strain = injury.strain
    ? [
        {
          label: `${STAT_INFO[injury.strain.stat].label} −${injury.strain.amount} in fights`,
          tone: 'cost' as const,
        },
      ]
    : [];
  return [...weaker, ...strain];
}

function injuryLine(injury: Injury, def: InjuryDef, day: number): InjuryLine {
  return {
    id: `${injury.injuryId}@${injury.until}`,
    name: def.name,
    where: INJURY_SITE_LABELS[def.where],
    description: def.description,
    left: `${count(daysLeft(injury, day), 'day', 'days')} left`,
    treated: injury.treated === true,
    effects: [
      ...describeSpec(def.modifiers),
      ...fightLines(def, injury),
      ...(def.bedridden
        ? [{ label: 'Can’t train, spar or take jobs', tone: 'cost' as const }]
        : []),
    ],
  };
}

export function conditionView(state: GameState, ctx: GameContext): ConditionView {
  const { character, time } = state;
  const { exhaustion } = character;
  return {
    injuries: injuriesOf(character, ctx).map(({ injury, def }) =>
      injuryLine(injury, def, time.day),
    ),
    exhaustion:
      exhaustion && isExhausted(exhaustion, time.day)
        ? {
            left: `${count(daysLeft(exhaustion, time.day), 'night', 'nights')} left`,
            effects: [
              {
                label: `Sleep brings back ${Math.round(exhaustion.refill * 100)}% of your chakra`,
                tone: 'cost',
              },
            ],
          }
        : null,
  };
}

import type { InjuryDef } from '@/content';
import { chakraAfterSleep, healedBy, isExhausted, type Injury } from '@/systems/injuries';
import { write } from '@/systems/journal';
import type { ModifierSpec } from '@/systems/modifiers';
import { STAT_IDS, type StatId } from '@/systems/stats';
import { maxChakra } from '@/systems/vitals';

import type { GameContext } from './context';
import type { Character, GameState } from './state';

/**
 * What the injuries you carry do to you, built like hunger: each one's ModifierSpec slows
 * training and study, its fight multipliers (and a trump's strain) weaken your stats in a
 * fight, and a bed-rest injury keeps you from hard work. Injuries heal when the morning they
 * are due comes round (`healInjuries`, called as time passes).
 */

export const LAID_UP = 'The medics ordered you to bed. Rest until you heal.';

/** The definitions of the injuries you carry, paired with each record. */
export function injuriesOf(
  character: Pick<Character, 'injuries'>,
  ctx: GameContext,
): { readonly injury: Injury; readonly def: InjuryDef }[] {
  return character.injuries.flatMap((injury) => {
    const def = ctx.content.injuries.get(injury.injuryId);
    return def ? [{ injury, def }] : [];
  });
}

/** One ModifierSpec per injury, for `characterModifiers`. */
export function injurySpecs(
  character: Pick<Character, 'injuries'>,
  ctx: GameContext,
): ModifierSpec[] {
  return injuriesOf(character, ctx).map(({ def }) => def.modifiers);
}

/** How your injuries change each stat in a fight: a multiplier, then a flat strain. */
export interface InjuryFightEffect {
  readonly scale: Readonly<Record<StatId, number>>;
  readonly strain: Readonly<Record<StatId, number>>;
}

export function injuryFightEffect(
  character: Pick<Character, 'injuries'>,
  ctx: GameContext,
): InjuryFightEffect {
  const carried = injuriesOf(character, ctx);
  const scale = Object.fromEntries(
    STAT_IDS.map((id) => [id, carried.reduce((m, { def }) => m * (def.fight[id] ?? 1), 1)]),
  ) as Record<StatId, number>;
  const strain = Object.fromEntries(
    STAT_IDS.map((id) => [
      id,
      carried.reduce(
        (sum, { injury }) => sum + (injury.strain?.stat === id ? injury.strain.amount : 0),
        0,
      ),
    ]),
  ) as Record<StatId, number>;
  return { scale, strain };
}

/**
 * Tonight's chakra: a full refill, or only part of it while chakra exhaustion holds. Read
 * before the night passes, since the exhaustion may lift by morning.
 */
export function sleepChakra(state: GameState): {
  readonly chakra: number;
  readonly partial: boolean;
} {
  const { vitals, stats, exhaustion } = state.character;
  const partial = isExhausted(exhaustion, state.time.day);
  const target = chakraAfterSleep(vitals, maxChakra(stats), {
    state: exhaustion,
    day: state.time.day,
  });
  return { chakra: target - vitals.chakra, partial };
}

/** Why your injuries stop you doing hard work right now, or null. */
export function laidUp(state: GameState, ctx: GameContext): string | null {
  return injuriesOf(state.character, ctx).some(({ def }) => def.bedridden) ? LAID_UP : null;
}

/**
 * Lets injuries heal and exhaustion pass once the day has turned, with a journal line for
 * each injury you are rid of.
 */
export function healInjuries(state: GameState, ctx: GameContext): GameState {
  const { character, time } = state;
  const { hurting, healed } = healedBy(character.injuries, time.day);
  const rested = isExhausted(character.exhaustion, time.day) ? character.exhaustion : null;
  if (healed.length === 0 && rested === character.exhaustion) return state;
  const healedLines = healed.reduce((j, injury) => {
    const name = ctx.content.injuries.get(injury.injuryId)?.name ?? 'Your injury';
    return write(j, time, {
      heading: `${name} healed`,
      text: 'You wake without the ache. Your body is your own again.',
      tone: 'success',
    });
  }, state.journal);
  const journal =
    character.exhaustion && !rested
      ? write(healedLines, time, {
          heading: 'Chakra exhaustion passed',
          text: 'The exhaustion has lifted. Your next sleep will bring your chakra all the way back.',
          tone: 'success',
        })
      : healedLines;
  return {
    ...state,
    journal,
    character: { ...character, injuries: hurting, exhaustion: rested },
  };
}

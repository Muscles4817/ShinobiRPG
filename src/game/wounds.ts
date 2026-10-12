import type { Rng } from '@/core';
import type { InjuryCause, InjuryDef } from '@/content';
import {
  addExhaustion,
  pickInjury,
  recoveryDays,
  type Exhaustion,
  type Injury,
} from '@/systems/injuries';
import { STAT_INFO, type StatId } from '@/systems/stats';

import type { GameContext } from './context';
import { chip, log } from './ops';
import type { GameState } from './state';

/**
 * Getting hurt: picks a named injury for a cause, shortens it by your stamina, adds it to the
 * character with a journal line, and adds chakra exhaustion. Every source of harm (defeat, a
 * trump card's price, ending a fight drained) goes through here.
 */

function days(n: number): string {
  return n === 1 ? '1 day' : `${n} days`;
}

/** Injuries of one cause, as weighted candidates for `pickInjury`. */
export function injuriesFor(ctx: GameContext, cause: InjuryCause): InjuryDef[] {
  return ctx.content.injuries.all.filter((i) => i.causes.includes(cause));
}

/** A strain injury that weakens this stat in fights (the worst-hit first), else any strain. */
export function strainInjuryFor(ctx: GameContext, stat: StatId): InjuryDef | null {
  const strains = injuriesFor(ctx, 'strain');
  const matching = strains
    .filter((i) => (i.fight[stat] ?? 1) < 1)
    .sort((a, b) => (a.fight[stat] ?? 1) - (b.fight[stat] ?? 1));
  return matching[0] ?? strains[0] ?? null;
}

export interface Wound {
  readonly def: InjuryDef;
  /** Days before stamina shortens them; the injury's own when absent. */
  readonly days?: number;
  readonly strain?: Injury['strain'];
}

/** A journal line's words: the story (no numbers) and, optionally, a heading of its own. */
export interface WoundNote {
  readonly text: string;
  readonly heading?: string;
}

/** Adds an injury, shortened by stamina, with a journal line headed by its name or the note's. */
export function inflict(state: GameState, wound: Wound, note: WoundNote): GameState {
  const { character, time } = state;
  const lasts = recoveryDays(wound.days ?? wound.def.days, character.stats.stamina);
  const injury: Injury = {
    injuryId: wound.def.id,
    until: time.day + lasts,
    ...(wound.strain ? { strain: wound.strain } : {}),
  };
  const hurt = { ...state, character: { ...character, injuries: [...character.injuries, injury] } };
  return log(hurt, {
    heading: note.heading ?? wound.def.name,
    text: note.text,
    tone: 'danger',
    chips: [
      ...(note.heading ? [chip(wound.def.name, 'harm')] : []),
      chip(`${days(lasts)} to heal`, 'harm'),
      ...(wound.strain
        ? [chip(`${STAT_INFO[wound.strain.stat].label} −${wound.strain.amount} in fights`, 'harm')]
        : []),
    ],
  });
}

/** Picks an injury of a cause, weighted by `beating` (0 a narrow loss, 1 a rout). */
export function rollInjury(
  ctx: GameContext,
  cause: InjuryCause,
  beating: number,
  rng: Rng,
): InjuryDef | null {
  const candidates = injuriesFor(ctx, cause);
  const id = pickInjury(candidates, beating, rng);
  return candidates.find((i) => i.id === id) ?? null;
}

/** Leaves you chakra-exhausted for `nights` nights (stacking with any exhaustion already). */
export function exhaust(
  state: GameState,
  spell: { readonly nights: number; readonly refill: number },
  note: WoundNote,
): GameState {
  const { character, time } = state;
  const added: Exhaustion = { until: time.day + spell.nights, refill: spell.refill };
  const exhaustion = addExhaustion(character.exhaustion, added);
  return log(
    { ...state, character: { ...character, exhaustion } },
    {
      heading: note.heading ?? 'Chakra exhaustion',
      text: note.text,
      tone: 'warning',
      chips: [chip(`${days(spell.nights)} of poor recovery`, 'cost')],
    },
  );
}

import type { Waters } from '@/content';
import { describeSpec, type EffectLine } from '@/systems/modifiers';

import { bathers, SOAK_OUTING } from '../actions/onsen';
import type { GameContext } from '../context';
import { SOAK_ENERGY, SOAK_HEALTH, WARM_THROUGH } from '../onsen';
import { placeHere } from '../ops';
import type { GameState } from '../state';
import { closedSign } from '../village';
import { choice, type Choice } from './common';
import { companion, toneRead, type Companion, type ToneRead } from './outings';

/**
 * The hot water: the keeper's token, what a soak gives back and leaves you with, and who is
 * already in the water to soak beside.
 */
export interface OnsenView {
  readonly name: string;
  readonly keeper: string;
  readonly blurb: string;
  readonly waters: Waters;
  readonly closed: string | null;
  readonly soakCost: number;
  readonly energy: number;
  readonly health: number;
  /** What a soak leaves you with until the day ends, as chips. */
  readonly warmth: readonly EffectLine[];
  /** Already soaked today: you're warm through. */
  readonly soaked: boolean;
  readonly alone: Choice;
  readonly bathers: readonly Bather[];
}

export interface Bather extends Companion {
  readonly soak: Choice;
  /** Whether a quiet hour is their kind of thing, once you know their tastes. */
  readonly read: ToneRead;
}

export function onsenView(state: GameState, ctx: GameContext): OnsenView | null {
  const onsen = placeHere(state, ctx, 'onsen');
  if (!onsen) return null;
  return {
    name: onsen.name,
    keeper: onsen.keeper,
    blurb: onsen.blurb,
    waters: onsen.waters,
    closed: closedSign(onsen.hours, state),
    soakCost: onsen.soakCost,
    energy: SOAK_ENERGY,
    health: SOAK_HEALTH,
    warmth: describeSpec(WARM_THROUGH),
    soaked: state.character.soaked === true,
    alone: choice(state, ctx, { type: 'soak', withId: null }),
    bathers: bathers(state, ctx).map((person) => ({
      ...companion(state, person),
      soak: choice(state, ctx, { type: 'soak', withId: person.id }),
      read: toneRead(state, ctx, person, SOAK_OUTING.tone),
    })),
  };
}

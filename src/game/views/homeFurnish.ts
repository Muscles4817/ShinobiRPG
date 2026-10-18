import type { Spot } from '@/content';

import { COMFORT_STEPS, comfortStep, currentHome } from '../home/home';
import type { GameContext } from '../context';
import type { GameState } from '../state';
import { choice, type Choice } from './common';
import { effectLine, SPOT_LABEL } from './lettings';

/**
 * Furnishing the home you live in: each of its spots with what stands there and the pieces you
 * own that could, and how like home it feels. New pieces come from the joiner at the lettings
 * office, or as gifts.
 */

export interface SpotOption {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly does: string;
  readonly placed: boolean;
  readonly place: Choice;
}

export interface SpotView {
  readonly spot: Spot;
  readonly label: string;
  /** What stands there, or null when empty. */
  readonly piece: string | null;
  readonly options: readonly SpotOption[];
}

export interface FurnishView {
  readonly spots: readonly SpotView[];
  readonly comfort: {
    readonly steps: readonly string[];
    readonly at: number;
    readonly line: string;
  };
}

const COMFORT_LINE: readonly string[] = [
  'A room you sleep in, not a home yet. Every piece you add makes it more yours, and friends notice when they come to dinner.',
  'Starting to look lived in. Guests notice.',
  'Comfortable: people stay a little longer after dinner.',
  'Homely. Friends drop by without being asked.',
  'A real home. Nobody leaves your table early.',
];

export function furnishView(state: GameState, ctx: GameContext): FurnishView {
  const { spots } = currentHome(state, ctx);
  const owned = state.housing.furniture.flatMap((id) => ctx.content.furnishings.get(id) ?? []);
  const at = comfortStep(state, ctx);
  return {
    spots: spots.map((spot) => {
      const here = state.housing.placed[spot];
      return {
        spot,
        label: SPOT_LABEL[spot],
        piece: (here && ctx.content.furnishings.get(here)?.name) ?? null,
        options: owned
          .filter((p) => p.spot === spot)
          .map((p) => ({
            id: p.id,
            name: p.name,
            description: p.description,
            does: effectLine(p.effect),
            placed: here === p.id,
            place: choice(state, ctx, { type: 'placeFurnishing', furnishingId: p.id }),
          })),
      };
    }),
    comfort: { steps: COMFORT_STEPS, at, line: COMFORT_LINE[at] ?? '' },
  };
}

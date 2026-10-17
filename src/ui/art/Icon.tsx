import type { ReactNode } from 'react';

import type { IconId } from '@/game';

import { FOOD_ICONS } from './icons/food';
import { KIT_ICONS } from './icons/kit';
import { PLACE_ICONS } from './icons/places';

/**
 * 32×32 two-tone drawings: an outline in currentColor, so each icon takes the ink of where it
 * sits, over fills of natural colour (the bowl's lacquer, the tea's green). Readable at 14px,
 * rich at 30px.
 */
const DRAWINGS: Readonly<Record<IconId, ReactNode>> = {
  ...PLACE_ICONS,
  ...FOOD_ICONS,
  ...KIT_ICONS,
};

interface IconProps {
  readonly id: IconId;
  readonly size?: number;
}

export function Icon({ id, size = 22 }: IconProps) {
  return (
    <svg
      className="icon"
      viewBox="0 0 32 32"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {DRAWINGS[id]}
    </svg>
  );
}

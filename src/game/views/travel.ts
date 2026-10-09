import type { BackdropId } from '@/content';

import type { GameContext } from '../context';
import type { GameState } from '../state';
import { choice, type Choice } from './common';

export interface Destination extends Choice {
  readonly id: string;
  readonly name: string;
  readonly epithet: string;
  readonly backdrop: BackdropId;
  readonly here: boolean;
  readonly days: number;
  readonly cost: number;
  readonly danger: string;
  readonly lockedReason: string | null;
}

export function travelView(state: GameState, ctx: GameContext): readonly Destination[] {
  return ctx.content.locations.all.map((l) => ({
    ...choice(state, ctx, { type: 'travel', locationId: l.id }),
    id: l.id,
    name: l.name,
    epithet: l.epithet,
    backdrop: l.backdrop,
    here: l.id === state.locationId,
    days: l.travel.days,
    cost: l.travel.cost,
    danger: l.travel.danger,
    lockedReason: l.travel.lockedReason ?? null,
  }));
}
